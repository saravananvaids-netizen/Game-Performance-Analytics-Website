import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  X
} from 'lucide-react';
import { MatchRecord, GameType } from '../../types';
import { dataService } from '../../services/dataService';
import { SUPPORTED_GAMES } from '../../data/initialData';

interface MatchHistoryProps {
  matches: MatchRecord[];
  onOpenAddMatch: () => void;
  onEditMatch: (match: MatchRecord) => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  onOpenAddMatch,
  onEditMatch
}) => {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter
  const filtered = matches.filter(m => {
    if (gameFilter !== 'all' && m.gameId !== gameFilter) return false;
    if (resultFilter !== 'all' && m.result !== resultFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const map = (m.mapName || '').toLowerCase();
      const mode = (m.gameMode || '').toLowerCase();
      const title = (m.gameTitle || '').toLowerCase();
      const notes = (m.notes || '').toLowerCase();
      return map.includes(q) || mode.includes(q) || title.includes(q) || notes.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this match record? This action cannot be undone.')) {
      dataService.deleteMatch(id);
      if (selectedMatch?.id === id) setSelectedMatch(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Comprehensive Match History
              </h1>
              <p className="text-xs text-slate-400">
                Detailed telemetry logs, scorecards, and combat records
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAddMatch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-400/20 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Log New Match
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0a101f] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Game & Result Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Game Dropdown */}
          <select
            value={gameFilter}
            onChange={e => {
              setGameFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111a2f] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Games ({matches.length})</option>
            {SUPPORTED_GAMES.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Result Segmented */}
          <div className="flex items-center p-1 bg-[#111a2f] border border-slate-800 rounded-lg">
            {(['all', 'WIN', 'LOSS', 'DRAW'] as const).map(res => (
              <button
                key={res}
                onClick={() => {
                  setResultFilter(res);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase transition-colors ${
                  resultFilter === res
                    ? res === 'WIN'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : res === 'LOSS'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {res === 'all' ? 'All Results' : res}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search map, notes, or mode..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 pl-9 pr-3 py-1.5 bg-[#111a2f] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111a2f] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3">Game Title</th>
                <th className="py-3 px-3">Mode & Map</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">K / D / A</th>
                <th className="py-3 px-3">K/D</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginated.map(m => {
                  const kd = m.deaths === 0 ? m.kills.toFixed(2) : (m.kills / m.deaths).toFixed(2);
                  return (
                    <tr key={m.id} className="hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-3">
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

                      <td className="py-3 px-3 font-semibold text-white">
                        {m.gameTitle}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{m.gameMode}</div>
                        {m.mapName && (
                          <div className="text-[10px] text-slate-400 font-mono">{m.mapName}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {new Date(m.date).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400">
                        {m.durationMinutes}m
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {m.kills} / {m.deaths} / {m.assists}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                        {kd}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {m.score}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedMatch(m)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditMatch(m)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Detail Modal Drawer */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0d1424] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`font-black px-2 py-0.5 rounded text-xs ${
                    selectedMatch.result === 'WIN'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {selectedMatch.result}
                </span>
                <h3 className="font-bold text-white text-base">
                  {selectedMatch.gameTitle} ({selectedMatch.gameMode})
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#111a2f] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Kills / Deaths</span>
                <span className="font-mono font-bold text-white text-sm">
                  {selectedMatch.kills} / {selectedMatch.deaths}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111a2f] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">K/D Ratio</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {selectedMatch.deaths === 0
                    ? selectedMatch.kills.toFixed(2)
                    : (selectedMatch.kills / selectedMatch.deaths).toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111a2f] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Score</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {selectedMatch.score}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111a2f] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Duration</span>
                <span className="font-mono font-bold text-purple-400 text-sm">
                  {selectedMatch.durationMinutes}m
                </span>
              </div>
            </div>

            {/* Additional telemetry */}
            <div className="p-3 rounded-lg bg-[#111a2f] border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Map / Arena:</span>
                <span className="font-semibold text-white">{selectedMatch.mapName || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accuracy / Hit Rate:</span>
                <span className="font-semibold text-white">
                  {selectedMatch.accuracy !== undefined ? `${selectedMatch.accuracy}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Damage Dealt:</span>
                <span className="font-semibold text-white">{selectedMatch.damageDealt ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Objectives / Plants:</span>
                <span className="font-semibold text-white">{selectedMatch.objectivesCompleted ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Timestamp:</span>
                <span className="font-semibold text-white">{new Date(selectedMatch.date).toLocaleString()}</span>
              </div>
            </div>

            {selectedMatch.notes && (
              <div className="p-3 rounded-lg bg-[#090f1d] border border-slate-800 text-xs">
                <span className="text-cyan-400 font-bold block mb-1">Match Tactical Notes:</span>
                <p className="text-slate-300 italic">"{selectedMatch.notes}"</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  onEditMatch(selectedMatch);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs"
              >
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
