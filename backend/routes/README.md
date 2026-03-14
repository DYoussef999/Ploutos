# Backend Routes (Legacy - Backboard Integration)

This directory contains **legacy Backboard.io API routes** preserved during the migration to Gemini as the primary intelligence layer.

## Routes

- **`sandbox.py`** — Legacy session and canvas sync endpoints (Backboard)
- **`locations.py`** — Location data + BestTime foot traffic integration (ACTIVE)
- **`dashboard.py`** — Dashboard metrics stub (not actively developed)
- **`optimizer.py`** — Deprecated expansion optimizer (replaced by Gemini Scout)

## Status

⏳ **Maintenance Mode** — These routes are preserved for backward compatibility. New features should use `/routers/` instead.

### Which Are Still Active?

| File | Status | Notes |
|------|--------|-------|
| `locations.py` | 🟢 Active | Provides location data for the map view; integrates with BestTime API |
| `sandbox.py` | 🟡 Legacy | Some endpoints still called by frontend during transition; Backboard agents still initialize |
| `dashboard.py` | 🟡 Stub | Returns mock data; full implementation pending data merge |
| `optimizer.py` | 🔴 Deprecated | Use `/optimize` (Gemini Scout) instead |

## Migration Path

If you're working on a new feature:
1. ✅ Implement in `/routers/` (Gemini-based)
2. ✅ Register in `backend/main.py`
3. ✅ Update frontend to use new endpoint
4. Eventually: deprecate corresponding legacy endpoint

## Integration

Legacy routes are imported in `backend/main.py` for backward compatibility:
```python
from routes import sandbox as legacy_sandbox
from routes import locations as locations_route

app.include_router(legacy_sandbox.router, prefix="/sandbox",   tags=["Legacy"])
app.include_router(locations_route.router, tags=["Locations"])
```

For new endpoints, prefer `/routers/` structure and Gemini agents.
