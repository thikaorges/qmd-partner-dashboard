import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { partnersApi } from "@/lib/api";
import { REGIONS, STATUSES, ACTIVITIES, STATUS_STYLES, getFlag, COUNTRY_FLAGS } from "@/lib/constants";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { formatApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import {
  Search,
  Plus,
  Download,
  LogOut,
  Users,
  Globe,
  TrendingUp,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileText,
  ChevronRight,
} from "lucide-react";

// Utility: format EUR
const fmtEur = (v) => {
  if (v == null || v === 0) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
};

// Empty state for the partner form
const EMPTY_FORM = {
  name: "",
  country: "",
  flag: "",
  region: "",
  activity: "",
  email: "",
  status: "Current",
  revenue_2026: "",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [list, st] = await Promise.all([partnersApi.list(), partnersApi.stats()]);
      setPartners(list);
      setStats(st);
    } catch (err) {
      toast.error(formatApiError(err, "Failed to load data"));
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered partners
  const filtered = useMemo(() => {
    let list = partners;
    if (filterRegion !== "all") list = list.filter((p) => p.region === filterRegion);
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [partners, filterRegion, filterStatus, search]);

  // Form handlers
  const openCreate = () => {
    setEditingPartner(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditingPartner(p);
    setForm({
      name: p.name || "",
      country: p.country || "",
      flag: p.flag || "",
      region: p.region || "",
      activity: p.activity || "",
      email: p.email || "",
      status: p.status || "Current",
      revenue_2026: p.revenue_2026 != null ? String(p.revenue_2026) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        flag: form.flag || COUNTRY_FLAGS[form.country] || "",
        revenue_2026: form.revenue_2026 ? Number(form.revenue_2026) : null,
      };
      if (editingPartner) {
        await partnersApi.update(editingPartner.id, payload);
        toast.success("Partner updated");
      } else {
        await partnersApi.create(payload);
        toast.success("Partner created");
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await partnersApi.remove(deleteTarget.id);
      toast.success("Partner deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  // Country flag auto-fill
  const handleCountryChange = (val) => {
    setForm((f) => ({ ...f, country: val, flag: COUNTRY_FLAGS[val] || f.flag }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-[#C9A84C] animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Loading partners…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0D1B2A] border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">
              <span className="text-[#C9A84C]">qmd</span>
              <span className="text-white align-top text-[10px]">®</span>
              <span className="text-white ml-2 font-medium text-sm hidden sm:inline">
                Partner Dashboard
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden md:inline">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Partners" value={stats.total} />
            <StatCard icon={Globe} label="Countries" value={stats.countries} />
            <StatCard
              icon={TrendingUp}
              label="Revenue 2026"
              value={fmtEur(stats.total_revenue_2026)}
              gold
            />
            <StatCard
              icon={Users}
              label="Active"
              value={`${stats.current} / ${stats.total}`}
              sub={`${stats.standby} standby · ${stats.old} old`}
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search partners…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] bg-white border-slate-200 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportToExcel(filtered)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(filtered)}>
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={openCreate} className="bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Add Partner
            </Button>
          </div>
        </div>

        {/* Partners table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Partner</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Region</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Activity</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Email</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Revenue</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p) => {
                    const st = STATUS_STYLES[p.status] || STATUS_STYLES.Current;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer group transition-colors"
                        onClick={() => navigate(`/partner/${p.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{p.flag || getFlag(p.country)}</span>
                            <div>
                              <p className="font-medium text-slate-800">{p.name}</p>
                              <p className="text-xs text-slate-500">{p.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.region}</td>
                        <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{p.activity}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {fmtEur(p.revenue_2026)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${st.bg} ${st.text} ${st.ring}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(p)}
                                className="text-rose-600 focus:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Users className="mx-auto h-10 w-10 mb-3 text-slate-300" />
              <p className="font-medium">No partners found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new partner.</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-4 text-right">
          Showing {filtered.length} of {partners.length} partners
        </p>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Edit Partner" : "Add Partner"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1">
              <Label>Company Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => handleCountryChange(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Select value={form.region} onValueChange={(v) => setForm((f) => ({ ...f, region: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Activity</Label>
              <Select value={form.activity} onValueChange={(v) => setForm((f) => ({ ...f, activity: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ACTIVITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Revenue 2026 (€)</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.revenue_2026}
                onChange={(e) => setForm((f) => ({ ...f, revenue_2026: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={formLoading || !form.name || !form.region}
              className="bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A]"
            >
              {formLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and all associated logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Small stat card component
function StatCard({ icon: Icon, label, value, sub, gold }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${gold ? "bg-[#C9A84C]/10" : "bg-slate-100"}`}>
          <Icon className={`h-5 w-5 ${gold ? "text-[#C9A84C]" : "text-slate-500"}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
