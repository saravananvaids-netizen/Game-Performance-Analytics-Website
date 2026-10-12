"""
GameVision AI - Machine Learning Prediction Module
Utilizes scikit-learn LinearRegression and pandas for match telemetry forecasts.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.linear_model import LinearRegression

def predict_future_performance(matches_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not matches_data or len(matches_data) < 3:
        return {
            "has_sufficient_data": False,
            "min_matches_required": 3,
            "current_matches": len(matches_data) if matches_data else 0,
            "predicted_score": 0.0,
            "predicted_win_probability": 50.0,
            "predicted_kd": 1.0,
            "confidence_score": 0.0
        }

    df = pd.DataFrame(matches_data)
    df = df.sort_values(by="date", ascending=True).reset_index(drop=True)

    # Features: Match index sequence (1, 2, ..., N)
    X = np.arange(1, len(df) + 1).reshape(-1, 1)
    y_score = df["score"].values

    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y_score)

    next_match_idx = np.array([[len(df) + 1]])
    reg_score_pred = float(model.predict(next_match_idx)[0])

    # Weighted moving average of recent 5 scores
    recent_slice = df.tail(5)
    weights = np.arange(1, len(recent_slice) + 1)
    wma_score = float(np.average(recent_slice["score"], weights=weights))

    # Blend
    final_score_pred = round(max(50.0, reg_score_pred * 0.4 + wma_score * 0.6), 1)

    # Win probability
    recent_wins = (recent_slice["result"] == "WIN").sum()
    recent_wr = (recent_wins / len(recent_slice)) * 100.0
    overall_wins = (df["result"] == "WIN").sum()
    overall_wr = (overall_wins / len(df)) * 100.0
    pred_win_prob = round(float(recent_wr * 0.6 + overall_wr * 0.4), 1)

    # K/D forecast
    total_k = recent_slice["kills"].sum()
    total_d = max(1, recent_slice["deaths"].sum())
    pred_kd = round(float(total_k / total_d), 2)

    confidence = round(min(95.0, max(40.0, len(df) * 5.0)), 1)

    return {
        "has_sufficient_data": True,
        "min_matches_required": 3,
        "current_matches": len(df),
        "predicted_score": final_score_pred,
        "predicted_win_probability": pred_win_prob,
        "predicted_kd": pred_kd,
        "confidence_score": confidence
    }
