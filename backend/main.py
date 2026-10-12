from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from .database import engine, get_db, Base
from .models import Match, Player
from .schemas import MatchCreate, MatchResponse, PlayerProfileResponse, PredictionResponse
from .ml_predictor import predict_future_performance

# Initialize SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GameVision AI Backend",
    description="FastAPI + SQLite + scikit-learn performance analytics engine for GameVision AI",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite port 3000 or any client port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "GameVision AI Analytics API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/matches", response_model=List[MatchResponse])
def get_matches(
    game_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Match)
    if game_id and game_id != "all":
        query = query.filter(Match.game_id == game_id)
    return query.order_by(Match.date.desc()).limit(limit).all()

@app.post("/api/matches", response_model=MatchResponse)
def create_match(match_in: MatchCreate, db: Session = Depends(get_db)):
    match_id = match_in.id or f"match-{uuid.uuid4().hex[:8]}"
    db_match = Match(
        id=match_id,
        player_id="player-current",
        game_id=match_in.game_id,
        game_title=match_in.game_title,
        game_mode=match_in.game_mode,
        date=match_in.date,
        result=match_in.result,
        score=match_in.score,
        duration_minutes=match_in.duration_minutes,
        kills=match_in.kills,
        deaths=match_in.deaths,
        assists=match_in.assists,
        accuracy=match_in.accuracy,
        headshots=match_in.headshots,
        damage_dealt=match_in.damage_dealt,
        objectives_completed=match_in.objectives_completed,
        map_name=match_in.map_name,
        notes=match_in.notes
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@app.delete("/api/matches/{match_id}")
def delete_match(match_id: str, db: Session = Depends(get_db)):
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(db_match)
    db.commit()
    return {"success": True, "deleted_id": match_id}

@app.get("/api/profile", response_model=PlayerProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Player).filter(Player.id == "player-current").first()
    if not profile:
        profile = Player(
            id="player-current",
            name="ViperStrike",
            tag="PRO#992",
            avatar="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
            primary_game="valorant",
            rank="Immortal 2",
            level=84,
            bio="Competitive flex duelist & controller."
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.post("/api/predict", response_model=PredictionResponse)
def predict_performance(game_id: Optional[str] = "valorant", db: Session = Depends(get_db)):
    query = db.query(Match)
    if game_id and game_id != "all":
        query = query.filter(Match.game_id == game_id)
    matches = query.order_by(Match.date.asc()).all()

    matches_list = [
        {
            "date": m.date.isoformat(),
            "score": m.score,
            "result": m.result,
            "kills": m.kills,
            "deaths": m.deaths
        }
        for m in matches
    ]

    return predict_future_performance(matches_list)
