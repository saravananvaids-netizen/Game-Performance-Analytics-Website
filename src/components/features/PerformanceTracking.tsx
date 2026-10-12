import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  Crosshair,
  Clock,
  Shield,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { SUPPORTED_GAMES } from '../../data/initialData';
import { dataService } from '../../services/dataService';
import {
  calculateWinRate,
  calculateKdRatio,
  calculateAvgScore,
  calculateAvgAccuracy
} from '../../services/analyticsService';

interface PerformanceTrackingProps {
  matches: MatchRecord[];
  activeGame: GameType;
  onOpenAddMatch: () => void;
  onEditMatch: (match: MatchRecord) => void;
}

export const PerformanceTracking: React.FC<PerformanceTrackingProps> = ({
  matches,
  activeGame,
  onOpenAddMatch,
  onEditMatch
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeGameConfig = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];

  // Filter matches for the active game
  const gameMatches = matches.filter(m => m.gameId === activeGame);

  const filteredMatches = gameMatches.filter(m => {
    if (selectedMode !== 'all' && m.gameMode !== selectedMode) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMap = (m.mapName || '').toLowerCase();
      const notes = (m.notes || '').toLowerCase();
      const mode = (m.gameMode || '').toLowerCase();
      return matchMap.includes(q) || notes.includes(q) || mode.includes(q);
    }
    return true;
  });

  const totalMatches = filteredMatches.length;
  const winRate = calculateWinRate(filteredMatches);
  const { kd } = calculateKdRatio(filteredMatches);
  const avgScore = calculateAvgScore(filteredMatches);
  const avgAccuracy = calculateAvgAccuracy(filteredMatches);

  // Compute game-specific totals
  const totalDamage = filteredMatches.reduce((acc, m) => acc + (m.damageDealt || 0), 0);
  const avgDamage = totalMatches > 0 ? Math.round(totalDamage / totalMatches) : 0;
  const totalObjectives = filteredMatches.reduce((acc, m) => acc + (m.objectivesCompleted || 0), 0);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this match record?')) {
      dataService.deleteMatch(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                {activeGameConfig.name} Performance Telemetry
              </h1>
              <p className="text-xs text-slate-400">
                Tracking game-specific metrics, combat ratings, and objective impact
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAddMatch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-400/20 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record {activeGameConfig.name} Match
        </button>
      </div>

      {/* Game-Specific Key Telemetry Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Matches</span>
          <div className="text-2xl font-black font-mono text-white mt-1">{totalMatches}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Logged records</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Win Rate</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{winRate}%</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Conversion rate</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">K/D Ratio</span>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{kd}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Fragging index</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {activeGameConfig.metrics[0]?.label || 'Score'}
          </span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{avgScore}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Average per match</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {activeGameConfig.metrics[1]?.label || 'Accuracy'}
          </span>
          <div className="text-2xl font-black font-mono text-purple-400 mt-1">
            {avgAccuracy > 0 ? `${avgAccuracy}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Precision rate</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            {activeGameConfig.metrics[3]?.label || 'Objectives'}
          </span>
          <div className="text-2xl font-black font-mono text-indigo-400 mt-1">{totalObjectives}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Total completed</span>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0a101f] border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedMode === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Modes ({gameMatches.length})
          </button>
          {activeGameConfig.modes.map(mode => {
            const count = gameMatches.filter(m => m.gameMode === mode).length;
            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search map or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#111a2f] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Match Telemetry Cards / Table */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0d1424] border border-slate-800 text-slate-400">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No match records found for this view.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Record {activeGameConfig.name} Match" to log statistics.
            </p>
          </div>
        ) : (
          filteredMatches.map(m => {
            const matchKd = m.deaths === 0 ? m.kills.toFixed(2) : (m.kills / m.deaths).toFixed(2);
            return (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#0d1424] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Result & Date & Map */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-xs ${
                      m.result === 'WIN'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : m.result === 'LOSS'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    <span>{m.result}</span>
                    <span className="text-[9px] font-mono opacity-80">{m.durationMinutes}m</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {m.gameMode}
                      </span>
                      {m.mapName && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {m.mapName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {m.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-400 truncate max-w-xs">{m.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specific Metrics Display */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">K / D / A</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {m.kills} / {m.deaths} / {m.assists}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">K/D</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {matchKd}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Score</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {m.score}
                    </span>
                  </div>

                  {m.accuracy !== undefined && (
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Accuracy</span>
                      <span className="font-mono font-bold text-purple-400 text-sm">
                        {m.accuracy}%
                      </span>
                    </div>
                  )}

                  {m.damageDealt !== undefined && (
                    <div className="hidden lg:block">
                      <span className="text-slate-400 text-[10px] block uppercase">Damage</span>
                      <span className="font-mono font-bold text-slate-300 text-sm">
                        {m.damageDealt}
                      </span>
                    </div>
                  )}

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                    <button
                      onClick={() => onEditMatch(m)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit match"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/40 transition-colors"
                      title="Delete match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
