import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  Target,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  Crosshair,
  ArrowRight,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { MatchRecord, PlayerProfile, GameType } from '../../types';
import { MetricCard } from '../common/MetricCard';
import {
  calculateWinRate,
  calculateKdRatio,
  calculateAvgScore,
  calculateAvgAccuracy,
  calculateTrends,
  evaluateStrengthsAndWeaknesses,
  generateHeuristicCoaching
} from '../../services/analyticsService';
import { SUPPORTED_GAMES } from '../../data/initialData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface OverviewDashboardProps {
  matches: MatchRecord[];
  profile: PlayerProfile;
  activeGame: GameType;
  onOpenAddMatch: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  matches,
  profile,
  activeGame,
  onOpenAddMatch,
  onNavigateToTab
}) => {
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '7d' | '30d'>('all');
  const [goals, setGoals] = useState([
    { id: 1, text: 'Maintain K/D above 1.5 in Competitive mode', done: true },
    { id: 2, text: 'Boost headshot/aim precision past 28%', done: false },
    { id: 3, text: 'Win 4 matches in next 5 sessions', done: false },
    { id: 4, text: 'Review AI coach positioning drills before queuing', done: true }
  ]);

  // Filter matches based on date range
  const filteredMatches = matches.filter(m => {
    if (dateRangeFilter === 'all') return true;
    const matchDate = new Date(m.date).getTime();
    const now = new Date().getTime();
    const days = dateRangeFilter === '7d' ? 7 : 30;
    return now - matchDate <= days * 24 * 60 * 60 * 1000;
  });

  const totalMatches = filteredMatches.length;
  const wins = filteredMatches.filter(m => m.result === 'WIN').length;
  const losses = filteredMatches.filter(m => m.result === 'LOSS').length;
  const draws = filteredMatches.filter(m => m.result === 'DRAW').length;

  const winRate = calculateWinRate(filteredMatches);
  const { kd: kdRatio, isFlawless } = calculateKdRatio(filteredMatches);
  const avgScore = calculateAvgScore(filteredMatches);
  const avgAccuracy = calculateAvgAccuracy(filteredMatches);
  const trends = calculateTrends(filteredMatches);

  const totalKills = filteredMatches.reduce((acc, m) => acc + (m.kills || 0), 0);
  const totalDeaths = filteredMatches.reduce((acc, m) => acc + (m.deaths || 0), 0);

  const activeGameConfig = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];
  const strengthReport = evaluateStrengthsAndWeaknesses(filteredMatches);
  const heuristicCoach = generateHeuristicCoaching(filteredMatches, profile);

  // Prepare chart data (chronological order)
  const timelineData = [...filteredMatches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((m, idx) => ({
      name: `M${idx + 1}`,
      date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: m.score,
      kd: m.deaths === 0 ? m.kills : Number(((m.kills || 0) / m.deaths).toFixed(2)),
      kills: m.kills,
      result: m.result
    }));

  const pieData = [
    { name: 'Wins', value: wins, color: '#10b981' },
    { name: 'Losses', value: losses, color: '#f43f5e' },
    ...(draws > 0 ? [{ name: 'Draws', value: draws, color: '#f59e0b' }] : [])
  ];

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => (g.id === id ? { ...g, done: !g.done } : g)));
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Filter Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#0d1a33] to-[#12132e] border border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-950"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500 text-black">
              PRO
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Welcome back, {profile.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-bold">
                {profile.rank}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>Primary Engine: <strong className="text-cyan-300">{activeGameConfig.name}</strong></span>
              <span>·</span>
              <span>Level {profile.level}</span>
              <span>·</span>
              <span className="text-emerald-400">Competitive Ranked</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Date Range Filter */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-[#090e1a] border border-slate-800 rounded-lg">
            <button
              onClick={() => setDateRangeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                dateRangeFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRangeFilter('30d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                dateRangeFilter === '30d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRangeFilter('7d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                dateRangeFilter === '7d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          <button
            onClick={onOpenAddMatch}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-400/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Match
          </button>
        </div>
      </div>

      {/* 4 Core Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Matches"
          value={totalMatches}
          subtitle={`${wins} Wins · ${losses} Losses · ${draws} Draws`}
          icon={Swords}
          accentColor="cyan"
          trend={{
            value: totalMatches,
            label: 'total logged',
            isPositive: totalMatches > 0
          }}
        />

        <MetricCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`Formula: (${wins} / ${totalMatches || 1}) × 100`}
          icon={Trophy}
          accentColor="emerald"
          trend={{
            value: trends.winRateDiff !== 0 ? `${trends.winRateDiff > 0 ? '+' : ''}${trends.winRateDiff}%` : 'Even',
            label: 'vs prior 5',
            isPositive: trends.winRateDiff > 0
          }}
        />

        <MetricCard
          title="Kill / Death (K/D)"
          value={isFlawless ? `${kdRatio}*` : kdRatio}
          subtitle={`${totalKills} Kills / ${totalDeaths} Deaths ${isFlawless ? '(0 Deaths)' : ''}`}
          icon={Crosshair}
          accentColor="purple"
          trend={{
            value: trends.kdDiff !== 0 ? `${trends.kdDiff > 0 ? '+' : ''}${trends.kdDiff}` : 'Stable',
            label: 'recent delta',
            isPositive: trends.kdDiff > 0
          }}
        />

        <MetricCard
          title="Average Score"
          value={avgScore}
          subtitle={`Accuracy: ${avgAccuracy > 0 ? `${avgAccuracy}%` : 'N/A'}`}
          icon={Flame}
          accentColor="amber"
          trend={{
            value: trends.scoreDiff !== 0 ? `${trends.scoreDiff > 0 ? '+' : ''}${trends.scoreDiff} pts` : 'Stable',
            label: 'recent form',
            isPositive: trends.scoreDiff > 0
          }}
        />
      </div>

      {/* Middle Grid: Performance Trend Line Chart & Win/Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Performance & Score Momentum (Last 10 Matches)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time scoring telemetry and K/D progression
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090f1d',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Match Score"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kd"
                    name="K/D Ratio"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#7e22ce', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No match records found. Click "Log Match" to record gameplay.
              </div>
            )}
          </div>
        </div>

        {/* Win vs Loss Distribution */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Outcome Ratio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Wins vs Losses vs Draws
            </p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            {totalMatches > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090f1d',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No match records</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-around text-center text-xs">
            <div>
              <div className="text-slate-400">Wins</div>
              <div className="font-mono font-bold text-emerald-400 text-base">{wins}</div>
            </div>
            <div>
              <div className="text-slate-400">Losses</div>
              <div className="font-mono font-bold text-rose-400 text-base">{losses}</div>
            </div>
            <div>
              <div className="text-slate-400">Win Rate</div>
              <div className="font-mono font-bold text-cyan-400 text-base">{winRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid: Recent Match History + AI Coach Snippet + Improvement Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Match History (Last 5) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Recent Matches
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Most recent 5 competitive sessions
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111a2f] text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Game / Mode</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">K / D / A</th>
                  <th className="py-2.5 px-3">K/D</th>
                  <th className="py-2.5 px-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredMatches.slice(0, 5).map(m => {
                  const kd = m.deaths === 0 ? m.kills.toFixed(2) : (m.kills / m.deaths).toFixed(2);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-black px-2 py-0.5 rounded text-[10px] ${
                            m.result === 'WIN'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : m.result === 'LOSS'
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {m.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{m.gameTitle}</div>
                        <div className="text-[10px] text-slate-400">{m.gameMode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(m.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {m.kills}/{m.deaths}/{m.assists}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                        {kd}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {m.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Coaching & Goals Card */}
        <div className="space-y-6">
          {/* AI Coach Recommendation Teaser */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#101b33] to-[#17122b] border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Tactical Coach Insight
                </h3>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                {heuristicCoach.archetype}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {heuristicCoach.overallVerdict}
            </p>

            <div className="mt-3 p-3 rounded-lg bg-[#0a1122] border border-slate-800 text-xs">
              <span className="text-cyan-400 font-bold block mb-1">
                Priority Tactical Adjustment:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {heuristicCoach.tacticalAdjustment}
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('coach')}
              className="mt-4 w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              Open Full AI Coaching Console <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Improvement Goals */}
          <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Active Training Goals
              </h3>
              <span className="text-[10px] text-slate-400">
                {goals.filter(g => g.done).length}/{goals.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {goals.map(g => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 text-xs ${
                    g.done
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                      : 'bg-[#11192d] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <button type="button" className="mt-0.5">
                    {g.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  <span className={g.done ? 'line-through text-slate-400' : ''}>
                    {g.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
