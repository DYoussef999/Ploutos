# Compass AI (LaunchPad)

**Visual Financial Sandbox for Canadian SMBs.** Built for Hack Canada 2026.

Compass AI helps small business owners visualize their financial health through a React Flow canvas and receive real-time expansion strategy grounded in actual Canadian economic and inventory data.

## 🧠 AI Architecture: The Two-Agent RAG System

Compass AI utilizes a multi-agent RAG (Retrieval-Augmented Generation) pattern to ensure AI insights are grounded in your specific business data and real-time market conditions.

### 1. The Accountant Agent (Financial Guardrails)
- **Role:** Analyzes the React Flow canvas (Revenue vs. Expense nodes) and POS inventory.
- **Process:** Ingests the canvas JSON + **Square Sandbox Catalog** → calculates Burn Rate, Profit Margin, and Runway.
- **RAG Integration:** Cross-references manual canvas revenue with actual Square product pricing to ensure projections are realistic.
- **Memory Injection:** Persists "Financial Markers" (like `max_affordable_rent`) into **Backboard.io Assistant Memory** for cross-agent recall.
- **Output:** Provides the "Business Health" report and score in the sidebar.

### 2. The Scout Agent (Market Strategist)
- **Role:** Provides expansion strategy and macro-risk analysis.
- **Retrieval Phase (RAG):**
    - **Internal Retrieval:** Recalls financial guardrails (margins, rent ceiling) saved by the Accountant.
    - **External Retrieval:** Fetches real-time "Briefings" from:
        - **Bank of Canada (Valet API):** Latest overnight rates, FX rates (`FXUSDCAD`), and CPI.
        - **FRED (St. Louis Fed):** Canadian inflation cross-references.
        - **Statistics Canada:** 2021 Census data for demographics and income levels per city.
- **Reasoning:** Evaluates expansion readiness. If BoC rates are high (>4.5%), it automatically applies a **15% financing penalty** to the expansion strategy.
- **Status:** neighborhood-level location scoring is currently "pending merge"—the Scout currently provides high-level strategy and macro-risk flags.

### 3. Gemini Intelligence Layer
- **Model:** Powered by **Gemini 3.1 Flash Lite Preview** for high-quota, low-latency analysis.
- **Digestion:** All external API data passes through a **Digestor** utility to ensure the agent receives clean, structured economic briefings rather than noisy raw JSON.

---

## 🚀 Getting Started

### 1. Setup Backend
```bash
cd backend
pip install -r requirements.txt
# Ensure GEMINI_API_KEY, BACKBOARD_API_KEY, and SQUARE_SANDBOX_ACCESS_TOKEN are in .env
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000/sandbox` to start building your business model.

## 🛠️ Tech Stack
- **Frontend:** Next.js (TypeScript), React Flow, Tailwind CSS, Lucide.
- **Backend:** FastAPI (Python), Google GenAI SDK, Backboard.io.
- **Data Sources:** Bank of Canada Valet, FRED, StatCan 2021 Census, Square Sandbox.
