import React from "react";

/**
 * Vengeance UI - Shimmer Badge
 * Micro-animated status pill with animated gradient sweep
 */
export default function ShimmerBadge({ children, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-tight bg-blue-50/80 border border-blue-200/80 text-blue-700 shadow-xs relative overflow-hidden ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
      </span>
      <span className="relative z-10 font-medium">{children}</span>
    </div>
  );
}
