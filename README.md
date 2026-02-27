# TravelAI - AI-Powered Trip Planner

An intelligent travel planning application that uses **Claude AI (via AWS Bedrock)** to autonomously research flights, hotels, transport, local customs, and generate detailed day-by-day itineraries with real-time streaming updates.

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **AWS Bedrock** - Claude Opus 4.6 for AI-powered research
- **SSE (Server-Sent Events)** - Real-time streaming updates
- **Pydantic** - Data validation
- **boto3** - AWS SDK

### Frontend
- **React 19** (TypeScript)
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **react-markdown** - Markdown rendering with GFM support

### Deployment
- **Backend** - Render
- **Frontend** - Vercel

## Project Structure

```
TravelAgent/
├── backend/
│   ├── app.py                  # FastAPI app with CORS
│   ├── state.py                # In-memory session store
│   └── routes/
│       ├── research.py         # Research start + SSE stream
│       ├── qa.py               # Follow-up Q&A endpoint
│       └── results.py          # Results & download endpoints
├── core/
│   ├── bedrock.py              # AWS Bedrock client
│   ├── models.py               # Pydantic models
│   ├── phases.py               # 5 research phase definitions
│   ├── research.py             # Agentic research loop
│   ├── qa.py                   # Q&A with web search
│   ├── search.py               # Web search tool
│   └── save.py                 # Markdown export
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main app (form → loading → results)
│   │   ├── api.ts              # API client
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── components/         # UI components
│   │   └── hooks/              # Custom React hooks
│   ├── vite.config.ts          # Dev proxy config
│   └── vercel.json             # Vercel routing
├── render.yaml                 # Render deployment config
├── requirements.txt            # Python dependencies
└── run_api.py                  # Uvicorn entry point
```

## How It Works

1. **User Input** - Enter destination, dates, budget, travel style, and preferences
2. **AI Research** - Claude runs 5 sequential research phases:
   - Flights & Travel Options
   - Hotels & Accommodation
   - Local Transport & Rentals
   - Rules, Laws & Customs
   - Day-by-Day Itinerary
3. **Real-Time Updates** - See live progress via SSE streaming as each phase completes
4. **Results** - View research in a tabbed interface with detailed markdown output
5. **Q&A** - Ask follow-up questions in the chat sidebar
6. **Download** - Export your full trip plan as a markdown file

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/research` | POST | Start a new research session |
| `/api/research/{id}/stream` | GET | SSE stream for real-time events |
| `/api/research/{id}/results` | GET | Get research results & status |
| `/api/research/{id}/chat` | POST | Ask follow-up questions |
| `/api/research/{id}/download` | GET | Download plan as markdown |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- AWS account with Bedrock access (Claude model enabled)

### Environment Variables

```env
# AWS credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BEDROCK_REGION=us-east-1

# Frontend URL (for production CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Run Locally

**Backend:**

```bash
# Install dependencies
pip install -r requirements.txt

# Set AWS credentials (Windows)
set AWS_ACCESS_KEY_ID=your-key
set AWS_SECRET_ACCESS_KEY=your-secret

# Start the API server (runs on port 8000)
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on port 5173, proxies /api to :8000)
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Connect repo to Render
3. Render auto-detects `render.yaml` config
4. Set environment variables in Render dashboard:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BEDROCK_REGION`
   - `FRONTEND_URL`

### Frontend (Vercel)

1. Connect repo to Vercel
2. Set root directory to `frontend`
3. Set environment variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy

## License

MIT
