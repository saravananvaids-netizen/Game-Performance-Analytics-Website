from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MatchBase(BaseModel):
    game_id: str
    game_title: str
    game_mode: str
    date: datetime
    result: str
    score: int
    duration_minutes: int
    kills: int
    deaths: int
    assists: int
    accuracy: Optional[float] = None
    headshots: Optional[int] = None
    damage_dealt: Optional[int] = None
    objectives_completed: Optional[int] = None
    map_name: Optional[str] = None
    notes: Optional[str] = None

class MatchCreate(MatchBase):
    id: Optional[str] = None

class MatchResponse(MatchBase):
    id: str
    player_id: str

    class Config:
        orm_mode = True

class PlayerProfileResponse(BaseModel):
    id: str
    name: str
    tag: str
    avatar: str
    primary_game: str
    rank: str
    level: int
    bio: Optional[str] = None

    class Config:
        orm_mode = True

class PredictionRequest(BaseModel):
    matches: List[MatchBase]

class PredictionResponse(BaseModel):
    has_sufficient_data: bool
    predicted_score: float
    predicted_win_probability: float
    predicted_kd: float
    confidence_score: float
