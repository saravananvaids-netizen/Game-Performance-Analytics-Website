from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from .database import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    player_id = Column(String, default="player-current", index=True)
    game_id = Column(String, index=True)
    game_title = Column(String)
    game_mode = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    result = Column(String)  # WIN, LOSS, DRAW
    score = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=30)
    kills = Column(Integer, default=0)
    deaths = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    accuracy = Column(Float, nullable=True)
    headshots = Column(Integer, nullable=True)
    damage_dealt = Column(Integer, nullable=True)
    objectives_completed = Column(Integer, nullable=True)
    map_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    tag = Column(String)
    avatar = Column(String)
    primary_game = Column(String)
    rank = Column(String)
    level = Column(Integer, default=1)
    bio = Column(Text, nullable=True)
