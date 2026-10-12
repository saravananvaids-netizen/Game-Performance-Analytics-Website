import React, { useState } from 'react';
import {
  Users2,
  Swords,
  Trophy,
  Crosshair,
  Flame,
  Target,
  ArrowRight,
  Shield,
  Percent,
  Check
} from 'lucide-react';
import { LeaderboardPlayer, MatchRecord, PlayerProfile, GameType } from '../../types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { INITIAL_LEADERBOARD_PLAYERS } from '../../data/initialData';

interface PlayerComparisonProps {
  leaderboard: LeaderboardPlayer[];
  initialPlayer2Id?: string;
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({
  leaderboard,
  initialPlayer2Id
}) => {
  const fallbackPlayer: LeaderboardPlayer = INITIAL_LEADERBOARD_PLAYERS[0];
  const fallbackPlayer2: LeaderboardPlayer = INITIAL_LEADERBOARD_PLAYERS[1] || INITIAL_LEADERBOARD_PLAYERS[0];

  const defaultP1: LeaderboardPlayer = leaderboard.find(p => p.isCurrentUser) || leaderboard[0] || fallbackPlayer;
  const defaultP2: LeaderboardPlayer =
    (initialPlayer2Id ? leaderboard.find(p => p.id === initialPlayer2Id) : null) ||
    leaderboard.find(p => p.id !== defaultP1.id) ||
    leaderboard[1] ||
    leaderboard[0] ||
    fallbackPlayer2;

  const [player1Id, setPlayer1Id] = useState<string>(defaultP1.id);
  const [player2Id, setPlayer2Id] = useState<string>(defaultP2.id);

  const p1: LeaderboardPlayer = leaderboard.find(p => p.id === player1Id) || defaultP1;
  const p2: LeaderboardPlayer = leaderboard.find(p => p.id === player2Id) || defaultP2;

  // Comparison metrics
  const metrics = [
    {
      label: 'Win Rate (%)',
      p1Val: p1.winRate,
      p2Val: p2.winRate,
      format: (v: number) => `${v}%`,
      p1Higher: p1.winRate > p2.winRate,
      p2Higher: p2.winRate > p1.winRate
    },
    {
      label: 'K/D Ratio',
      p1Val: p1.kdRatio,
      p2Val: p2.kdRatio,
      format: (v: number) => `${v}`,
      p1Higher: p1.kdRatio > p2.kdRatio,
      p2Higher: p2.kdRatio > p1.kdRatio
    },
    {
      label: 'Average Score',
      p1Val: p1.avgScore,
      p2Val: p2.avgScore,
      format: (v: number) => `${v}`,
      p1Higher: p1.avgScore > p2.avgScore,
      p2Higher: p2.avgScore > p1.avgScore
    },
    {
      label: 'Accuracy / Precision (%)',
      p1Val: p1.avgAccuracy,
      p2Val: p2.avgAccuracy,
      format: (v: number) => (v > 0 ? `${v}%` : 'N/A (No Telemetry)'),
      p1Higher: p1.avgAccuracy > p2.avgAccuracy && p1.avgAccuracy > 0,
      p2Higher: p2.avgAccuracy > p1.avgAccuracy && p2.avgAccuracy > 0
    },
    {
      label: 'Total Matches Logged',
      p1Val: p1.totalMatches,
      p2Val: p2.totalMatches,
      format: (v: number) => `${v}`,
      p1Higher: p1.totalMatches > p2.totalMatches,
      p2Higher: p2.totalMatches > p1.totalMatches
    },
    {
      label: 'Overall Tier Score',
      p1Val: p1.tierScore,
      p2Val: p2.tierScore,
      format: (v: number) => `${v.toLocaleString()}`,
      p1Higher: p1.tierScore > p2.tierScore,
      p2Higher: p2.tierScore > p1.tierScore
    }
  ];

  // Head-to-head score
  const p1WinsCount = metrics.filter(m => m.p1Higher).length;
  const p2WinsCount = metrics.filter(m => m.p2Higher).length;

  // Radar chart data
  const radarData = [
    {
      dimension: 'Win Impact',
      [p1.name]: Math.min(100, Math.round(p1.winRate)),
      [p2.name]: Math.min(100, Math.round(p2.winRate))
    },
    {
      dimension: 'Combat (K/D)',
      [p1.name]: Math.min(100, Math.round((p1.kdRatio / 2.2) * 100)),
      [p2.name]: Math.min(100, Math.round((p2.kdRatio / 2.2) * 100))
    },
    {
      dimension: 'Scoring Power',
      [p1.name]: Math.min(100, Math.round((p1.avgScore / 350) * 100)),
      [p2.name]: Math.min(100, Math.round((p2.avgScore / 350) * 100))
    },
    {
      dimension: 'Precision Aim',
      [p1.name]: p1.avgAccuracy > 0 ? Math.min(100, Math.round((p1.avgAccuracy / 35) * 100)) : 50,
      [p2.name]: p2.avgAccuracy > 0 ? Math.min(100, Math.round((p2.avgAccuracy / 35) * 100)) : 50
    },
    {
      dimension: 'Match Volume',
      [p1.name]: Math.min(100, Math.round((p1.totalMatches / 100) * 100)),
      [p2.name]: Math.min(100, Math.round((p2.totalMatches / 100) * 100))
    },
    {
      dimension: 'Tier Standing',
      [p1.name]: Math.min(100, Math.round((p1.tierScore / 10000) * 100)),
      [p2.name]: Math.min(100, Math.round((p2.tierScore / 10000) * 100))
    }
  ];

  // Bar chart comparison data
  const barData = [
    { metric: 'Win Rate %', [p1.name]: p1.winRate, [p2.name]: p2.winRate },
    { metric: 'K/D Ratio', [p1.name]: p1.kdRatio * 20, [p2.name]: p2.kdRatio * 20 },
    { metric: 'Avg Score (scaled)', [p1.name]: Math.round(p1.avgScore / 4), [p2.name]: Math.round(p2.avgScore / 4) }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Head-to-Head Player Comparison Matrix
            </h1>
            <p className="text-xs text-slate-400">
              Side-by-side performance benchmarking across combat, win rate, and efficiency metrics
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-[#0a101f] border border-slate-800">
        {/* Player 1 Selector */}
        <div>
          <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            Player 1 (Cyan)
          </label>
          <select
            value={player1Id}
            onChange={e => setPlayer1Id(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-400"
          >
            {leaderboard.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.tag}) — {p.rank}
              </option>
            ))}
          </select>
        </div>

        {/* Player 2 Selector */}
        <div>
          <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
            Player 2 (Purple)
          </label>
          <select
            value={player2Id}
            onChange={e => setPlayer2Id(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-400"
          >
            {leaderboard.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.tag}) — {p.rank}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Head-to-Head Player Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* P1 Card */}
        <div className="p-5 rounded-xl bg-[#0d1424] border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={p1.avatar}
              alt={p1.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-cyan-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{p1.name}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                  {p1.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{p1.rank}</p>
              <div className="text-[11px] text-cyan-400 font-semibold mt-1">
                Category Leader in {p1WinsCount} of 6 Metrics
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Tier Score</span>
            <span className="text-2xl font-black font-mono text-cyan-300">
              {p1.tierScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* P2 Card */}
        <div className="p-5 rounded-xl bg-[#0d1424] border-2 border-purple-500/40 shadow-xl shadow-purple-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={p2.avatar}
              alt={p2.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-purple-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{p2.name}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
                  {p2.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{p2.rank}</p>
              <div className="text-[11px] text-purple-400 font-semibold mt-1">
                Category Leader in {p2WinsCount} of 6 Metrics
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Tier Score</span>
            <span className="text-2xl font-black font-mono text-purple-300">
              {p2.tierScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Metric Comparison Table */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl overflow-hidden">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Direct Metric Benchmarks
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111a2f] text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-1/3">Benchmark Dimension</th>
                <th className="py-3 px-4 w-1/3 text-center text-cyan-300 font-bold">{p1.name}</th>
                <th className="py-3 px-4 w-1/3 text-center text-purple-300 font-bold">{p2.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-850">
                  <td className="py-3 px-4 font-semibold text-white">{m.label}</td>
                  
                  {/* P1 Val */}
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span
                      className={`px-3 py-1 rounded-lg ${
                        m.p1Higher
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm'
                          : 'text-slate-300'
                      }`}
                    >
                      {m.format(m.p1Val)}
                    </span>
                  </td>

                  {/* P2 Val */}
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span
                      className={`px-3 py-1 rounded-lg ${
                        m.p2Higher
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm'
                          : 'text-slate-300'
                      }`}
                    >
                      {m.format(m.p2Val)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay Radar Chart */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Head-to-Head Hexagonal Radar Overlay
          </h2>
          <p className="text-xs text-slate-400">
            Direct visual comparison of skill distribution ({p1.name} in Cyan vs {p2.name} in Purple)
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090f1d',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Radar
                name={p1.name}
                dataKey={p1.name}
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.25}
              />
              <Radar
                name={p2.name}
                dataKey={p2.name}
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
