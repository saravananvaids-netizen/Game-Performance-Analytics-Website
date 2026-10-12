import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'cyan' | 'purple' | 'emerald' | 'amber';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan',
  badge
}) => {
  const accentStyles = {
    cyan: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'shadow-cyan-950/40',
      textAccent: 'text-cyan-400'
    },
    purple: {
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'shadow-purple-950/40',
      textAccent: 'text-purple-400'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-950/40',
      textAccent: 'text-emerald-400'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-950/40',
      textAccent: 'text-amber-400'
    }
  }[accentColor];

  return (
    <div
      className={`relative p-5 rounded-xl bg-[#0d1424] border border-slate-800/90 ${accentStyles.border} transition-all duration-200 shadow-lg ${accentStyles.glow} flex flex-col justify-between`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 tracking-tight">
            {value}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border ${accentStyles.iconBg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom metadata / trend */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`flex items-center gap-0.5 font-bold ${
                trend.isPositive === true
                  ? 'text-emerald-400'
                  : trend.isPositive === false
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.isPositive === true && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.isPositive === false && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.isPositive === undefined && <Minus className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
            <span className="text-slate-400 text-[11px]">{trend.label || 'vs prev'}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-400 text-[11px]">{subtitle}</span>
        ) : (
          <span className="text-slate-400 text-[11px]">Real-time Telemetry</span>
        )}

        {badge && (
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
