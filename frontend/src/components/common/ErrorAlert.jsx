import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export const ErrorAlert = ({ message = 'Failed to connect to NIDHI DRISHTI FastAPI service.', onRetry }) => {
  const displayMsg = typeof message === 'string'
    ? message
    : (message && typeof message === 'object' ? (message.detail ? (typeof message.detail === 'string' ? message.detail : JSON.stringify(message.detail)) : JSON.stringify(message)) : String(message || 'An error occurred.'));

  return (
    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
        <span className="text-xs font-mono">{displayMsg}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-xs font-medium text-rose-200 border border-rose-500/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
