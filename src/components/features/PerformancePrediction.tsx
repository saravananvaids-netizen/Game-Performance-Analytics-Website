import React from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Target,
  ShieldAlert,
  Percent,
  Sparkles
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { predictNextPerformance } from '../../services/analyticsService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface PerformancePredictionProps {
  matches: MatchRecord[];
  activeGame: GameType;
  onOpenAddMatch: () => void;
}

export const PerformancePrediction: React.FC<PerformancePredictionProps> = ({
  matches,
  activeGame,
  onOpenAddMatch
}) => {
  const gameMatches = matches.filter(m => m.gameId === activeGame);
  const prediction = predictNextPerformance(gameMatches);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Statistical & Machine Learning Performance Predictor
            </h1>
            <p className="text-xs text-slate-400">
              Time-series regression & weighted moving average forecasts for upcoming competitive fixtures
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient Data State */}
      {!prediction.hasSufficientData ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Insufficient Historical Telemetry</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Machine learning forecasting requires at least <strong>{prediction.minMatchesRequired} matches</strong> to calculate statistically sound regression coefficients. You currently have <strong>{prediction.currentMatches} match(es)</strong> recorded.
            </p>
          </div>
          <button
            onClick={onOpenAddMatch}
            className="px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs"
          >
            Record Match Telemetry Now
          </button>
        </div>
      ) : (
        <>
          {/* Main 3 Prediction Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Projected Next Match Score */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0e1629] to-[#121c35] border border-cyan-500/30 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Forecasted Match Score
              </span>
              <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                {prediction.predictedScore} <span className="text-sm font-sans font-normal text-slate-400">pts</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Regression + WMA blend</span>
              </div>
            </div>

            {/* Estimated Next Match Win Probability */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0e1629] to-[#0e242b] border border-emerald-500/30 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Estimated Win Probability
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                {prediction.predictedWinProbability}%
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Bayesian momentum model</span>
              </div>
            </div>

            {/* Projected Fragging K/D */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0e1629] to-[#1c1232] border border-purple-500/30 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Projected Combat K/D
              </span>
              <div className="text-3xl font-black font-mono text-purple-300 mt-1">
                {prediction.predictedKD}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Confidence Rating: <strong>{prediction.confidenceScore}%</strong></span>
              </div>
            </div>
          </div>

          {/* Historical vs Predicted Timeline Chart */}
          <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Historical Actual vs Predicted Trajectory
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solid cyan line represents recorded match scores; purple dashed line shows regression fit & 3 future projections
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#111a2f] border border-slate-700 font-mono text-slate-300">
                  Trend Slope: <strong>{prediction.trendDirection.toUpperCase()}</strong>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.historicalVsPredicted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dateLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090f1d',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actualScore"
                    name="Actual Match Score"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedScore"
                    name="Predicted / Projected Trajectory"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#7e22ce', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Weight Factors */}
          <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Mathematical Model Influencing Factors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prediction.factors.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#111a2e] border border-slate-800 flex items-start gap-3"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      f.impact === 'positive'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : f.impact === 'negative'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{f.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Weight: {f.weight}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Transparent Disclaimer */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-amber-900/40 text-xs text-slate-300 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Statistical Disclaimer:</strong> Performance predictions are empirical mathematical estimates based on historical linear progression and moving averages. They do not constitute guaranteed in-game outcomes. Real results vary based on opponent matchmaking tiers, ping, squad chemistry, and in-game tactical decisions.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
