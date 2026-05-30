# 🚀 CareerAI Agent — Autonomous Internship Finder & ATS Resume Tailor

CareerAI is a fully autonomous internship discovery, match evaluation, and profile optimization platform designed to find remote software engineering roles and instantly customize ATS-friendly resumes. 

The system automates the tedious scraping, parsing, filtering, and scoring processes, while offering a live, interactive split-screen resume tailoring workspace.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    A["User Dashboard (index.html)"] -->|Start Scraper Queue| B("Express API Server & Queue Workers")
    B -->|Trigger Playwright automation| C["Scraper Workers (LinkedIn & Internshala)"]
    C -->|Insert raw postings (Status: NEW)| D[("Database (SQLite / PostgreSQL)")]
    
    D -->|Add to Matcher Queue| E("AI Matcher Engine")
    E -->|Evaluate Profile against JD| F{"AIService (Gemini)"}
    F -->|Success| G["Gemini 2.5 Flash API"]
    F -->|429 Rate Limit / No Key| H["Local Synonym Heuristic Matcher"]
    
    G -->|Calculate ATS Score & Reasoning| I["Update Job Status (MATCHED / REJECTED)"]
    H -->|Calculate ATS Score & Reasoning| I
    I -->|Persist to DB| D
    
    A -->|Synchronize Status & Deletions| B
    
    J["Resume Builder UI (/resume.html)"] -->|Select Matched Job / Paste Custom JD| K("Tailoring Engine")
    K -->|Supply Current Projects & Live/GitHub Links| L["Gemini Resume Tailoring API"]
    L -->|Generate Summary, XYZ Bullets, Skills & ATS Score| J
    J -->|Interactive Inline Editing| M["Live Resume Paper Preview"]
    M -->|Download DOCX / Print PDF| N["Recruiter-Ready Document"]
```

---

## 🌟 Key Features

### 1. 🔍 Dual-Platform Playwright Scraper
* **LinkedIn Scraper:** Authenticates, searches, and extracts remote software engineering internships based on configurable locations and roles.
* **Internshala Scraper:** Automatically normalizes engineering query terms and scrapes fresh postings matching frontend, backend, or full-stack opportunities.
* **Worker Queue:** Operates asynchronously via an in-memory queue worker pattern to handle requests sequentially without slowing down the Express web server.

### 2. 🧠 Resilient Hybrid Match Evaluation Engine
* **Double-Field Analysis:** Evaluates the target job using *both* the scraped title and description together (resolves matches on brief/truncated scraped entries).
* **Gemini 2.5 Flash:** Automatically generates a detailed ATS compatibility score (0-100), itemized reasoning, and missing skill highlights.
* **Local Synonym Fallback Matcher:** Prevents system failures or zero-score drop-outs when Gemini API keys exceed their free tier quota (429 errors) or aren't set. It uses a structured category classifier (Frontend/Web, Backend/Database, SDE/Core CS) to calculate a smart, relative score.

### 3. 📄 Interactive Split-Screen ATS Resume Builder (`/resume.html`)
* **Matched Opportunity Loader:** Clicking "Tailor Resume" on any internship from the tracker pre-fills the job's title, company, and description.
* **Dynamic Project Tailoring:** Requires you to specify your current projects, their technology stacks, and live deployment + GitHub links *before* optimizing, ensuring complete accuracy.
* **ATS Google XYZ-Formula Writer:** Rewrites your project details in the recruiter-proven Google format: *"Accomplished X, measured by Y, by doing Z."*
* **Live Inline Editor:** The right-hand paper preview is fully `contenteditable`. Click on any tailored summary, skill badge, or project description bullet point to edit it instantly in-place.
* **Multi-Format Export:** Downloads a clean, single-column, recruiter-safe Word (`.docx`) file styling engine or prints directly to PDF.

### 4. 📊 Real-Time Application Tracker
* **Two-Way Synchronization:** Changes in job status dropdowns (Not Applied, Applied, Interview, Offer, Rejected) instantly update the database.
* **Clean Exclusions:** Rejecting or deleting an opportunity in the UI persists its status as `REJECTED` in the database, preventing it from showing up in subsequent lists.
* **Direct Links:** Apply buttons direct you to the exact crawled job details page.

### 5. 📣 LinkedIn Growth Engine
* **Post Generator:** Generate tailored project launch updates or open-to-work announcements using customizable engagement templates.

---

## 🛠️ Technology Stack & Dependencies

* **Frontend:** Vanilla HTML5, CSS3 (Modern Dark Glassmorphism, HSL tailors, transitions)
* **Backend:** Node.js, Express.js (v5), TypeScript (v6), `ts-node`
* **Scrapers:** Playwright (Chromium)
* **Database & ORM:** SQLite/PostgreSQL, Prisma ORM (v5)
* **AI Model Client:** `@google/genai` (Gemini 2.5 Flash)
* **Document Exporter:** `docx` (v9)

---

## ⚙️ Local Development Setup

### 1. Prerequisites & Installation
Ensure you have [Node.js](https://nodejs.org/) installed. Clone the repository, then install:
```bash
npm install
npx playwright install chromium
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
# Database Settings (Local SQLite)
DATABASE_URL="file:./prisma/dev.db"

