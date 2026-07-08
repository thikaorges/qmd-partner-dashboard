import React from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp } from "lucide-react";

const formatEUR = (value, digits = 0) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: "always",
  }).format(value);

export default function RevenueProgress({
  target = 3_000_000,
  current = 1_400_000,
  year = 2026,
}) {
  const pct = Math.max(0, Math.min(100, (current / target) * 100));
  const pctLabel = pct.toFixed(1).replace(".", ",");
  const remaining = Math.max(0, target - current);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      data-testid="revenue-progress"
      aria-label="Revenue progress toward annual target"
      className="mb-8 relative overflow-hidden rounded-2xl bg-[#0D1B2A] border border-[#0D1B2A]"
    >
      {/* Decorative gold rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />
      <div className="absolute right-6 bottom-4 w-32 h-32 rounded-full border border-[#C9A84C]/20 pointer-events-none" />
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      <div className="relative p-6 md:p-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#C9A84C]">
                Obiettivo {year}
              </p>
              <h3
                className="mt-1 text-white text-xl md:text-2xl font-semibold tracking-tight"
                style={{
                  fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                }}
                data-testid="revenue-progress-title"
              >
                Progresso Fatturato {year}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">
                Attuale
              </p>
              <p
                className="text-2xl md:text-3xl font-bold text-[#C9A84C] tabular-nums leading-none mt-1"
                data-testid="revenue-progress-current"
                style={{
                  fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                }}
              >
                {formatEUR(current)}
              </p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">
                Target
              </p>
              <p
                className="text-2xl md:text-3xl font-bold text-white tabular-nums leading-none mt-1"
                data-testid="revenue-progress-target"
                style={{
                  fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                }}
              >
                {formatEUR(target)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div
            className="h-6 md:h-7 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={Number(pct.toFixed(1))}
            aria-valuemin={0}
            aria-valuemax={100}
            data-testid="revenue-progress-bar"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] via-[#E5C875] to-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.35)] relative"
            >
              {/* Diagonal shine overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0 8px, transparent 8px 16px)",
                }}
              />
            </motion.div>
          </div>

          {/* Marker + percentage badge */}
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-1 -translate-x-1/2 h-8 md:h-9 w-[3px] bg-white/90 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Footer / meta row */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] font-semibold w-fit"
            data-testid="revenue-progress-percentage"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {pctLabel}% raggiunto
          </div>
          <p className="text-xs text-white/60 tabular-nums">
            Ancora{" "}
            <span
              className="text-white font-semibold"
              data-testid="revenue-progress-remaining"
            >
              {formatEUR(remaining)}
            </span>{" "}
            all&apos;obiettivo annuale
          </p>
        </div>
      </div>
    </motion.section>
  );
}
