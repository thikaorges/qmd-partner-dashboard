import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Pencil, Trash2, TrendingUp, ArrowUpRight } from "lucide-react";
import { STATUS_STYLES } from "@/lib/constants";

const activityStyle = (activity) => {
  if (activity === "AE") return "bg-[#0D1B2A]/5 text-[#0D1B2A] ring-[#0D1B2A]/15";
  if (activity === "Med/AE") return "bg-[#C9A84C]/10 text-[#8b7327] ring-[#C9A84C]/40";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const formatEUR = (value) => {
  if (value === null || value === undefined || value === 0 || Number.isNaN(Number(value))) {
    return "N/A";
  }
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    }).format(Number(value));
  } catch {
    return `\u20ac${Number(value).toFixed(2)}`;
  }
};

export const PartnerCard = ({ partner, onEdit, onDelete, index = 0 }) => {
  const status = STATUS_STYLES[partner.status] || STATUS_STYLES.Current;
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/partner/${partner.id}`);
  const stop = (e) => e.stopPropagation();

  return (
    <motion.article
      data-testid={`partner-card-${partner.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.5), ease: [0.22, 1, 0.36, 1] }}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open partner ${partner.name}`}
      className="partner-card group relative bg-white border border-slate-200 rounded-xl p-6 flex flex-col cursor-pointer hover:border-[#C9A84C] hover:shadow-lg hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2"
    >
      {/* Corner icon signalling clickability */}
      <ArrowUpRight
        className="absolute top-4 right-4 h-4 w-4 text-slate-300 group-hover:text-[#C9A84C] transition-colors"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {partner.flag || "\ud83c\udf10"}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
              {partner.region}
            </p>
            <p className="text-sm font-semibold text-[#0D1B2A]">{partner.country}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${status.bg} ${status.text} ${status.ring} mr-6`}
          data-testid={`partner-status-${partner.id}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
              partner.status === "Current" ? "status-dot-current" : ""
            }`}
          />
          {status.label}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold text-[#0D1B2A] leading-tight mb-3">
        {partner.name}
      </h3>

      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ring-1 ${activityStyle(
            partner.activity
          )}`}
          data-testid={`partner-activity-${partner.id}`}
        >
          {partner.activity}
        </span>
      </div>

      <div className="h-px bg-gradient-to-r from-slate-200 via-[#C9A84C]/30 to-transparent mb-4" />

      {/* Fatturato 2026 */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg bg-[#0D1B2A]/[0.03] border border-[#C9A84C]/25 px-3 py-2"
        data-testid={`partner-revenue-${partner.id}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <TrendingUp className="h-3.5 w-3.5 text-[#C9A84C] flex-shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
            Fatturato 2026
          </span>
        </div>
        <span
          className={`text-sm font-semibold tabular-nums ${
            partner.revenue_2026 && partner.revenue_2026 > 0
              ? "text-[#0D1B2A]"
              : "text-slate-400"
          }`}
        >
          {formatEUR(partner.revenue_2026)}
        </span>
      </div>

      <a
        href={`mailto:${partner.email}`}
        data-testid={`partner-email-${partner.id}`}
        onClick={stop}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#C9A84C] transition-colors group/mail mt-auto"
      >
        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate group-hover/mail:underline underline-offset-2 decoration-[#C9A84C]/60">
          {partner.email}
        </span>
      </a>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-1 no-print">
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onEdit(partner);
          }}
          data-testid={`edit-partner-${partner.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0D1B2A] rounded-md hover:bg-[#0D1B2A]/5 transition-colors"
          aria-label={`Edit ${partner.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onDelete(partner);
          }}
          data-testid={`delete-partner-${partner.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 rounded-md hover:bg-rose-50 transition-colors"
          aria-label={`Delete ${partner.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </motion.article>
  );
};

export default PartnerCard;
