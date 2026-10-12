import React from 'react';
import {
  Target,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  Dumbbell,
  Compass,
  FileQuestion,
  CheckCircle2,
  TrendingUp,
  Brain
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { evaluateStrengthsAndWeaknesses } from '../../services/analyticsService';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';

interface StrengthsWeaknessesProps {
  matches: MatchRecord[];
  activeGame: GameType;
}

export const StrengthsWeaknesses: React.FC<StrengthsWeaknessesProps> = ({ matches, activeGame }) => {
  const gameMatches = matches.filter(m => m.gameId === activeGame);
  const report = evaluateStrengthsAndWeaknesses(gameMatches);

  const radarData = report.dimensions.map(d => ({
    subject: d.subject,
    score: d.score,
    fullMark: d.fullMark
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Strength & Weakness Detection Matrix
            </h1>
            <p className="text-xs text-slate-400">
              6-Dimensional radar analysis grounded in empirical match telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart & High-Level Dimension Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart Visual */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              6-Axis Skill Hexagon
            </h2>
            <p className="text-xs text-slate-400">
              Normalized benchmark ratings (0 - 100)
            </p>
          </div>

          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#334155"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f1d',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} / 100`, 'Rating']}
                />
                <Radar
                  name="Player Metric"
                  dataKey="score"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Based on {gameMatches.length} analyzed matches in active game queue
          </div>
        </div>

        {/* Detailed Dimension Mathematical Explanations */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Dimension Calculation Proofs
          </h2>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {report.dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#111a2e] border border-slate-800/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{dim.subject}</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {dim.score} / 100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {dim.explanation}
                </p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${dim.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categorized Findings: Strengths, Weaknesses, Inconsistencies, Practice Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identified Strengths */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-emerald-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Verified Strength Areas
          </div>
          <div className="space-y-2.5">
            {report.strengths.map((s, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#0e1d2c] border border-emerald-950 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">{s.title}</span>
                  <span className="font-mono text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80">
                    {s.score}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">{s.description}</p>
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  Advise: {s.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Weaknesses */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-rose-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4" />
            Areas Needing Correction
          </div>
          <div className="space-y-2.5">
            {report.weaknesses.map((w, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#201323] border border-rose-950 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">{w.title}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      w.priority === 'HIGH' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
                    }`}
                  >
                    {w.priority}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">{w.description}</p>
                <div className="mt-2 text-[11px] text-slate-400">
                  <strong className="text-rose-300">Correction:</strong> {w.fixGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inconsistent Gameplay Patterns & Targeted Practice Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inconsistent Patterns */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-amber-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Inconsistent Gameplay Patterns
          </div>
          <ul className="space-y-2 text-xs">
            {report.inconsistentPatterns.map((pat, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-[#191823] border border-amber-950 text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                <span>{pat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practice Areas */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-cyan-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" />
            Recommended Practice Modules
          </div>
          <div className="flex flex-wrap gap-2">
            {report.practiceAreas.map((area, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-[#101e33] border border-cyan-800/60 text-cyan-300 text-xs font-semibold"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
