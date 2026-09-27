import React from 'react';

export function ShimmerBadge({ text, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/90 border border-white/10 text-zinc-300 shadow-sm backdrop-blur-md ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="font-medium text-[11px] text-zinc-300">{text}</span>
    </div>
  );
}

export default ShimmerBadge;
