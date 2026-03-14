# Development Guide

This guide provides detailed setup instructions and best practices for developing Ploutos.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git** 2.30+ ([Download](https://git-scm.com/))
- API Keys:
  - [Gemini](https://aistudio.google.com/app/apikey) ✅ REQUIRED
  - [FRED](https://fredaccount.stlouisfed.org/) ✅ REQUIRED
  - [Auth0](https://auth0.com/) ✅ REQUIRED for authentication
  - [Square](https://developer.squareup.com/) ❌ Optional
  - [Mapbox](https://www.mapbox.com/) ❌ Optional

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DYoussef999/Ploutos.git
cd Ploutos
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `.env` and add your API keys:**

```env
# Required
GOOGLE_GEMINI_API_KEY=your_actual_key_here
FRED_API_KEY=your_actual_key_here

# Optional but recommended
BACKBOARD_API_KEY=your_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_key
```

⚠️ **Never commit `.env` file** — it's in `.gitignore` for security.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

**Edit `.env.local` with Auth0 credentials:**

```env
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=generated_secret_here
```

To generate `AUTH0_SECRET`, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running Locally

### Terminal 1: Backend

```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO     Uvicorn running on http://127.0.0.1:8000
INFO     Initializing Backboard agents…
INFO     Agents ready.
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

### Terminal 3: Monitor Logs (Optional)

```bash
# Backend logs
tail -f backend.log | grep -E "gemini_agents|sync|optimize"

# Frontend console
# Open browser DevTools (F12) → Console tab
```

### Verify Setup

1. **Backend health:** `curl http://localhost:8000/health`
   ```json
   {
     "status": "ok",
     "gemini": "ok",
     "fred": "ok",
     "bankofcanada": "ok",
     ...
   }
   ```

2. **Frontend:** Navigate to `http://localhost:3000`
   - You should see the landing page
   - Click "Get started" → Login with Auth0

3. **Canvas:** Navigate to `http://localhost:3000/sandbox`
   - Drag nodes onto the canvas
   - Should sync to backend (wait 1.5s, check network tab)

## API Development

### Adding a New Endpoint

**1. Create request/response models** in `backend/models/`:

```python
# backend/models/my_feature.py
from pydantic import BaseModel

class MyRequest(BaseModel):
    field1: str
    field2: int

class MyResponse(BaseModel):
    result: str
    score: float
```

**2. Create router** in `backend/routers/`:

```python
# backend/routers/my_feature.py
from fastapi import APIRouter
from models.my_feature import MyRequest, MyResponse

router = APIRouter()

@router.post("/my-endpoint", response_model=MyResponse)
async def my_endpoint(request: MyRequest) -> MyResponse:
    """
    Detailed docstring explaining what this does.
    """
    result = process_request(request)
    return MyResponse(result=result, score=0.95)
```

**3. Register in main.py:**

```python
from routers import my_feature

app.include_router(my_feature.router, tags=["MyFeature"])
```

**4. Test with curl:**

```bash
curl -X POST http://localhost:8000/my-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field1": "test", "field2": 42}'
```

### Using AI Agents

Example: Adding a new Gemini agent

```python
# backend/gemini_agents/my_agent.py
import logging
from google.genai import types
from models.my_feature import AnalysisResult

log = logging.getLogger(__name__)

async def analyze(input_data: dict) -> AnalysisResult:
    """Analyze input using Gemini."""
    client = genai.Client()
    
    response = await client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Analyze this: {input_data}"
    )
    
    result = parse_response(response.text)
    return AnalysisResult(**result)
```

Then use in router:

```python
from gemini_agents import my_agent

@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: MyRequest) -> AnalysisResult:
    return await my_agent.analyze(request.dict())
```

### Debugging API Issues

```bash
# Enable debug logging
export PYTHONUNBUFFERED=1
python -u -m uvicorn backend.main:app --reload --log-level debug

# Test specific endpoint with verbose curl
curl -v -X POST http://localhost:8000/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Check FastAPI OpenAPI docs
# Open http://localhost:8000/docs in browser
```

## Frontend Development

### Adding a New Component

**1. Create component file:**

```tsx
// frontend/components/MyComponent.tsx
'use client';

import { ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  children?: ReactNode;
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="p-4 rounded-lg border">
      <h2 className="font-bold">{title}</h2>
      {children}
    </div>
  );
}
```

**2. Use in page:**

```tsx
// frontend/app/my-page/page.jsx
import MyComponent from '@/components/MyComponent';

export default function MyPage() {
  return (
    <MyComponent title="Hello">
      <p>Content goes here</p>
    </MyComponent>
  );
}
```

**3. Test component:**

```bash
npm run dev
# Navigate to page in browser
# Check for console errors (F12)
```

### Making API Calls

**Use the api wrapper** in `frontend/services/api.js`:

```typescript
// frontend/services/my-service.ts
import axios from '@/services/api';

export async function fetchMyData(params: MyRequest) {
  const response = await axios.post('/my-endpoint', params);
  return response.data;
}
```

**Use in component:**

```tsx
import { fetchMyData } from '@/services/my-service';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await fetchMyData({ /* params */ });
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### Styling

Use **Tailwind CSS** classes:

```tsx
<div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
  <span className="font-semibold text-lg">Title</span>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```

For custom colors, use CSS variables defined in `globals.css`:

```tsx
<div style={{ color: 'var(--forest)', backgroundColor: 'var(--cream)' }}>
  Text with custom colors
</div>
```

### Debugging Frontend Issues

```bash
# Open DevTools
# Press F12 or Cmd+Option+I

# Check console for errors
# Check Network tab for API calls
# Check Sources tab to set breakpoints
# Use "> React DevTools" in console to inspect components

# Use Next.js debug mode
NODE_OPTIONS='--inspect-brk' npm run dev
# Then navigate to chrome://inspect
```

## Common Tasks

### Restarting Services

```bash
# Kill backend (Ctrl+C in terminal 1)
# Restart: uvicorn main:app --reload --port 8000

# Kill frontend (Ctrl+C in terminal 2)
# Restart: npm run dev
```

### Clearing Cache

```bash
# Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Node cache
rm -rf frontend/node_modules
npm install --prefix frontend

# Next.js cache
rm -rf frontend/.next
```

### Resetting Database

```bash
# Remove SQLite database
rm backend/launchpad.db

# Restart backend to recreate
# Migrations run automatically on startup
```

### Testing an Agent Directly

```python
# Interactive Python interpreter
python -i

>>> import asyncio
>>> from gemini_agents import accountant_agent
>>> from models.briefings import CanvasState

>>> canvas = CanvasState(nodes=[], edges=[])
>>> report = asyncio.run(accountant_agent.analyze(canvas))
>>> print(report.json(indent=2))
```

### Viewing OpenAPI Documentation

Backend: http://localhost:8000/docs
Frontend: http://localhost:3000

### Running Tests

```bash
# Backend (pytest)
cd backend
pytest -v

# Frontend (Jest/Vitest)
cd frontend
npm run test
```

If tests don't exist yet, this is a great contribution opportunity!

## Troubleshooting

### Port Already in Use

Backend (8000):
```bash
# macOS/Linux
lsof -i :8000
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Frontend (3000):
```bash
# Similar commands as above
# Or use: npm run dev -- --port 3001
```

### API Key Errors

```
"GOOGLE_GEMINI_API_KEY not configured"
```

**Fix:**
1. Check `.env` file exists: `cat backend/.env`
2. Verify key is present: `grep GOOGLE_GEMINI_API_KEY backend/.env`
3. Restart backend after changing `.env`
4. Test: `curl http://localhost:8000/health`

### Auth0 Not Working

```
"Auth0 integration failed"
```

**Fix:**
1. Verify `.env.local` has correct keys
2. Check Auth0 application settings match localhost URLs
3. Clear browser cookies/cache
4. Restart frontend: `npm run dev`

### Canvas Not Syncing

```
Network tab shows /sync returning 500/502
```

**Fix:**
1. Check backend console for error messages
2. Verify Gemini API key works: `curl http://localhost:8000/health`
3. Check canvas JSON is valid (F12 Network tab)
4. Restart backend with `--log-level debug`

### Module Import Errors

```python
ModuleNotFoundError: No module named 'google.genai'
```

**Fix:**
```bash
cd backend
pip install -r requirements.txt
# Or specific package:
pip install google-genai
```

### React/Node Warnings

```
Warning: useEffect has missing dependency
```

**Fix:**
Add missing dependencies to dependency array:
```tsx
useEffect(() => {
  // code
}, [dependency1, dependency2]); // <- add here
```

### Performance Issues

```
Canvas is slow with many nodes
```

**Fix:**
1. Reduce to <300 nodes
2. Check browser console for errors
3. Use React DevTools Profiler to find slow renders
4. Memoize expensive components with `React.memo()`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && source .venv/bin/activate && uvicorn main:app --reload` |
| Start frontend | `cd frontend && npm run dev` |
| Install deps (backend) | `cd backend && pip install -r requirements.txt` |
| Install deps (frontend) | `cd frontend && npm install` |
| Format code (backend) | `cd backend && black . && flake8 .` |
| Format code (frontend) | `cd frontend && npm run format` |
| View API docs | http://localhost:8000/docs |
| View app | http://localhost:3000 |
| Test canvas | http://localhost:3000/sandbox |

---

Happy coding! 🚀

For more help, see:
- Main [README.md](./README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- Backend [gemini_agents/README.md](./backend/gemini_agents/README.md)
- Frontend [components/README.md](./frontend/components/README.md)
