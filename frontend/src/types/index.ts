export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export type FindingCategory = 
  | "Security" 
  | "Bug" 
  | "Code Quality" 
  | "Performance" 
  | "Error Handling" 
  | "Maintainability";

export type Verdict = "APPROVED" | "REQUEST_CHANGES" | "COMMENT";

export interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  raw_url?: string;
}

export interface PRDetails {
  repo_owner: string;
  repo_name: string;
  pr_number: number;
  title: string;
  body?: string;
  author: string;
  author_avatar?: string;
  state: string;
  base_branch: string;
  head_branch: string;
  commits_count: number;
  additions: number;
  deletions: number;
  changed_files_count: number;
  is_mock: boolean;
  html_url: string;
}

export interface CodeFinding {
  id: string;
  file_path: string;
  line_number?: number;
  severity: Severity;
  category: FindingCategory;
  title: string;
  explanation: string;
  why_it_matters: string;
  suggested_fix: string;
  diff_snippet?: string;
  is_verified: boolean;
  source: string;
}

export interface AgentStep {
  step_number: number;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "warning";
  tool_called?: string;
  details: string;
  execution_time_ms?: number;
}

export interface SecurityAudit {
  prompt_injection_detected: boolean;
  prompt_injection_details?: string;
  code_execution_blocked: boolean;
  untrusted_input_sanitized: boolean;
  input_validation_passed: boolean;
  warnings: string[];
}

export interface ReviewReport {
  review_id: string;
  created_at: string;
  pr_details: PRDetails;
  verdict: Verdict;
  health_score: number;
  executive_summary: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: CodeFinding[];
  agent_steps: AgentStep[];
  security_audit: SecurityAudit;
  changed_files: ChangedFile[];
  is_mock: boolean;
  model_used: string;
}

export interface HistoryItem {
  review_id: string;
  repo_owner: string;
  repo_name: string;
  pr_number: number;
  title: string;
  verdict: string;
  health_score: number;
  findings_count: number;
  critical_count: number;
  high_count: number;
  is_mock: boolean;
  created_at: string;
}

export interface DemoItem {
  id: string;
  name: string;
  description: string;
  repo: string;
  pr_number: number;
}

export type ScreenType = 
  | "landing" 
  | "new-review" 
  | "analysis" 
  | "results" 
  | "finding-detail" 
  | "history" 
  | "settings";
