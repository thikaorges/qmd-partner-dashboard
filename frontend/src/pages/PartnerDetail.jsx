import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Globe2,
  MapPin,
  Activity as ActivityIcon,
  TrendingUp,
  Send,
  Loader2,
  MessageSquare,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { partnersApi } from "@/lib/api";
import { STATUS_STYLES } from "@/lib/constants";
import { formatApiError } from "@/lib/http";
import { useAuth } from "@/context/AuthContext";

const formatEUR = (value) => {
  if (value === null || value === undefined || value === "" || Number(value) === 0) return "N/A";
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(n);
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const InfoRow = ({ icon: Icon, label, value, valueClass = "text-[#0D1B2A]", testId }) => (
  <div
    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200"
    data-testid={testId}
  >
    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-[#C9A84C]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold break-words ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logText, setLogText] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await partnersApi.get(id);
      setPartner(p);
    } catch (err) {
      setError(formatApiError(err, "Partner non trovato"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const data = await partnersApi.listLogs(id);
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    loadLogs();
  }, [load, loadLogs]);

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    const text = logText.trim();
    if (!text) return;
    setSubmittingLog(true);
    try {
      const created = await partnersApi.addLog(id, text);
      setLogs((prev) => [created, ...prev]);
      setLogText("");
      toast.success("Aggiornamento aggiunto");
    } catch (err) {
      toast.error(formatApiError(err, "Impossibile aggiungere l'aggiornamento"));
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Caricamento partner\u2026
          </p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6 flex items-center justify-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center" data-testid="partner-not-found">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-[#0D1B2A]">Partner non trovato</h2>
          <p className="text-sm text-slate-500 mt-1">{error || "Questo partner non esiste pi\u00f9."}</p>
          <Button
            onClick={() => navigate("/")}
            data-testid="back-to-dashboard-error"
            className="mt-6 bg-[#0D1B2A] hover:bg-[#0D1B2A]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla dashboard
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[partner.status] || STATUS_STYLES.Current;

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="partner-detail-page">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            data-testid="back-to-dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#0D1B2A] font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla dashboard
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="uppercase tracking-widest font-semibold">Partner Detail</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-[#0D1B2A] p-6 md:p-10 border border-[#0D1B2A]"
          data-testid="partner-hero"
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-4 w-32 h-32 rounded-full border border-[#C9A84C]/25 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-5xl md:text-6xl leading-none" aria-hidden="true">
                {partner.flag || "\ud83c\udf10"}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#C9A84C] font-bold">
                  {partner.region} \u00b7 {partner.country}
                </p>
                <h1
                  className="mt-1 text-white text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight truncate"
                  style={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}
                  data-testid="partner-detail-name"
                  title={partner.name}
                >
                  {partner.name}
                </h1>
              </div>
            </div>
            <span
              data-testid="partner-detail-status"
              className={`self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text} ring-1 ${status.ring}`}
            >
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </motion.section>

        {/* Info grid */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="partner-info-grid"
        >
          <InfoRow icon={Globe2} label="Region" value={partner.region} testId="info-region" />
          <InfoRow icon={MapPin} label="Country" value={`${partner.flag || ""} ${partner.country}`} testId="info-country" />
          <InfoRow icon={ActivityIcon} label="Activity Type" value={partner.activity} testId="info-activity" />
          <InfoRow
            icon={Mail}
            label="Contact Email"
            value={
              <a
                href={`mailto:${partner.email}`}
                className="text-[#0D1B2A] hover:text-[#C9A84C] hover:underline decoration-[#C9A84C]/60 underline-offset-4"
                data-testid="info-email-link"
              >
                {partner.email}
              </a>
            }
            testId="info-email"
          />
          <InfoRow
            icon={TrendingUp}
            label="Fatturato 2026"
            value={formatEUR(partner.revenue_2026)}
            valueClass={
              partner.revenue_2026 && partner.revenue_2026 > 0
                ? "text-[#0D1B2A]"
                : "text-slate-400"
            }
            testId="info-revenue"
          />
          <InfoRow icon={ActivityIcon} label="Status" value={status.label} valueClass={status.text} testId="info-status" />
        </section>

        {/* Logs section */}
        <section
          className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6"
          data-testid="partner-logs-section"
        >
          <div className="flex items-start gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-[#C9A84C]" />
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-[#0D1B2A] tracking-tight"
                style={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}
              >
                Aggiornamenti / Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cronologia degli aggiornamenti \u2014 i nuovi vengono aggiunti in cima e non
                sovrascrivono mai quelli precedenti.
              </p>
            </div>
          </div>

          {/* Add form */}
          <form
            onSubmit={handleSubmitLog}
            className="flex flex-col sm:flex-row gap-2 mb-6"
            data-testid="add-log-form"
          >
            <Textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Scrivi un aggiornamento (es. call fatta, email inviata, richiesta preventivo)..."
              rows={2}
              maxLength={2000}
              data-testid="log-input"
              className="flex-1 border-slate-300 focus-visible:ring-[#C9A84C] focus-visible:border-[#C9A84C] resize-none"
            />
            <Button
              type="submit"
              disabled={submittingLog || !logText.trim()}
              data-testid="log-add-button"
              className="sm:self-end bg-[#0D1B2A] hover:bg-[#0D1B2A]/90 text-white h-11 sm:min-w-[130px]"
            >
              {submittingLog ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aggiungo\u2026
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Aggiungi
                </>
              )}
            </Button>
          </form>

          {/* Log list */}
          {logsLoading ? (
            <div className="space-y-3" data-testid="logs-loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div
              className="text-center py-8 border border-dashed border-slate-300 rounded-xl"
              data-testid="logs-empty"
            >
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Nessun aggiornamento. Aggiungine il primo qui sopra.
              </p>
            </div>
          ) : (
            <ol className="space-y-3" data-testid="logs-list">
              <AnimatePresence initial={false}>
                {logs.map((log) => {
                  const isMine = user?.email && log.user_email === user.email;
                  return (
                    <motion.li
                      key={log.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      data-testid={`log-item-${log.id}`}
                      className="relative pl-4 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C9A84C]/40 transition-colors"
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#C9A84C]" />
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span
                            className={`font-semibold truncate ${
                              isMine ? "text-[#C9A84C]" : "text-[#0D1B2A]"
                            }`}
                            title={log.user_email}
                            data-testid={`log-user-${log.id}`}
                          >
                            {log.user_name || log.user_email}
                          </span>
                          {isMine && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#8b6508] font-bold uppercase tracking-wider">
                              tu
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 tabular-nums">
                          <Clock className="h-3 w-3" />
                          <time
                            dateTime={log.created_at}
                            data-testid={`log-time-${log.id}`}
                          >
                            {formatDateTime(log.created_at)}
                          </time>
                        </div>
                      </div>
                      <p
                        className="mt-2 text-sm text-[#0D1B2A] leading-relaxed whitespace-pre-wrap break-words"
                        data-testid={`log-text-${log.id}`}
                      >
                        {log.text}
                      </p>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
