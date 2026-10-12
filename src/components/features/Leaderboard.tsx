import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  Flame,
  Star,
  Users
} from 'lucide-react';
import { LeaderboardPlayer, GameType } from '../../types';
import { dataService } from '../../services/dataService';
import { SUPPORTED_GAMES } from '../../data/initialData';

interface LeaderboardProps {
  leaderboard: LeaderboardPlayer[];
  currentUserId: string;
  onCompareWithPlayer: (playerId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboard,
  currentUserId,
  onCompareWithPlayer
}) => {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'tierScore' | 'winRate' | 'kdRatio' | 'avgScore' | 'wins'>('tierScore');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Filter
  const filtered = leaderboard.filter(p => {
    if (gameFilter !== 'all' && p.game !== gameFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy] ?? 0;
    const valB = b[sortBy] ?? 0;
    return sortDirection === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
  });

  const handleSortToggle = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const currentUser = leaderboard.find(p => p.isCurrentUser || p.id === currentUserId);
  const currentUserRankIndex = sorted.findIndex(p => p.isCurrentUser || p.id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Global Esports Competitive Leaderboard
              </h1>
              <p className="text-xs text-slate-400">
                Official ranked ladder synced with live player telemetry
              </p>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="p-2.5 px-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-3">
            <span className="text-xs text-slate-400">Your Ladder Standing:</span>
            <div className="text-sm font-black font-mono text-cyan-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              Rank #{currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : 'Unranked'}
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl bg-[#0a101f] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Game Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setGameFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              gameFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Games
          </button>
          {SUPPORTED_GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setGameFilter(g.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                gameFilter === g.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search player name or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64 pl-9 pr-3 py-1.5 bg-[#111a2f] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111a2f] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Game Tier</th>
                <th
                  onClick={() => handleSortToggle('tierScore')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Tier Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('winRate')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Win Rate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('kdRatio')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>K/D</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('avgScore')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Avg Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Matches (W/L)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sorted.map((player, idx) => {
                const rankNum = idx + 1;
                const isCurrent = player.isCurrentUser || player.id === currentUserId;

                return (
                  <tr
                    key={player.id}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400 hover:bg-cyan-500/15'
                        : 'hover:bg-slate-850'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-4 font-mono font-bold">
                      {rankNum === 1 ? (
                        <span className="flex items-center gap-1 text-amber-300 font-black">
                          <Medal className="w-4 h-4 fill-amber-300" /> #1
                        </span>
                      ) : rankNum === 2 ? (
                        <span className="flex items-center gap-1 text-slate-300 font-black">
                          <Medal className="w-4 h-4 fill-slate-300" /> #2
                        </span>
                      ) : rankNum === 3 ? (
                        <span className="flex items-center gap-1 text-amber-600 font-black">
                          <Medal className="w-4 h-4 fill-amber-600" /> #3
                        </span>
                      ) : (
                        <span className="text-slate-400">#{rankNum}</span>
                      )}
                    </td>

                    {/* Player Name and Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {player.name}
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-cyan-400 text-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{player.tag}</div>
                        </div>
                      </div>
                    </td>

                    {/* Game & Rank */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{player.rank}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{player.game}</div>
                    </td>

                    {/* Tier Score */}
                    <td className="py-3 px-4 font-mono font-extrabold text-cyan-300">
                      {player.tierScore.toLocaleString()}
                    </td>

                    {/* Win Rate */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {player.winRate}%
                    </td>

                    {/* K/D */}
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      {player.kdRatio}
                    </td>

                    {/* Avg Score */}
                    <td className="py-3 px-4 font-mono text-amber-400">
                      {player.avgScore}
                    </td>

                    {/* Matches */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {player.totalMatches} ({player.wins}W / {player.losses}L)
                    </td>

                    {/* Compare Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onCompareWithPlayer(player.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
