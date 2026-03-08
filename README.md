# Compass AI

**A visual financial sandbox for Canadian small businesses.**
Built at Hack Canada 2026.

---

Most small business owners manage their finances in their heads, a spreadsheet that's three years old, or a napkin. Compass AI turns that chaos into a living canvas — drag your revenue streams and expenses onto a board, wire them together, and watch a team of AI agents figure out what it all means.

The idea is simple: you shouldn't need an MBA to understand your burn rate or whether opening a second location in Winnipeg actually makes sense.

---

## How It Works

### The Canvas

The core of the app is a drag-and-drop financial board built with **React Flow**. You drop nodes for revenue sources (a product line, a service tier, a contract) and expense categories (staff, overhead, operating costs). Connect them with edges to model how money flows through your business.

Every time you make a change, the canvas debounces 1.5 seconds and fires off a sync to the backend — two parallel calls, one to each intelligence layer. You never wait for a button press. The AI just reacts.

### The Two Intelligence Layers

We ended up with two parallel AI stacks because each solved a different problem:

**Layer 1 — Backboard AI**
[Backboard](https://backboard.io) gave us persistent agent threads and a clean orchestration API. We have three assistants living on Backboard:

- **Compass-Accountant** — receives your canvas state on every sync, crunches your financials, and writes back an analysis with a health score and flagged risks.
- **Compass-Scout** — your expansion specialist. Send it a list of Canadian cities and it uses a tool-call loop to pull census data, rent estimates, and foot traffic signals, then ranks each location by a viability score.
- **Compass-Ingestor** — paste in a Google Sheet or CSV, and it parses the mess into structured canvas nodes.

The Scout uses a real tool loop: it sends a message, processes `tool_calls`, submits `ToolOutput`, and keeps cycling until the model stops calling tools. This is where Backboard's thread model actually shines — the agent has memory across a session without us manually stitching context together.

**Layer 2 — Gemini**
For reasoning that needed real Canadian economic data baked in, we went directly to Google's **Gemini** via the `google-genai` SDK. The Gemini agents never receive raw API responses — everything passes through a digest layer that converts external JSON into structured briefings first.

The Gemini Accountant produces a `FinancialHealthReport`. The Gemini Scout produces a `GeminiExpansionReport` with ranked locations including lat/lng for map pins. The frontend prefers the Gemini report and falls back to Backboard if it's unavailable.

### Real Canadian Data

The viability score the Scout produces isn't made up. It's built from:

- **Bank of Canada Valet API** — live overnight rate, prime rate, CPI
- **Statistics Canada** — 2021 Census demographics per city (population, income brackets, business density)
- **FRED** — cross-reference for Canada CPI and rate data
- **Square Sandbox** — optional POS catalog integration so you can import real product data
- **UPC Item DB** — product lookup for inventory-heavy businesses

The viability formula: `Ve = (projected_revenue × demographic_score) / ((rent_cost × competition_factor) + fixed_overhead) × 40`, capped at 100.

### Auth

Authentication is handled by **Auth0**. Clean OAuth flow, zero custom session logic on our end.

---

## Project Structure

```
hack-canada/
├── frontend/          # Next.js 14 App Router
│   ├── app/sandbox/   # The main canvas page
│   ├── components/    # FinancialSandbox, Sidebar, SummarySidebar, node types
│   ├── hooks/         # useCanvasFinancials (local math), useSession
│   ├── services/      # compassApi.ts — all fetch calls to backend
│   └── types/         # Shared TS types for nodes and API responses
│
└── backend/           # FastAPI
    ├── agents.py       # All Backboard logic — sessions, tool loop, 3 assistants
    ├── main.py         # App entrypoint + lifespan startup
    ├── config.py       # Typed config from .env
    ├── gemini_agents/  # Accountant, Scout, Wire, Listing agents (Gemini)
    ├── routers/        # /sync, /optimize, /wire, /listings endpoints
    ├── services/       # Bank of Canada, FRED, StatsCan, Square, UPC
    └── utils/          # TTL cache, digest layer
```

---

## Getting Started

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in Gemini, Backboard, Auth0, Square keys
uvicorn main:app --reload --port 8000
curl http://localhost:8000/health   # should show all APIs green
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000/sandbox` and start dropping nodes.

---

## Sponsors

None of this gets built in a weekend without good APIs and the teams behind them:

- **[Backboard AI](https://backboard.io)** — the agent thread orchestration that made our multi-step tool loops actually work without writing a state machine from scratch.
- **[Google Gemini](https://deepmind.google/technologies/gemini/)** — fast, capable reasoning that handles both financial analysis and location viability in one model.
- **[Auth0](https://auth0.com)** — authentication that just works so we could spend time on the actual product.
- **[Square](https://developer.squareup.com)** — commerce APIs and sandbox that let us pull real product catalog data without needing a live merchant account.
- **[Bank of Canada](https://www.bankofcanada.ca/valet/docs)** — the Valet API is genuinely one of the cleanest public data APIs in Canada.
- **[Statistics Canada](https://www.statcan.gc.ca)** — 2021 Census data that makes the expansion viability scores actually grounded in reality.
- **Hack Canada** — for running the event and giving us a reason to build something.

---

*We just want Canadian small businesses to have tools that don't suck.*
