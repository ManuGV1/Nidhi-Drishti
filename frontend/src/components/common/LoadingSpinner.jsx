import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Fetching live intelligence data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
      <span className="text-xs font-mono text-slate-400">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
