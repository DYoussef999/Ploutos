# Quick Start Guide

Get Ploutos running locally in 5 minutes.

## Prerequisites

- Node.js 18+
- Python 3.11+
- API Keys (get free): [Gemini](https://aistudio.google.com/app/apikey), [FRED](https://fredaccount.stlouisfed.org/), [Auth0](https://auth0.com/)

## Setup (One Time)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with Auth0 credentials
```

## Run (Every Time)

### Terminal 1: Backend
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Open Browser
- **Landing page:** http://localhost:3000
- **Canvas/Sandbox:** http://localhost:3000/sandbox (after login)
- **API docs:** http://localhost:8000/docs

## Quick Test

1. Go to http://localhost:3000/auth and sign in
2. Go to http://localhost:3000/sandbox
3. Drag nodes onto the canvas
4. Watch AI agents analyze in real-time (look at right sidebar)

## Key Documentation

- **Setup & Architecture:** [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Backend Agents:** [backend/gemini_agents/README.md](./backend/gemini_agents/README.md)
- **Frontend Components:** [frontend/components/README.md](./frontend/components/README.md)
- **API Routes:** [backend/routers/README.md](./backend/routers/README.md) (new) vs [backend/routes/README.md](./backend/routes/README.md) (legacy)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ModuleNotFoundError" (Python) | Run `pip install -r requirements.txt` |
| npm error (JavaScript) | Run `npm install --prefix frontend` |
| Port 8000/3000 in use | Change port: `--port 8001` (backend) or `--port 3001` (frontend) |
| API key not working | Check `.env` file, restart backend after editing |
| Canvas not syncing | Check browser console (F12) and `/health` endpoint |

## Project Links

- **GitHub:** https://github.com/DYoussef999/Ploutos
- **Hack Canada:** https://www.hackcanda.io/
- **Gemini AI:** https://ai.google.dev/
- **React Flow:** https://reactflow.dev/
- **Backboard:** https://backboard.io/

---

Got stuck? Check [DEVELOPMENT.md](./DEVELOPMENT.md#troubleshooting) for more detailed troubleshooting.
