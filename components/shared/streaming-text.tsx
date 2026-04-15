"use client";

import { motion } from "framer-motion";

export function StreamingText({
  text,
  progress = 0,
  isActive = false,
}: {
  text: string;
  progress?: number;
  isActive?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border border-border bg-black/30"
    >
      <div className="h-1.5 w-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent via-indigo-300 to-cyan-300 transition-all duration-300"
          style={{ width: `${Math.max(progress, isActive ? 8 : 0)}%` }}
        />
      </div>
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <p className="text-sm font-medium text-text-primary">Live analysis stream</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-secondary">
          {isActive ? "Streaming" : "Idle"}
        </span>
      </div>
      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm text-text-secondary">
        {text || "Initializing analysis stream..."}
      </pre>
    </motion.div>
  );
}
