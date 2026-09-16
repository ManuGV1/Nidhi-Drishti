import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    slate: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="panel-card p-5 relative overflow-hidden transition-all hover:border-slate-600">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
            {value !== undefined && value !== null ? value : '—'}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-medium text-slate-300">{trend}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
