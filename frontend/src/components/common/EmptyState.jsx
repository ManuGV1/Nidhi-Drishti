import React from 'react';
import { Database, AlertCircle } from 'lucide-react';

export const EmptyState = ({ title = 'No Data Found', message = 'No matching records match the selected query criteria.', icon: Icon = Database, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center panel-card">
      <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