# AI Configuration
GEMINI_API_KEY="your_actual_gemini_api_key"

# Matching Settings
MATCH_THRESHOLD=75
```
> [!NOTE]
> You can acquire a free Gemini API key from the **[Google AI Studio Console](https://aistudio.google.com/app/apikey)**.

### 3. Database Sync & Seeding
Initialize the SQLite schema and seed the candidate database profile (educational info, standard skills, and projects):
```bash
npx prisma db push
npx ts-node src/db/seed.ts
```

### 4. Start the Application
Run the local development server:
```bash
npm run dev
```
Open your browser to:
* **Dashboard / Application Tracker:** [http://localhost:3000](http://localhost:3000)
* **ATS Resume Creator:** [http://localhost:3000/resume.html](http://localhost:3000/resume.html)

---

## ☁️ Vercel Deployment Instructions

The project is natively structured to deploy on Vercel as a Serverless Function app:

### 1. Hosting a Cloud Database
* SQLite is a local file-based database, which is read-only and stateless on Vercel. 
* To persist job application status updates in production, provision a hosted PostgreSQL instance (e.g., via **Supabase**, **Neon**, or **Railway**).

### 2. Migrate Schema to Cloud DB
Set your shell environment `DATABASE_URL` to your production connection string, then sync the schema:
```bash
# Example for Windows PowerShell:
$env:DATABASE_URL="postgresql://user:password@ep-db-name.neon.tech/neondb?sslmode=require"
npx prisma db push
```

### 3. Vercel Project Setup
1. Import your repository into Vercel.
2. In the project **Settings -> Environment Variables**, configure:
   * `DATABASE_URL` = (Your cloud database connection string)
   * `GEMINI_API_KEY` = (Your Gemini API key)
   * `MATCH_THRESHOLD` = `75`
3. Click **Deploy**. Vercel will automatically compile TypeScript, generate the Prisma client, and route request handlers according to [vercel.json](file:///C:/Users/kumar/Documents/antigravity/fervent-carson/vercel.json).

> [!WARNING]
> **Scraper Execution in Serverless:**
> Long-running timers (`setInterval` inside `src/app.ts`) and Playwright browser instances will timeout/fail under Vercel Serverless Function execution limits. 
> To automate production scraping, either:
> 1. Run the Playwright scrapers on a dedicated VM (Railway, Render, or VPS) and point it to the same cloud PostgreSQL database.
> 2. Trigger individual scraper tasks periodically using Vercel Cron Jobs.

---

## 🔒 Security & Git Hygiene
* The database file (`dev.db`), `.env` secrets, transpiled files (`dist/`), and generated Word documents are excluded via [.gitignore](file:///C:/Users/kumar/Documents/antigravity/fervent-carson/.gitignore).
* No proprietary API keys or database credentials are saved or tracked in the Git tree, making it fully ready to push safely to your public GitHub repository.
