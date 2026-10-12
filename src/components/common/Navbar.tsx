import React, { useState } from 'react';
import {
  Gamepad2,
  Plus,
  Bell,
  Menu,
  ChevronDown,
  ShieldCheck,
  Flame,
  Sparkles
} from 'lucide-react';
import { GameType, PlayerProfile } from '../../types';
import { SUPPORTED_GAMES } from '../../data/initialData';
import { dataService } from '../../services/dataService';

interface NavbarProps {
  currentProfile: PlayerProfile;
  activeGame: GameType;
  onSelectGame: (game: GameType) => void;
  onOpenAddMatch: () => void;
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  activeGame,
  onSelectGame,
  onOpenAddMatch,
  onToggleSidebar,
  onOpenProfile
}) => {
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const activeGameConfig = SUPPORTED_GAMES.find(g => g.id === activeGame) || SUPPORTED_GAMES[0];

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#080d19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/20 text-black font-black">
            <Gamepad2 className="w-5 h-5 text-black" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">
                GAMEVISION<span className="text-cyan-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                ESPORTS ENGINE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 tracking-tight flex items-center gap-1.5">
              <span>Telemetry Hub</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Analytics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Game Selector */}
      <div className="relative">
        <button
          onClick={() => setShowGameMenu(!showGameMenu)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0e1628] border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-inner"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
          <span className="truncate max-w-[120px] sm:max-w-[180px]">
            {activeGameConfig.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showGameMenu && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
              Select Active Game
            </div>
            <div className="space-y-1">
              {SUPPORTED_GAMES.map(game => (
                <button
                  key={game.id}
                  onClick={() => {
                    onSelectGame(game.id);
                    dataService.setActiveGame(game.id);
                    setShowGameMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeGame === game.id
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{game.name}</div>
                    <div className="text-[10px] text-slate-400">{game.tagline}</div>
                  </div>
                  {activeGame === game.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Match Button */}
        <button
          onClick={onOpenAddMatch}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Log Match</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080d19]"></span>
          </button>

          {showNotification && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Tactical Alerts
                </span>
                <span className="text-[10px] text-cyan-400">2 Unread</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    AI Coach Diagnostic Ready
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Recent 5-match sample analyzed. Your K/D improved by +0.32!
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40">
                  <div className="font-semibold text-purple-300 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-purple-400" />
                    Win Streak Milestone
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    You logged 3 consecutive wins in Competitive mode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player Profile Mini Card */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-[#0e1628] hover:bg-[#131d33] border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-7 h-7 rounded-md object-cover ring-1 ring-cyan-500/40"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
              {currentProfile.name}
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {currentProfile.rank}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
