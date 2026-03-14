# Gemini Agents

This directory contains the **new Gemini-based AI agents** that power the intelligent features in Ploutos.

## Agents

### `accountant_agent.py` — Financial Analysis

**Purpose:** Analyze a financial canvas and return a detailed health report.

**Input:**
- Canvas state (nodes + edges representing cash flows)
- Financial constraints (budget, runway)

**Output:**
- `FinancialHealthReport` with:
  - Health score (0-100)
  - Key metrics (burn rate, runway, margin trends)
  - Flagged risks and recommendations

**Endpoint:** `POST /sync`

**Example:**
```python
from gemini_agents import accountant_agent
report = await accountant_agent.analyze(canvas_state)
```

---

### `scout_agent.py` — Location Expansion

**Purpose:** Rank Canadian cities by expansion viability using real demographic and economic data.

**Input:**
- Financial health report from Accountant
- List of candidate cities

**Process (4-phase):**
1. Extract budget constraints from financial report
2. Fetch macro data (BoC rates, FRED, CPI) — cached 6hr
3. Parallel-fetch city data (demographics, rent, foot traffic, competitors)
4. Compute Viability Score formula + Gemini narrative ranking

**Output:**
- `GeminiExpansionReport` with:
  - Ranked locations with scores (0-100)
  - Viability breakdown (revenue potential, cost factors, demographics)
  - Lat/lng for map integration
  - Data confidence flags

**Endpoint:** `POST /optimize`

**Viability Formula:**
```
Ve = (projected_revenue × demographic_score) / ((rent_cost × competition_factor) + fixed_overhead) × 40
```

**Example:**
```python
from gemini_agents import scout_agent
expansion_report = await scout_agent.optimize(financial_report, locations)
```

---

### `wire_agent.py` — Connection Matching

**Purpose:** Intelligently connect unconnected expenses to revenue streams using semantic understanding.

**Input:**
- Revenue nodes (with user labels)
- Expense nodes (with categories/labels)

**Output:**
- `AutoWireResponse` with list of recommended mappings:
  - `[{source: expenseId, target: revenueId}, ...]`

**Endpoint:** `POST /auto-wire`

**Example:**
```python
from gemini_agents import wire_agent
mappings = await wire_agent.match_expenses_to_revenue(revenue_nodes, expense_nodes)
```

---

### `listing_agent.py` — Inventory Management

**Purpose:** Manage product listings, integrate with Square POS, and suggest inventory optimization.

**Status:** In development

**Future endpoints:**
- `POST /listings/import` — Import from Square catalog
- `POST /listings/suggest` — AI inventory recommendations

---

## Tools (`tools.py`)

Shared tool definitions used by agents for external API calls:

- **`get_macro_briefing()`** — Fetch cached BoC + FRED macro data
- **`get_city_demographic_data(city_name)`** — StatsCan 2021 Census lookup
- **`get_foot_traffic_signals(city_name)`** — BestTime API integration
- **`get_competitor_density(city_name)`** — Local business density estimation
- **`lookup_product(upc)`** — UPC Item DB product lookup
- **`get_square_catalog()`** — Square Sandbox catalog (if configured)

All tools implement resilience:
- Retry logic via `tenacity`
- Graceful degradation if API unavailable
- TTL caching to reduce redundant calls

---

## Folder Structure

```
gemini_agents/
├── __init__.py              # Package exports
├── accountant_agent.py      # Financial analysis
├── scout_agent.py           # Location expansion
├── wire_agent.py            # Connection matching
├── listing_agent.py         # Inventory management
└── tools.py                 # Shared tool definitions
```

All models import from `backend/models/briefings.py` for request/response types.

---

## Configuration

Set in `.env`:
```env
GOOGLE_GEMINI_API_KEY=your_key_here
```

Agents are initialized on app startup via `backend/main.py` lifespan manager.

---

## Testing an Agent

```python
# Test Accountant directly
import asyncio
from gemini_agents import accountant_agent
from backend.models.briefings import CanvasState

canvas = CanvasState(nodes=[], edges=[])
report = asyncio.run(accountant_agent.analyze(canvas))
print(report.json())
```

---

## Debugging

All agent calls log at `INFO` level. To see agent execution:

```bash
tail -f backend.log | grep "gemini_agents"
```

For verbose output, enable `DEBUG` level in `backend/main.py`:
```python
logging.basicConfig(level=logging.DEBUG)
```

---

## Adding New Agents

1. Create new file: `new_agent.py`
2. Define async function: `async def analyze(...) -> OutputModel:`
3. Implement Gemini call via `google-genai` SDK
4. Add tool definitions to `tools.py` if needed
5. Create request/response models in `backend/models/briefings.py`
6. Register route in `backend/routers/`
7. Add to `__init__.py` exports

See `scout_agent.py` for a complete example with tool integration.
