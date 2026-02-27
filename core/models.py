"""Pydantic models for API requests/responses and session state."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class TripPreferences(BaseModel):
    destination: str
    departing_from: str = "N/A"
    nationality: str = "N/A"
    days: int = 5
    travel_dates: str = "flexible"
    travelers: str = "1 adult"
    budget: str = "mid-range"
    travel_style: str = "mixed"
    interests: str = "general sightseeing"
    special_requirements: str = "none"


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
