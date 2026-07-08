import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, FileSpreadsheet, FileDown, Globe2, Users, Activity, Clock, Archive, LogOut, KeyRound, ChevronDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { partnersApi } from "@/lib/api";
import { REGIONS } from "@/lib/constants";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import PartnerCard from "@/components/PartnerCard";
import PartnerFormDialog from "@/components/PartnerFormDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import RevenueProgress from "@/components/RevenueProgress";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, accent, testId, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-[#C9A84C] transition-colors"
    data-testid={testId}
  >
    <div className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-500">{label}</p>
      <p className="font-display text-3xl font-semibold text-[#0D1B2A] leading-none mt-1">{value}</p>
    </div>
  </motion.div>
);

const RegionTab = ({ label, active, count, onClick, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
      active
        ? "region-tab-active border-[#0D1B2A]"
        : "bg-white text-[#0D1B2A] border-slate-200 hover:border-[#C9A84C] hover:text-[#0D1B2A]"
    }`}
  >
    {label}
    {typeof count === "number" && (
      <span
        className={`ml-2 inline-flex items-center justify-center min-w-[22px] px-1.5 rounded-full text-[10px] font-bold ${
          active ? "bg-[#C9A84C] text-[#0D1B2A]" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [changePwOpen, setChangePwOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const userInitials = React.useMemo(() => {
    if (!user) return "?";
    const src = user.name || user.email || "";
    return src
      .split(/[\s@._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }, [user]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnersApi.list();
      setPartners(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return partners.filter((p) => {
      if (region !== "All" && p.region !== region) return false;
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.activity.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      );
    });
  }, [partners, search, region, statusFilter]);

  const stats = useMemo(() => {
    const total = partners.length;
    const current = partners.filter((p) => p.status === "Current").length;
    const standby = partners.filter((p) => p.status === "Standby").length;
    const old = partners.filter((p) => p.status === "Old").length;
    const byRegion = REGIONS.reduce((acc, r) => {
      acc[r] = partners.filter((p) => p.region === r).length;
      return acc;
    }, {});
    return { total, current, standby, old, byRegion };
  }, [partners]);

  const groupedByRegion = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p.region]) map[p.region] = [];
      map[p.region].push(p);
    }
    return map;
  }, [filtered]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (partner) => {
    setEditing(partner);
    setFormOpen(true);
  };

  const handleDelete = (partner) => setDeleteTarget(partner);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await partnersApi.remove(deleteTarget.id);
      toast.success(`Partner "${deleteTarget.name}" removed`);
      setDeleteTarget(null);
      await fetchPartners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete partner");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitForm = async (payload) => {
    try {
      setSubmitting(true);
      if (editing?.id) {
        await partnersApi.update(editing.id, payload);
        toast.success("Partner updated");
      } else {
        await partnersApi.create(payload);
        toast.success("Partner added");
      }
      setFormOpen(false);
      setEditing(null);
      await fetchPartners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save partner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      toast.error("No partners to export");
      return;
    }
    exportToExcel(filtered);
    toast.success(`Exported ${filtered.length} partners to Excel`);
  };

  const handleExportPDF = () => {
    if (filtered.length === 0) {
      toast.error("No partners to export");
      return;
    }
    exportToPDF(filtered);
    toast.success(`Exported ${filtered.length} partners to PDF`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-[#0D1B2A] text-white relative overflow-hidden" data-testid="dashboard-header">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A84C] via-[#E5C875] to-[#C9A84C]" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 80% 80%, #C9A84C 0%, transparent 40%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex items-baseline gap-1 select-none"
                data-testid="qmd-logo"
                aria-label="qmd logo"
              >
                <span className="font-display font-bold text-5xl md:text-6xl qmd-logo-mark leading-none">
                  qmd
                </span>
                <span className="text-[#C9A84C] font-display text-2xl leading-none">®</span>
              </div>
              <div className="hidden md:block h-14 w-px bg-white/15" />
              <div className="hidden md:block">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#C9A84C] font-semibold">
                  Hakomed Italia
                </p>
                <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
                  Global Partner Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
                <Globe2 className="h-4 w-4 text-[#C9A84C]" />
                <span data-testid="header-partner-count">
                  {stats.total} partners &middot; {REGIONS.length} regions
                </span>
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="user-menu-trigger"
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C9A84C]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                  >
                    <span
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#C9A84C] text-[#0D1B2A] text-xs font-bold"
                      aria-hidden="true"
                    >
                      {userInitials || "U"}
                    </span>
                    <div className="hidden sm:flex flex-col items-start leading-tight text-left">
                      <span
                        className="text-[11px] text-[#C9A84C] font-bold uppercase tracking-wider"
                        data-testid="user-menu-role"
                      >
                        {user?.role || "admin"}
                      </span>
                      <span
                        className="text-xs text-white/85 max-w-[180px] truncate"
                        data-testid="user-menu-email"
                        title={user?.email || ""}
                      >
                        {user?.email || ""}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white border-slate-200"
                  data-testid="user-menu-content"
                >
                  <DropdownMenuLabel className="text-[#0D1B2A]">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#C9A84C] mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user?.name || user?.email || "Admin"}
                        </p>
                        <p className="text-xs text-slate-500 truncate" title={user?.email}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setChangePwOpen(true)}
                    data-testid="user-menu-change-password"
                    className="cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4 mr-2 text-slate-500" />
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    data-testid="user-menu-logout"
                    className="cursor-pointer text-rose-600 focus:text-rose-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="md:hidden mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#C9A84C] font-semibold">
              Hakomed Italia
            </p>
            <h1 className="font-display text-2xl font-semibold">Global Partner Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Stats */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          data-testid="stats-bar"
          aria-label="Summary statistics"
        >
          <StatCard icon={Users} label="Total Partners" value={stats.total} accent="bg-[#0D1B2A] text-[#C9A84C]" testId="stat-total" delay={0} />
          <StatCard icon={Activity} label="Current" value={stats.current} accent="bg-emerald-50 text-emerald-700" testId="stat-current" delay={0.05} />
          <StatCard icon={Clock} label="Standby" value={stats.standby} accent="bg-amber-50 text-amber-700" testId="stat-standby" delay={0.1} />
          <StatCard icon={Archive} label="Old" value={stats.old} accent="bg-rose-50 text-rose-700" testId="stat-old" delay={0.15} />
        </section>

        {/* Color Legend - reflects Excel color semantics */}
        <section
          className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          data-testid="color-legend"
          aria-label="Status color legend"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D1B2A] leading-tight">Color Legend</p>
              <p className="text-xs text-slate-500 mt-0.5">Riprende i colori del file Excel originale</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200" data-testid="legend-current">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">Current</span>
              <span className="text-xs text-emerald-700/70 hidden sm:inline">— Partner attivo</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200" data-testid="legend-standby">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-700">Standby</span>
              <span className="text-xs text-amber-700/70 hidden sm:inline">— In pausa / attenzione</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200" data-testid="legend-old">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-rose-700">Old</span>
              <span className="text-xs text-rose-700/70 hidden sm:inline">— Inattivo / terminato</span>
            </div>
          </div>
        </section>

        {/* Revenue Progress — 2026 annual target */}
        <RevenueProgress target={3000000} current={1400000} year={2026} />

        {/* Controls */}
        <section
          className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 mb-8 sticky top-4 z-20 shadow-sm no-print"
          data-testid="control-bar"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partners by name, country, activity, email…"
                data-testid="search-input"
                className="pl-10 h-11 border-slate-200 focus-visible:ring-[#C9A84C]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                data-testid="export-excel-button"
                className="border-slate-300 hover:border-[#C9A84C] hover:text-[#0D1B2A] h-11"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-700" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                data-testid="export-pdf-button"
                className="border-slate-300 hover:border-[#C9A84C] hover:text-[#0D1B2A] h-11"
              >
                <FileDown className="h-4 w-4 mr-2 text-rose-700" />
                PDF
              </Button>
              <Button
                onClick={handleAdd}
                data-testid="add-partner-button"
                className="bg-[#0D1B2A] text-white hover:bg-[#0D1B2A]/90 h-11"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap" data-testid="region-tabs">
            <RegionTab
              label="All Regions"
              active={region === "All"}
              count={stats.total}
              onClick={() => setRegion("All")}
              testId="region-tab-All"
            />
            {REGIONS.map((r) => (
              <RegionTab
                key={r}
                label={r}
                active={region === r}
                count={stats.byRegion[r] || 0}
                onClick={() => setRegion(r)}
                testId={`region-tab-${r.replace(/\s+/g, "-")}`}
              />
            ))}

            <div className="ml-auto flex items-center gap-2 flex-wrap" data-testid="status-filter-group">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status:</span>
              {["All", "Current", "Standby", "Old"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  data-testid={`status-filter-${s}`}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    statusFilter === s
                      ? "bg-[#C9A84C] text-[#0D1B2A] border-[#C9A84C]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#C9A84C]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Result summary */}
        <div className="flex items-center justify-between mb-6" data-testid="results-summary">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-[#0D1B2A]" data-testid="results-count">
              {filtered.length}
            </span>{" "}
            of {stats.total} partners
            {search && <span> matching &ldquo;<span className="text-[#0D1B2A] font-medium">{search}</span>&rdquo;</span>}
            {region !== "All" && <span> in <span className="text-[#0D1B2A] font-medium">{region}</span></span>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="loading-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse h-56">
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
                <div className="h-6 w-3/4 bg-slate-100 rounded mb-4" />
                <div className="h-4 w-1/3 bg-slate-100 rounded mb-6" />
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center"
            data-testid="empty-state"
          >
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="font-display text-xl font-semibold text-[#0D1B2A] mb-2">
              No partners found
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Try adjusting your search or filters, or add a new partner.
            </p>
            <Button
              onClick={handleAdd}
              data-testid="empty-add-partner-button"
              className="bg-[#0D1B2A] text-white hover:bg-[#0D1B2A]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </div>
        ) : region === "All" ? (
          <div className="space-y-12">
            {REGIONS.filter((r) => groupedByRegion[r]?.length).map((r) => (
              <section key={r} data-testid={`region-section-${r.replace(/\s+/g, "-")}`}>
                <div className="flex items-baseline gap-4 mb-5">
                  <h2 className="font-display text-2xl font-semibold text-[#0D1B2A] gold-underline">
                    {r}
                  </h2>
                  <span className="text-sm text-slate-500 font-medium">
                    {groupedByRegion[r].length} partner{groupedByRegion[r].length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {groupedByRegion[r].map((p, i) => (
                      <PartnerCard
                        key={p.id}
                        partner={p}
                        index={i}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-testid="partner-grid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <PartnerCard
                  key={p.id}
                  partner={p}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16 no-print" data-testid="dashboard-footer">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="font-display font-bold text-2xl qmd-logo-mark leading-none">qmd</span>
            <span className="text-[#C9A84C] text-sm">®</span>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />
            <p className="text-sm text-slate-600 text-center md:text-left">
              © 2026 <span className="font-medium text-[#0D1B2A]">Hakomed Italia</span> — qmd® Global Partner Network
            </p>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-[0.16em]">
            Precision · Partnership · Progress
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ChangePasswordDialog
        open={changePwOpen}
        onOpenChange={setChangePwOpen}
      />

      <PartnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing}
        onSubmit={handleSubmitForm}
        isSubmitting={submitting}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white" data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-[#0D1B2A]">
              Delete Partner?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#0D1B2A]">{deleteTarget?.name}</span>{" "}
              from the network? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              data-testid="delete-confirm-button"
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;