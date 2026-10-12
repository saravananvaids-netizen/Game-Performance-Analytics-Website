# GameVision AI – Intelligent Game Performance Analytics Website

An esports performance analytics and AI coaching web application designed to help competitive gamers analyze telemetry, track improvement, compare performance, and receive personalized coaching recommendations.

---

## 🚀 Key Features Implemented

1. **Player Performance Dashboard**
   - KPI metrics cards for Total Matches, Win Rate, K/D Ratio, Average Score, and Accuracy.
   - Interactive Recharts momentum line chart & outcome ratio pie chart.
   - Recent 5 matches table and active goal tracking.

2. **Game-Specific Performance Tracking**
   - Contextual tracking for **Valorant**, **BGMI / PUBG**, **Free Fire MAX**, **EA Sports FC 25**, and **Custom Games**.
   - Real-time logging of combat rating (ACS), headshot %, damage dealt, and objectives completed.
   - Full CRUD operations (Add, Edit, Delete).

3. **Win Rate Analyzer**
   - Automatic mathematical calculation: `Win Rate = (Matches Won / Total Matches) × 100`.
   - Current win/loss streak tracking, peak win streaks, and tilt loss limits.
   - Performance breakdown by game mode (Competitive vs Unrated vs Deathmatch).
   - Cumulative win rate progression over match sequence.

4. **Progress & Development Tracker**
   - Daily, weekly, and monthly aggregated performance curves.
   - Period-over-period delta comparison (Score, K/D, and Win Rate highlights).

5. **AI Gaming Coach**
   - Server-side AI analysis proxy integrated with **Google Gemini 3.8 Flash** (`@google/genai`).
   - Deterministic esports heuristic engine fallback when offline or without an API key.
   - Actionable drills with custom target goals and immediate next-5-matches tactical adjustments.

6. **Strength & Weakness Detection Matrix**
   - 6-Dimensional Radar Chart (Aim & Precision, Survivability, Objective Play, Consistency, K/D Impact, Clutch Influence).
   - Mathematical proof and derivation notes for each score.
   - Inconsistent gameplay pattern alerts.

7. **Player Leaderboard**
   - Competitive ladder with search, filtering by game title, and multi-metric sorting.
   - Current user's standing highlighted.

8. **Searchable Match History**
   - Filter by game title, match result (WIN, LOSS, DRAW), and search by map/notes.
   - Pagination (8 per page) with detailed match modal scorecard.

9. **Head-to-Head Player Comparison**
   - Side-by-side metric comparison table with advantage highlights.
   - Dual radar chart overlay (Cyan vs Purple).

10. **Machine Learning Performance Prediction**
    - Statistical linear regression & weighted moving average forecasts.
    - Historical actual vs projected future match points chart.
    - Transparent statistical confidence score and disclaimer.

11. **Gaming Session & Progression Analyzer**
    - Automatic match clustering into sessions based on ≤2-hour time gaps.
    - Intra-session performance trajectory (Match 1 vs Match 2 vs Match 3).

12. **Scout Report Generator**
    - Complete dossier preview.
    - Direct **Download CSV** button.
    - **Print to PDF** with dedicated clean print styling.

13. **Settings & Data Management**
    - Player profile editor (name, tag, avatar, rank, bio).
    - Simulated demo account switcher.
    - CSV import validator with error reporting.
    - Full JSON data backup & Restore.
    - Demo database reset button.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Motion, Canvas-Confetti
- **Full-Stack Node Server**: Express with Vite middlewares & Gemini AI Proxy
- **Python Backend (Optional for standalone testing)**: FastAPI, SQLite, SQLAlchemy, pandas, scikit-learn

---

## 💻 How to Run in Visual Studio Code on Windows

### Prerequisites
1. **Node.js** (v18 or higher): Download from [nodejs.org](https://nodejs.org/)
2. **Python** (v3.10 or higher, optional for FastAPI backend): Download from [python.org](https://www.python.org/)
3. **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)

---

### Step 1: Clone or Open the Project
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and select the `gamevision-ai` folder.

---

### Step 2: Run the React Application (Node.js)

1. Open a terminal in VS Code:
   - Press **Ctrl + `** (backtick) or select **Terminal > New Terminal**.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   The dashboard is pre-seeded with 24 realistic fictional match records across multiple games!

---

### Step 3: (Optional) Run the Python FastAPI Backend on Windows

If you wish to test the standalone Python FastAPI + SQLite backend:

1. In VS Code, open a **Second Terminal Tab** by clicking the **+** icon in the terminal panel.
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
   *(If PowerShell gives a script execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*
3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
5. View the interactive Swagger API documentation at:
   ```
   http://localhost:8000/docs
   ```
   The SQLite database file `gamevision.db` will be created automatically.

---

## 🔑 Environment Variables & API Keys

Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```
- **GEMINI_API_KEY**: Required only if you want live Google Gemini 3.8 Flash AI coaching responses. If no key is provided, the application operates on the built-in transparent heuristic esports analytics engine without breaking.

---

## 🧪 Testing Verification Checklist

- [x] Initial demo data (24 matches) loads on launch.
- [x] Adding a match via "+ Log Match" updates K/D, win rate, and charts dynamically.
- [x] Zero deaths in K/D calculations are handled safely (`Flawless` notation).
- [x] Win Rate formula: `(Matches Won / Total Matches) × 100`.
- [x] Leaderboard search and sorting operate reactively.
- [x] CSV export and import validate data formatting.
- [x] PDF report print preview formats cleanly.
- [x] Reset Demo Data restores initial test fixtures.
