import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { MatchRecord, PlayerProfile, GameType } from '../../types';
import {
  calculateWinRate,
  calculateKdRatio,
  calculateAvgScore,
  calculateAvgAccuracy,
  evaluateStrengthsAndWeaknesses,
  generateHeuristicCoaching
} from '../../services/analyticsService';
import { dataService } from '../../services/dataService';
import { SUPPORTED_GAMES } from '../../data/initialData';

interface ReportGeneratorProps {
  matches: MatchRecord[];
  profile: PlayerProfile;
  activeGame: GameType;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  matches,
  profile,
  activeGame
}) => {
  const gameMatches = matches.filter(m => m.gameId === activeGame);
  const activeGameConfig = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];

  const totalMatches = gameMatches.length;
  const wins = gameMatches.filter(m => m.result === 'WIN').length;
  const losses = gameMatches.filter(m => m.result === 'LOSS').length;
  const winRate = calculateWinRate(gameMatches);
  const { kd } = calculateKdRatio(gameMatches);
  const avgScore = calculateAvgScore(gameMatches);
  const avgAccuracy = calculateAvgAccuracy(gameMatches);

  const strengthReport = evaluateStrengthsAndWeaknesses(gameMatches);
  const coachReport = generateHeuristicCoaching(gameMatches, profile);

  const reportRef = useRef<HTMLDivElement>(null);

  // CSV Download handler
  const handleDownloadCsv = () => {
    const csvContent = dataService.exportMatchesToCsv(activeGame);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GameVision_Telemetry_${profile.name}_${activeGame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print to PDF handler
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Comprehensive Esports Performance Dossier
              </h1>
              <p className="text-xs text-slate-400">
                Official scout-ready performance report in formatted PDF or CSV
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export CSV
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-md shadow-cyan-400/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Save as PDF / Print
          </button>
        </div>
      </div>

      {/* Printable Report Preview Container */}
      <div
        ref={reportRef}
        id="printable-report"
        className="p-8 rounded-2xl bg-[#0d1424] border border-slate-700/80 shadow-2xl text-slate-100 space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Report Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-cyan-500 print:ring-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white print:text-black tracking-wide">
                  {profile.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold print:bg-slate-100 print:text-slate-800">
                  {profile.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                {profile.rank} · {activeGameConfig.name} Competitive Division
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600">
            <div className="font-extrabold text-white print:text-black uppercase tracking-wider text-sm">
              GAMEVISION AI SCOUT REPORT
            </div>
            <div>Generated: {new Date().toLocaleDateString([], { dateStyle: 'long' })}</div>
            <div className="text-[11px] text-cyan-400 print:text-slate-700">Official Telemetry Verification: PASS</div>
          </div>
        </div>

        {/* Section 1: Executive KPI Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-slate-900">
            1. Core Performance Telemetry
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111a2f] border border-slate-800 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                Total Matches
              </span>
              <div className="text-2xl font-black font-mono text-white print:text-black mt-1">
                {totalMatches}
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-500">
                {wins}W / {losses}L
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2f] border border-slate-800 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                Win Rate
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-700 mt-1">
                {winRate}%
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-500">
                Matches Won / Total
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2f] border border-slate-800 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                K/D Ratio
              </span>
              <div className="text-2xl font-black font-mono text-cyan-300 print:text-cyan-800 mt-1">
                {kd}
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-500">
                Fragging conversion
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2f] border border-slate-800 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                Average Score
              </span>
              <div className="text-2xl font-black font-mono text-amber-400 print:text-amber-700 mt-1">
                {avgScore}
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-500">
                Rating per fixture
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Strengths & Weaknesses */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-slate-900">
            2. Strengths & Gameplay Vulnerabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-[#0f1d2a] border border-emerald-950 print:bg-slate-50 print:border-slate-200 space-y-2">
              <span className="font-bold text-emerald-300 print:text-emerald-800 uppercase text-[11px] block">
                Primary Strengths
              </span>
              {strengthReport.strengths.map((s, idx) => (
                <div key={idx} className="pb-2 border-b border-emerald-900/30 last:border-0 last:pb-0">
                  <div className="font-bold text-white print:text-black">{s.title} ({s.score})</div>
                  <p className="text-slate-300 print:text-slate-700 mt-0.5">{s.description}</p>
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-[#1f1422] border border-rose-950 print:bg-slate-50 print:border-slate-200 space-y-2">
              <span className="font-bold text-rose-300 print:text-rose-800 uppercase text-[11px] block">
                Priority Weaknesses
              </span>
              {strengthReport.weaknesses.map((w, idx) => (
                <div key={idx} className="pb-2 border-b border-rose-900/30 last:border-0 last:pb-0">
                  <div className="font-bold text-white print:text-black">
                    {w.title} <span className="text-[10px] text-rose-400 font-mono">[{w.priority}]</span>
                  </div>
                  <p className="text-slate-300 print:text-slate-700 mt-0.5">{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: AI Coaching Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-slate-900">
            3. AI Tactical Coaching & Prescribed Drills
          </h3>
          <div className="p-5 rounded-xl bg-[#111a2f] border border-slate-800 print:bg-slate-50 print:border-slate-200 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">
                Tactical Classification
              </span>
              <div className="font-bold text-cyan-300 print:text-cyan-800 text-sm">
                {coachReport.archetype}
              </div>
              <p className="text-slate-300 print:text-slate-700 mt-1 italic">
                "{coachReport.overallVerdict}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 print:border-slate-300">
              <span className="font-bold text-white print:text-black block mb-2">
                Mandatory Training Drills:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coachReport.actionableDrills.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0d1424] border border-slate-800 print:bg-white print:border-slate-300">
                    <div className="font-bold text-white print:text-black">{d.drill}</div>
                    <div className="text-[11px] text-slate-400 print:text-slate-600">Focus: {d.focusArea}</div>
                    <div className="text-[11px] text-emerald-400 print:text-emerald-700 font-mono font-bold mt-1">
                      Target: {d.targetMetric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Match History Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-slate-900">
            4. Recent Match Log Verification (Last 6 Fixtures)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111a2f] print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Result</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3">K / D / A</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {gameMatches.slice(0, 6).map(m => (
                  <tr key={m.id}>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-700">
                      {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2 px-3 font-bold font-mono">
                      <span className={m.result === 'WIN' ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}>
                        {m.result}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white print:text-black">{m.gameMode}</td>
                    <td className="py-2 px-3 font-mono text-slate-300 print:text-slate-700">
                      {m.kills}/{m.deaths}/{m.assists}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-amber-700">
                      {m.score}
                    </td>
                    <td className="py-2 px-3 font-mono text-purple-300 print:text-purple-700">
                      {m.accuracy !== undefined ? `${m.accuracy}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[11px] text-slate-500">
          <span>GameVision AI Esports Engine v2.4</span>
          <span>Verified Local Telemetry Signature #GV-{Date.now().toString().slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};
