import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './screens/LandingPage';
import { NewReviewScreen } from './screens/NewReviewScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ReviewResultsScreen } from './screens/ReviewResultsScreen';
import { DetailedFindingScreen } from './screens/DetailedFindingScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import type { 
  ScreenType, ReviewReport, CodeFinding, HistoryItem, DemoItem, AgentStep 
} from './types';
import { 
  submitReview, fetchRecentReviews, fetchReviewById, fetchDemoPresets 
} from './api/client';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<CodeFinding | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [demoPresets, setDemoPresets] = useState<DemoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [liveAgentSteps, setLiveAgentSteps] = useState<AgentStep[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [demos, history] = await Promise.all([
        fetchDemoPresets(),
        fetchRecentReviews(),
      ]);
      setDemoPresets(demos);
      setHistoryItems(history);
    } catch (e) {
      console.warn("Could not load initial presets or history:", e);
    }
  };

  const handleStartReviewFromLanding = () => {
    setCurrentScreen('new-review');
  };

  const handleStartAnalysis = async (
    repoUrl: string, 
    prNumber?: number, 
    githubToken?: string, 
    demoId?: string
  ) => {
    setIsLoading(true);
    setCurrentScreen('analysis');
    setAnalysisStepIndex(0);
    setLiveAgentSteps([]);
    setGlobalError(null);

    // Simulated progress timer while real agent runs asynchronously
    const progressTimer = setInterval(() => {
      setAnalysisStepIndex((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 900);

    try {
      const resultReport = await submitReview(repoUrl, prNumber, githubToken, demoId);
      clearInterval(progressTimer);
      setAnalysisStepIndex(3);
      setLiveAgentSteps(resultReport.agent_steps || []);
      setReport(resultReport);

      // Refresh history list so newly completed review appears in Screen 6
      fetchRecentReviews().then(setHistoryItems).catch(() => {});

      // Short delay for visual polish on final step
      setTimeout(() => {
        setIsLoading(false);
        setCurrentScreen('results');
      }, 700);
    } catch (err: any) {
      clearInterval(progressTimer);
      setIsLoading(false);
      setGlobalError(err.message || 'Review execution encountered an error.');
      setCurrentScreen('new-review');
    }
  };

  const handleSelectHistoryReview = async (reviewId: string) => {
    setIsLoading(true);
    try {
      const fetchedReport = await fetchReviewById(reviewId);
      setReport(fetchedReport);
      setCurrentScreen('results');
    } catch (e: any) {
      alert(`Could not load review ${reviewId}: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFinding = (finding: CodeFinding) => {
    setSelectedFinding(finding);
    setCurrentScreen('finding-detail');
  };

  // Render the Screen content based on currentScreen
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onStartReviewing={handleStartReviewFromLanding} />;

      case 'new-review':
        return (
          <NewReviewScreen
            onStartAnalysis={handleStartAnalysis}
            demoPresets={demoPresets}
            isLoading={isLoading}
          />
        );

      case 'analysis':
        return (
          <AnalysisScreen
            currentStepIndex={analysisStepIndex}
            agentSteps={liveAgentSteps}
          />
        );

      case 'results':
        if (!report) {
          return (
            <div className="p-12 text-center text-slate-400">
              No review data available. Please start a new review.
            </div>
          );
        }
        return (
          <ReviewResultsScreen
            report={report}
            onBack={() => setCurrentScreen('new-review')}
            onSelectFinding={handleSelectFinding}
          />
        );

      case 'finding-detail':
        if (!selectedFinding || !report) {
          return (
            <div className="p-12 text-center text-slate-400">
              No finding selected.
            </div>
          );
        }
        return (
          <DetailedFindingScreen
            finding={selectedFinding}
            allFindings={report.findings}
            onBack={() => setCurrentScreen('results')}
            onSelectFinding={(f) => setSelectedFinding(f)}
          />
        );

      case 'history':
        return (
          <HistoryScreen
            historyItems={historyItems}
            onSelectReview={handleSelectHistoryReview}
            onRefresh={() => fetchRecentReviews().then(setHistoryItems)}
          />
        );

      case 'settings':
        return <SettingsScreen />;

      default:
        return <LandingPage onStartReviewing={handleStartReviewFromLanding} />;
    }
  };

  // If on landing screen, show full-bleed landing page without sidebar
  if (currentScreen === 'landing') {
    return <LandingPage onStartReviewing={handleStartReviewFromLanding} />;
  }

  // Dashboard layout for screens 2, 3, 4, 5, 6, and settings
  return (
    <div className="flex min-h-screen bg-[#07070D] text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Persistent Left Sidebar Matching Visual Reference */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          if (screen === 'new-review') {
            setGlobalError(null);
          }
          setCurrentScreen(screen);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header onOpenSettings={() => setCurrentScreen('settings')} />

        {globalError && (
          <div className="mx-8 mt-4 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="font-bold ml-4 text-red-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        <main className="flex-1 flex flex-col">
          {renderScreenContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
