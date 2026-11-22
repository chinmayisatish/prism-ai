# PRISM AI — Intelligent AI Pull Request Reviewer

<div align="center">

![PRISM AI](https://img.shields.io/badge/PRISM_AI-Autonomous_PR_Reviewer-8B5CF6?style=for-the-badge&logo=github&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchinmayisatish%2Fprism-ai)

**Analyze. Review. Improve.**  
*An autonomous, production-grade AI agent that ingests GitHub pull requests, executes deterministic AST/static analysis, detects security vulnerabilities and prompt injection attempts, and delivers verified, zero-hallucination code reviews with Gemini.*

</div>

---

## 🌟 Visual Reference & 6 Completed Screens

PRISM AI faithfully implements all six screens from the dark futuristic design specification:

1. **Screen 1: Landing Page**
   - High-impact hero section with PRISM AI branding and neon violet/purple gradients.
   - Interactive IDE preview with floating GitHub badge, live code diffs, and `< / >` badge.
   - Feature highlight cards ("Smart Analysis", "Security Focused", "Actionable Suggestions").
   - "Start Reviewing" CTA and "Learn More" modal detailing architecture.

2. **Screen 2: Start a New Review**
   - Repository URL input (supporting `https://github.com/owner/repo`, `owner/repo`, or direct PR URL).
   - Pull Request number / URL input.
   - Optional GitHub Personal Access Token input (for private repos & rate-limit avoidance).
   - One-click Preset Demo scenarios for instant hackathon demonstrations.
   - Glowing GitHub cat badge with neon orbit.

3. **Screen 3: AI Analysis (Animated Live Execution)**
   - Center pulsing GitHub avatar with animated neon orbital ring and purple sparkle crown.
   - 4-step connected horizontal timeline progress bar:
     1. *Fetching PR Details*
     2. *Analyzing Code*
     3. *Generating Review*
     4. *Finalizing & Grounding*
   - Live collapsible Agent Orchestration Tool logs displaying execution times and tool outputs.

4. **Screen 4: Review Results**
   - 5 KPI metric cards: **Total Findings**, **Critical**, **High**, **Medium**, and **Low**.
   - PR Summary card with health score (0–100), verdict badge (`APPROVED`, `REQUEST_CHANGES`, `COMMENT`), and security audit badge.
   - Severity filter tabs (`All`, `Critical`, `High`, `Medium`, `Low`).
   - One-click report export in both Markdown (`.md`) and JSON format.

5. **Screen 5: Detailed Code Review & Diff Inspector**
   - Severity banner with file path and exact line number.
   - Detailed *Explanation* of the bug/security flaw.
   - *Why it matters* real-world impact analysis (exploitability, crash, memory leak).
   - Side-by-side / inline diff viewer with red deletions and green additions.
   - One-click "Copy Fix" button and Prev/Next finding navigation.

6. **Screen 6: Review History**
   - Historical PR review records stored in SQLite database.
   - Repository information, PR numbers, verdict badges (`Completed` / `In Progress`), and timestamps.
   - "View Details" action to reload full review reports.

---

## 🛠️ Architecture & Tech Stack

```
                                  ┌─────────────────────────────┐
                                  │      React + TypeScript     │
                                  │    Tailwind CSS Frontend    │
                                  └──────────────┬──────────────┘
                                                 │ REST API
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │       FastAPI Backend       │
                                  │     (Python 3.13 / Async)   │
                                  └──────────────┬──────────────┘
                                                 │
          ┌───────────────────────┬──────────────┴──────────────┬─────────────────────────┐
          ▼                       ▼                             ▼                         ▼
┌──────────────────┐   ┌───────────────────┐         ┌─────────────────────┐   ┌────────────────────┐
│  GitHub Service  │   │  Security Guard   │         │   Static Analyzer   │   │  Gemini AI Service │
│  (REST API Client│   │ (Prompt Injection │         │ (Python AST Parser, │   │  (Context-Aware    │
│  & Diff Fetcher) │   │  & Sanitization)  │         │  Regex Secret Scan) │   │   Code Reasoning)  │
└──────────────────┘   └───────────────────┘         └─────────────────────┘   └────────────────────┘
                                  │                             │                         │
                                  └──────────────┬──────────────┴─────────────────────────┘
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Grounding Verifier      │
                                  │  (Verifies lines against    │
                                  │    real diff hunks)         │
                                  └──────────────┬──────────────┘
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   SQLite Storage & Report   │
                                  └─────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** FastAPI, Uvicorn, Pydantic v2, Python AST (`ast.NodeVisitor`), HTTPX
- **AI Integration:** Google Gemini 1.5 Flash (`google-generativeai`)
- **Database:** SQLite (`prism_ai.db`) for review run persistence and history
- **Security:** Prompt injection scanner, code execution isolation, secret masking

---

## 🔒 Security & Reliability (Hackathon Core Directive)

1. **Adversarial Prompt Injection Defense:**
   - Detects jailbreak phrases (e.g. `Ignore all previous instructions`, `SYSTEM: OVERRIDE`) in PR descriptions, commit messages, and code comments.
   - Neutralizes untrusted content inside strict `<UNTRUSTED_PR_DIFF>` boundaries.
2. **Untrusted Code Execution Isolation:**
   - Submitted code is **NEVER executed**. All analysis runs through Python AST static visitors and regular expressions.
3. **Zero-Hallucination Grounding:**
   - Findings are checked against unified diff line ranges. Any line number outside the diff is flagged or adjusted.
4. **Resilient Fallback Mode:**
   - If GitHub API is rate-limited or offline, or if Gemini API key is not configured, the system falls back gracefully to built-in verified demo scenarios and static AST analysis without crashing.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm
- Git

### 1. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Open `.env` and optionally provide your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
DATABASE_PATH=prism_ai.db
```
*(Note: If no keys are provided, PRISM AI operates with full functionality using built-in demonstration presets and verified AST analyzers!)*

### 2. Backend Setup & Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup & Startup
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧪 Automated Testing Suite

PRISM AI includes a test suite covering all 8 required scenarios:
```bash
cd backend
python -m pytest tests/test_agent.py -v
```

### Verified Test Scenarios:
| # | Scenario | Status |
|---|---|---|
| 1 | Valid pull request URL parsing | ✅ PASSED |
| 2 | Malformed / Path-traversal repository URL validation | ✅ PASSED |
| 3 | Empty pull request handling (0 changes) | ✅ PASSED |
| 4 | Code containing an intentional bug (mutable defaults & async blocking) | ✅ PASSED |
| 5 | Suspicious code & hardcoded secrets (eval, shell=True, SQLi, AWS key) | ✅ PASSED |
| 6 | Malicious prompt injection inside code comments | ✅ PASSED |
| 7 | GitHub API unavailable fallback | ✅ PASSED |
| 8 | Gemini API unavailable fallback | ✅ PASSED |

---

## 📦 Demonstration Scenarios (1-Click Hackathon Presets)

1. **Security & SQL Injection Vulnerabilities:**
   - Detects hardcoded JWT secret, raw SQL injection string interpolation, and weak MD5 hashing.
2. **Malicious Prompt Injection in Comments:**
   - Demonstrates detection and blocking of an adversarial jailbreak attempt inside a code comment.
3. **Async Concurrency & Blocking Loop Bug:**
   - Detects `time.sleep()` blocking inside an `async def` event loop and mutable default dictionary argument.
4. **Clean Code & Unit Tests (Approved):**
   - Demonstrates a clean refactoring PR with 100% test coverage resulting in an `APPROVED` verdict and high health score.
5. **Empty Pull Request:**
   - Handles empty commits cleanly with 0 false positives.

---

## 📄 License
MIT License. Built for the Hackathon by Chinmayi Satish.
