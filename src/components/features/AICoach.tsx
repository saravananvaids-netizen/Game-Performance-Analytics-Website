import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Zap,
  Target,
  ShieldAlert,
  Dumbbell,
  Compass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { MatchRecord, PlayerProfile, AICoachingAdvice, GameType } from '../../types';
import {
  calculateWinRate,
  calculateKdRatio,
  calculateAvgScore,
  calculateAvgAccuracy,
  generateHeuristicCoaching
} from '../../services/analyticsService';
import { fetchAICoachingAdvice } from '../../services/aiService';
import { SUPPORTED_GAMES } from '../../data/initialData';

interface AICoachProps {
  matches: MatchRecord[];
  profile: PlayerProfile;
  activeGame: GameType;
}

export const AICoach: React.FC<AICoachProps> = ({ matches, profile, activeGame }) => {
  const [advice, setAdvice] = useState<AICoachingAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiChecked, setApiChecked] = useState(false);
  const [hasServerGeminiKey, setHasServerGeminiKey] = useState(false);

  const activeGameConfig = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];
  const gameMatches = matches.filter(m => m.gameId === activeGame);

  const statsSummary = {
    totalMatches: gameMatches.length,
    winRate: calculateWinRate(gameMatches),
    wins: gameMatches.filter(m => m.result === 'WIN').length,
    losses: gameMatches.filter(m => m.result === 'LOSS').length,
    kdRatio: calculateKdRatio(gameMatches).kd,
    kills: gameMatches.reduce((acc, m) => acc + (m.kills || 0), 0),
    deaths: gameMatches.reduce((acc, m) => acc + (m.deaths || 0), 0),
    avgScore: calculateAvgScore(gameMatches),
    avgAccuracy: calculateAvgAccuracy(gameMatches)
  };

  // Check health endpoint to know if Gemini Key is active on server
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHasServerGeminiKey(Boolean(data.hasGeminiKey));
        setApiChecked(true);
      })
      .catch(() => {
        setHasServerGeminiKey(false);
        setApiChecked(true);
      });
  }, []);

  // Initialize with deterministic heuristic engine
  useEffect(() => {
    const initial = generateHeuristicCoaching(gameMatches, profile);
    setAdvice(initial);
  }, [gameMatches.length, profile.id, activeGame]);

  const handleRunFullDiagnosis = async () => {
    setLoading(true);
    try {
      const result = await fetchAICoachingAdvice(
        profile,
        activeGameConfig.name,
        statsSummary,
        gameMatches
      );
      setAdvice(result);
    } catch (e) {
      console.error(e);
      setAdvice(generateHeuristicCoaching(gameMatches, profile));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e172e] via-[#131130] to-[#0c182b] border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">
                GameVision AI Coaching Engine
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                PRO ESPORTS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Tactical telemetry analysis, archetype classification, and personalized training routines customized to your recent matches.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <button
            onClick={handleRunFullDiagnosis}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-400/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Telemetry...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                Generate Deep Diagnosis
              </>
            )}
          </button>

          {/* Transparent Engine Source Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                advice?.isAiGenerated ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span>
              Engine: <strong className="text-slate-200">{advice?.modelUsed || 'Heuristic Rules Engine'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Engine Transparency Notice */}
      <div className="p-3.5 rounded-xl bg-[#090f1f] border border-slate-800 text-xs flex items-center gap-3">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <div className="text-slate-300">
          <strong className="text-white">Transparent AI Disclaimer:</strong>{' '}
          {advice?.isAiGenerated ? (
            <span>
              Coaching recommendations were generated dynamically by <strong>Google Gemini 3.8 Flash</strong> through our server-side esports proxy.
            </span>
          ) : (
            <span>
              Currently operating on our <strong>Deterministic Esports Heuristic Engine</strong> (rule-based telemetry analysis comparing your stats against competitive benchmarks).
              {hasServerGeminiKey && ' Click "Generate Deep Diagnosis" to run live server AI analysis.'}
            </span>
          )}
        </div>
      </div>

      {/* Executive Verdict & Archetype */}
      {advice && (
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Tactical Archetype
              </span>
              <div className="text-2xl font-black text-cyan-300 flex items-center gap-2 mt-0.5">
                <Target className="w-6 h-6 text-cyan-400" />
                {advice.archetype}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                Analyzed: <strong className="text-white">{gameMatches.length} matches</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                Win Rate: <strong className="text-emerald-400">{statsSummary.winRate}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                K/D: <strong className="text-cyan-400">{statsSummary.kdRatio}</strong>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Executive Coaching Verdict
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans bg-[#11192d] p-4 rounded-xl border border-slate-800">
              "{advice.overallVerdict}"
            </p>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      {advice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identified Tactical Strengths */}
          <div className="p-5 rounded-xl bg-[#0d1424] border border-emerald-900/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Verified Gameplay Strengths
            </div>
            <div className="space-y-2.5">
              {advice.strengths.map((s, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0f1d2a] border border-emerald-950 text-xs">
                  <div className="font-bold text-emerald-300">{s.title}</div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Weaknesses & Leaks */}
          <div className="p-5 rounded-xl bg-[#0d1424] border border-rose-900/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Critical Gameplay Vulnerabilities
            </div>
            <div className="space-y-2.5">
              {advice.criticalWeaknesses.map((w, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#1f1422] border border-rose-950 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">{w.title}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        w.severity === 'HIGH'
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-amber-900 text-amber-200'
                      }`}
                    >
                      {w.severity} PRIORITY
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Training Drills & Practice Routines */}
      {advice && advice.actionableDrills.length > 0 && (
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" />
            Prescribed Training Drills & Target Metrics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {advice.actionableDrills.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111a2f] border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{d.drill}</div>
                  <div className="text-[11px] text-cyan-400 font-semibold mt-1">
                    Focus: {d.focusArea}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#090f1d] border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Goal Target</span>
                  <span className="font-mono text-emerald-400 font-bold">{d.targetMetric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Next 5 Matches Tactical Adjustment */}
      {advice && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-[#11192e] to-[#1a1230] border border-purple-500/30 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            Tactical Adjustment for Your Next 5 Matches
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {advice.tacticalAdjustment}
          </p>
          {advice.sessionAdvice && (
            <div className="pt-2 text-xs text-slate-400 border-t border-slate-800 mt-2 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{advice.sessionAdvice}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
