import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart2,
  Clock
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { calculateWinRate, calculateKdRatio, calculateAvgScore } from '../../services/analyticsService';
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

interface ProgressTrackerProps {
  matches: MatchRecord[];
  activeGame: GameType;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ matches, activeGame }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'kd' | 'winrate'>('score');

  const gameMatches = matches.filter(m => m.gameId === activeGame);

  // Group matches by timeframes
  const groupedData: { [key: string]: { label: string; matches: MatchRecord[] } } = {};

  const sortedChronological = [...gameMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedChronological.forEach(m => {
    const d = new Date(m.date);
    let key = '';
    let label = '';

    if (timeframe === 'daily') {
      key = d.toISOString().split('T')[0];
      label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (timeframe === 'weekly') {
      // Calculate start of week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      key = `${monday.getFullYear()}-W${Math.ceil(monday.getDate() / 7)}`;
      label = `Wk ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    } else {
      key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      label = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }

    if (!groupedData[key]) {
      groupedData[key] = { label, matches: [] };
    }
    groupedData[key].matches.push(m);
  });

  const chartData = Object.keys(groupedData).map(k => {
    const item = groupedData[k];
    const ms = item.matches;
    const wr = calculateWinRate(ms);
    const { kd } = calculateKdRatio(ms);
    const avgScore = calculateAvgScore(ms);

    return {
      period: item.label,
      matchCount: ms.length,
      score: avgScore,
      kd: kd,
      winrate: wr
    };
  });

  // Period vs Previous Period comparison (Recent half vs Previous half)
  const half = Math.max(1, Math.floor(gameMatches.length / 2));
  const currentPeriod = gameMatches.slice(0, half);
  const previousPeriod = gameMatches.slice(half, half * 2);

  const currWr = calculateWinRate(currentPeriod);
  const prevWr = calculateWinRate(previousPeriod);
  const wrDelta = Number((currWr - prevWr).toFixed(1));

  const currKd = calculateKdRatio(currentPeriod).kd;
  const prevKd = calculateKdRatio(previousPeriod).kd;
  const kdDelta = Number((currKd - prevKd).toFixed(2));

  const currScore = calculateAvgScore(currentPeriod);
  const prevScore = calculateAvgScore(previousPeriod);
  const scoreDelta = currScore - prevScore;

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Progress & Development Tracker
              </h1>
              <p className="text-xs text-slate-400">
                Evaluating period-over-period skill evolution and consistency curves
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center p-1 bg-[#111a2f] border border-slate-800 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <div className="flex items-center p-1 bg-[#111a2f] border border-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedMetric('score')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'score'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Score
            </button>
            <button
              onClick={() => setSelectedMetric('kd')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'kd'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              K/D
            </button>
            <button
              onClick={() => setSelectedMetric('winrate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'winrate'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Win Rate %
            </button>
          </div>
        </div>
      </div>

      {/* Period Delta Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Win Rate Delta */}
        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Win Rate Delta</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currWr}% <span className="text-xs text-slate-400 font-sans font-normal">vs {prevWr}%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Current half vs previous half</div>
          </div>
          <div
            className={`p-2.5 rounded-lg border flex items-center gap-1 font-bold font-mono text-sm ${
              wrDelta > 0
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : wrDelta < 0
                ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {wrDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : wrDelta < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {wrDelta > 0 ? `+${wrDelta}%` : `${wrDelta}%`}
          </div>
        </div>

        {/* K/D Delta */}
        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">K/D Ratio Delta</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currKd} <span className="text-xs text-slate-400 font-sans font-normal">vs {prevKd}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Combat efficiency change</div>
          </div>
          <div
            className={`p-2.5 rounded-lg border flex items-center gap-1 font-bold font-mono text-sm ${
              kdDelta > 0
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : kdDelta < 0
                ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {kdDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : kdDelta < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {kdDelta > 0 ? `+${kdDelta}` : `${kdDelta}`}
          </div>
        </div>

        {/* Score Delta */}
        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Score Delta</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currScore} <span className="text-xs text-slate-400 font-sans font-normal">vs {prevScore}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Match rating progress</div>
          </div>
          <div
            className={`p-2.5 rounded-lg border flex items-center gap-1 font-bold font-mono text-sm ${
              scoreDelta > 0
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : scoreDelta < 0
                ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {scoreDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : scoreDelta < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`}
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              {timeframe.toUpperCase()} {selectedMetric.toUpperCase()} TRAJECTORY
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated across {chartData.length} distinct time intervals
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f1d',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey={selectedMetric}
                  name={
                    selectedMetric === 'score'
                      ? 'Average Score'
                      : selectedMetric === 'kd'
                      ? 'K/D Ratio'
                      : 'Win Rate (%)'
                  }
                  fill={
                    selectedMetric === 'score'
                      ? '#f59e0b'
                      : selectedMetric === 'kd'
                      ? '#a855f7'
                      : '#10b981'
                  }
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No aggregated progress data available for this range
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
