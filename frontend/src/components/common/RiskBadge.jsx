import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { CountUp } from './CountUp';

export const getRiskConfig = (score, level) => {
  const s = parseFloat(score) || 0;
  
  if (level === 'CRITICAL' || s >= 75.0) {
    return {
      level: 'CRITICAL',
      colorClass: 'bg-rose-950/50 text-rose-400 border-rose-800/60',
      icon: ShieldAlert,
      label: 'CRITICAL RISK',
      sublabel: 'Priority Verification',
    };
  } else if (level === 'HIGH' || s >= 50.0) {
    return {
      level: 'HIGH',
      colorClass: 'bg-amber-950/50 text-amber-400 border-amber-800/60',
      icon: AlertTriangle,
      label: 'HIGH RISK',
      sublabel: 'Verification Signal',
    };
  } else if (level === 'MEDIUM' || s >= 25.0) {
    return {
      level: 'MEDIUM',
      colorClass: 'bg-yellow-950/50 text-yellow-400 border-yellow-800/60',
      icon: AlertCircle,
      label: 'MEDIUM RISK',
      sublabel: 'Audit Sample',
    };
  } else {
    return {
      level: 'LOW',
      colorClass: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
      icon: CheckCircle2,
      label: 'LOW RISK',
      sublabel: 'Standard Monitoring',
    };
  }
};

export const RiskBadge = ({ score, level, showScore = true, size = 'md', animate = true }) => {
  const config = getRiskConfig(score, level);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-xs gap-2 font-semibold',
  }[size] || 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  const numericScore = parseFloat(score) || 0;

  return (
    <div className={`inline-flex items-center rounded-lg border ${config.colorClass} ${sizeClasses} shadow-sm`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-95 pl-1.5 border-l border-current/20 ml-1">
          {animate ? (
            <CountUp value={numericScore} decimals={1} duration={800} />
          ) : (
            numericScore.toFixed(1)
          )}
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
