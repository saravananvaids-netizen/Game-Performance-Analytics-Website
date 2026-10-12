import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Percent,
  TrendingUp,
  Sparkles,
  Target,
  Trophy,
  History,
  Users2,
  BrainCircuit,
  Clock,
  FileSpreadsheet,
  Settings,
  X,
  ExternalLink
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'tracking'
  | 'winrate'
  | 'progress'
  | 'coach'
  | 'strengths'
  | 'leaderboard'
  | 'history'
  | 'comparison'
  | 'predictions'
  | 'sessions'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  matchCount: number;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  count?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  matchCount
}) => {
  const navItems: NavGroup[] = [
    {
      group: 'ANALYTICS CORE',
      items: [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'tracking', label: 'Performance Tracking', icon: Activity },
        { key: 'winrate', label: 'Win Rate Analyzer', icon: Percent },
        { key: 'progress', label: 'Progress Tracker', icon: TrendingUp },
      ]
    },
    {
      group: 'INTELLIGENCE & AI',
      items: [
        {
          key: 'coach',
          label: 'AI Gaming Coach',
          icon: Sparkles,
          badge: 'SMART',
          badgeColor: 'text-cyan-400 bg-cyan-950/70 border-cyan-800'
        },
        { key: 'strengths', label: 'Strengths & Weaknesses', icon: Target },
        {
          key: 'predictions',
          label: 'Performance Predictions',
          icon: BrainCircuit,
          badge: 'ML',
          badgeColor: 'text-purple-400 bg-purple-950/70 border-purple-800'
        },
        { key: 'sessions', label: 'Gaming Session Analyzer', icon: Clock },
      ]
    },
    {
      group: 'COMPETITIVE & DATA',
      items: [
        { key: 'leaderboard', label: 'Player Leaderboard', icon: Trophy },
        {
          key: 'history',
          label: 'Match History',
          icon: History,
          count: matchCount
        },
        { key: 'comparison', label: 'Player Comparison', icon: Users2 },
        { key: 'reports', label: 'Report Generator', icon: FileSpreadsheet },
        { key: 'settings', label: 'Settings & Data Sync', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#090f1d] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                {group.group}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key as NavItemKey);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Optional Badge or Count */}
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* System & Telemetry Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070b16]">
          <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Active Telemetry</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {matchCount} Matches Synced
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              v2.4
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
