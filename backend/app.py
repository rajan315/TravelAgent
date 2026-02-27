"""FastAPI application with CORS and route includes."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import research, qa, results

app = FastAPI(title="TravelAI API")

# CORS: allow localhost dev + deployed Vercel frontend
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if frontend_url := os.environ.get("FRONTEND_URL"):
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research.router, prefix="/api")
app.include_router(qa.router, prefix="/api")
app.include_router(results.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
