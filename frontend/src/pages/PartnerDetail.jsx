import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { partnersApi } from "@/lib/api";
import { STATUS_STYLES, getFlag } from "@/lib/constants";
import { formatApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Globe,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react";

const fmtEur = (v) => {
  if (v == null || v === 0) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [partner, setPartner] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logText, setLogText] = useState("");
  const [sendingLog, setSendingLog] = useState(false);

  const fetchPartner = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([
        partnersApi.get(id),
        partnersApi.listLogs(id),
      ]);
      setPartner(p);
      setLogs(l);
    } catch (err) {
      toast.error(formatApiError(err, "Partner not found"));
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPartner();
  }, [fetchPartner]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logText.trim()) return;
    setSendingLog(true);
    try {
      await partnersApi.addLog(id, logText.trim());
      setLogText("");
      const updatedLogs = await partnersApi.listLogs(id);
      setLogs(updatedLogs);
      toast.success("Log added");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSendingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (!partner) return null;

  const st = STATUS_STYLES[partner.status] || STATUS_STYLES.Current;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0D1B2A] border-b border-white/5 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-6 h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-white font-semibold text-sm truncate">
            {partner.flag || getFlag(partner.country)} {partner.name}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Partner info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <span className="text-4xl">{partner.flag || getFlag(partner.country)}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{partner.name}</h2>
              <p className="text-slate-500">{partner.country}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${st.bg} ${st.text} ${st.ring}`}
            >
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoItem icon={Globe} label="Region" value={partner.region} />
            <InfoItem icon={Activity} label="Activity" value={partner.activity} />
            <InfoItem icon={Mail} label="Email" value={partner.email || "—"} />
            <InfoItem icon={TrendingUp} label="Revenue 2026" value={fmtEur(partner.revenue_2026)} gold />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Created: {fmtDate(partner.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Updated: {fmtDate(partner.updated_at)}
            </span>
          </div>
        </motion.div>

        {/* Activity log */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-[#C9A84C]" /> Activity Log
          </h3>

          {/* Add log form */}
          <form onSubmit={handleAddLog} className="mb-6">
            <Textarea
              placeholder="Add a note about this partner…"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              className="resize-none mb-2"
              rows={3}
            />
            <Button
              type="submit"
              disabled={sendingLog || !logText.trim()}
              size="sm"
              className="bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A]"
            >
              <Send className="h-3.5 w-3.5 mr-1" /> {sendingLog ? "Sending…" : "Add Note"}
            </Button>
          </form>

          {/* Log list */}
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No activity logs yet.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.text}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{log.author}</span>
                    <span>·</span>
                    <span>{fmtDate(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, gold }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className={`h-4 w-4 mt-0.5 ${gold ? "text-[#C9A84C]" : "text-slate-400"}`} />
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-medium ${gold ? "text-[#C9A84C]" : "text-slate-700"}`}>{value}</p>
      </div>
    </div>
  );
}
