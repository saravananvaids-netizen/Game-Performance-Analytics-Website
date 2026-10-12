import React from 'react';
import {
  Percent,
  Trophy,
  Flame,
  ShieldAlert,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { calculateWinRate } from '../../services/analyticsService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

interface WinRateAnalyzerProps {
  matches: MatchRecord[];
  activeGame: GameType;
}

export const WinRateAnalyzer: React.FC<WinRateAnalyzerProps> = ({ matches, activeGame }) => {
  const gameMatches = matches.filter(m => m.gameId === activeGame);
  const totalMatches = gameMatches.length;

  const wins = gameMatches.filter(m => m.result === 'WIN').length;
  const losses = gameMatches.filter(m => m.result === 'LOSS').length;
  const draws = gameMatches.filter(m => m.result === 'DRAW').length;
  const overallWinRate = calculateWinRate(gameMatches);

  // Calculate Streaks (sorted chronological oldest to newest)
  const chronological = [...gameMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentStreak = 0;
  let currentStreakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let tempWin = 0;
  let tempLoss = 0;

  chronological.forEach(m => {
    if (m.result === 'WIN') {
      tempWin++;
      tempLoss = 0;
      if (tempWin > bestWinStreak) bestWinStreak = tempWin;
    } else if (m.result === 'LOSS') {
      tempLoss++;
      tempWin = 0;
      if (tempLoss > worstLossStreak) worstLossStreak = tempLoss;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
  });

  // Calculate current streak from newest matches backwards
  const reversed = [...chronological].reverse();
  if (reversed.length > 0) {
    currentStreakType = reversed[0].result === 'WIN' ? 'WIN' : reversed[0].result === 'LOSS' ? 'LOSS' : 'NONE';
    for (const m of reversed) {
      if (m.result === currentStreakType) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Win Rate by Game Mode
  const modeMap: { [mode: string]: { total: number; wins: number; losses: number } } = {};
  gameMatches.forEach(m => {
    if (!modeMap[m.gameMode]) {
      modeMap[m.gameMode] = { total: 0, wins: 0, losses: 0 };
    }
    modeMap[m.gameMode].total++;
    if (m.result === 'WIN') modeMap[m.gameMode].wins++;
    if (m.result === 'LOSS') modeMap[m.gameMode].losses++;
  });

  const modeChartData = Object.keys(modeMap).map(mode => {
    const data = modeMap[mode];
    const wr = data.total > 0 ? Number(((data.wins / data.total) * 100).toFixed(1)) : 0;
    return {
      mode,
      winRate: wr,
      wins: data.wins,
      losses: data.losses,
      total: data.total
    };
  });

  // Cumulative Win Rate Progression Over Time
  let runningWins = 0;
  const cumulativeData = chronological.map((m, idx) => {
    if (m.result === 'WIN') runningWins++;
    const totalSoFar = idx + 1;
    const wr = Number(((runningWins / totalSoFar) * 100).toFixed(1));
    return {
      matchIndex: `M${totalSoFar}`,
      winRate: wr,
      date: new Date(m.date).toLocaleDateString([], { month: 'numeric', day: 'numeric' })
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Win Rate Analytical Engine
            </h1>
            <p className="text-xs text-slate-400">
              Formula: <code className="text-emerald-300 font-mono">Win Rate = (Matches Won / Total Matches) × 100</code>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Overall Win Rate</span>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">{overallWinRate}%</div>
          <div className="text-xs text-slate-400 mt-2">
            {wins} Won out of {totalMatches} Matches
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Current Streak</span>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1 flex items-center gap-2">
            {currentStreak}
            <span className="text-xs px-2 py-0.5 rounded font-sans uppercase font-bold bg-slate-800 text-slate-300">
              {currentStreakType === 'WIN' ? 'WINS' : currentStreakType === 'LOSS' ? 'LOSSES' : 'NONE'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Active momentum state</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Best Win Streak</span>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-emerald-400" />
            {bestWinStreak} Games
          </div>
          <div className="text-xs text-slate-400 mt-2">Highest consecutive victories</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Max Loss Streak</span>
          <div className="text-3xl font-black font-mono text-rose-400 mt-1">
            {worstLossStreak} Games
          </div>
          <div className="text-xs text-slate-400 mt-2">Tilt control threshold</div>
        </div>
      </div>

      {/* Charts Grid: Win Rate Progression & Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cumulative Win Rate Progression */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Cumulative Win Rate Progression
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical evolution of win probability over logged match sequence
            </p>
          </div>

          <div className="h-64 w-full">
            {cumulativeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="matchIndex" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Win Rate']}
                    contentStyle={{
                      backgroundColor: '#090f1d',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Log matches to visualize win rate trajectory
              </div>
            )}
          </div>
        </div>

        {/* Win Rate by Mode Bar Chart */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Win Rate by Game Mode
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Performance variances across competitive and casual queues
            </p>
          </div>

          <div className="h-64 w-full">
            {modeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mode" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Win Rate']}
                    contentStyle={{
                      backgroundColor: '#090f1d',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="winRate" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No mode data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Telemetry Table */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Detailed Game Mode Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111a2f] text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Matches</th>
                <th className="py-2.5 px-3">Wins</th>
                <th className="py-2.5 px-3">Losses</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {modeChartData.map(m => (
                <tr key={m.mode} className="hover:bg-slate-850">
                  <td className="py-2.5 px-3 font-bold text-white">{m.mode}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{m.total}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">{m.wins}</td>
                  <td className="py-2.5 px-3 font-mono text-rose-400">{m.losses}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                    {m.winRate}%
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          m.winRate >= 65 ? 'bg-emerald-400' : m.winRate >= 50 ? 'bg-cyan-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(100, m.winRate)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
