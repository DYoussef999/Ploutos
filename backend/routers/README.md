# Backend Routers (New AI Intelligence Layer)

This directory contains the **new Gemini-based AI routes** and is the recommended endpoint structure.

## Routes

- **`sync.py`** — `POST /sync` — Accountant Agent analyzes canvas state and returns `FinancialHealthReport`
- **`optimize.py`** — `POST /optimize` & `GET /macro` — Scout Agent ranks locations; Macro briefing (6hr cache)
- **`wire.py`** — `POST /auto-wire` — Wire Matcher intelligently connects expenses to revenue streams
- **`listings.py`** — `POST /listings` — Listing Agent for inventory management (upcoming)

## Status

✅ **Active Development** — These are the primary endpoints for new features. The frontend prefers these routes.

## Integration

All routes are registered in `backend/main.py`:
```python
app.include_router(sync_router.router,     tags=["Accountant"])
app.include_router(optimize_router.router, tags=["Scout"])
app.include_router(wire_router.router,     tags=["Canvas"])
```

See OpenAPI docs at `http://localhost:8000/docs` for full schema.
