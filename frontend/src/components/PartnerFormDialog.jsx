import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS, STATUSES, ACTIVITIES, getFlag } from "@/lib/constants";

const emptyPartner = {
  name: "",
  country: "",
  flag: "",
  region: "Europe",
  activity: "Med",
  email: "",
  status: "Current",
  revenue_2026: "",
};

export const PartnerFormDialog = ({ open, onOpenChange, initialData, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(emptyPartner);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...emptyPartner, ...initialData } : emptyPartner);
      setErrors({});
    }
  }, [open, initialData]);

  const isEdit = Boolean(initialData?.id);

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-fill flag when country changes and no custom flag provided
      if (key === "country" && (!prev.flag || prev.flag === getFlag(prev.country))) {
        next.flag = getFlag(value);
      }
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!REGIONS.includes(form.region)) e.region = "Select a region";
    if (!STATUSES.includes(form.status)) e.status = "Select a status";
    if (!form.activity.trim()) e.activity = "Activity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    const rev = form.revenue_2026;
    const parsedRev =
      rev === "" || rev === null || rev === undefined
        ? null
        : Number(String(rev).replace(",", "."));
    const payload = {
      ...form,
      flag: form.flag || getFlag(form.country),
      revenue_2026: Number.isFinite(parsedRev) ? parsedRev : null,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl bg-white border-slate-200"
        data-testid="partner-form-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#0D1B2A]">
            {isEdit ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {isEdit
              ? "Update the partner details below."
              : "Enter details for the new qmd® Global Partner."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-[#0D1B2A] font-medium">
                Company Name
              </Label>
              <Input
                id="name"
                data-testid="form-input-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Allomed"
                className="mt-1.5"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="country" className="text-[#0D1B2A] font-medium">
                Country
              </Label>
              <Input
                id="country"
                data-testid="form-input-country"
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
                placeholder="e.g. Austria"
                className="mt-1.5"
              />
              {errors.country && <p className="text-xs text-rose-600 mt-1">{errors.country}</p>}
            </div>

            <div>
              <Label htmlFor="flag" className="text-[#0D1B2A] font-medium">
                Flag Emoji
              </Label>
              <Input
                id="flag"
                data-testid="form-input-flag"
                value={form.flag}
                onChange={(e) => setField("flag", e.target.value)}
                placeholder="🇦🇹"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-[#0D1B2A] font-medium">Region</Label>
              <Select
                value={form.region}
                onValueChange={(v) => setField("region", v)}
              >
                <SelectTrigger className="mt-1.5" data-testid="form-select-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} data-testid={`region-option-${r}`}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && <p className="text-xs text-rose-600 mt-1">{errors.region}</p>}
            </div>

            <div>
              <Label className="text-[#0D1B2A] font-medium">Activity Type</Label>
              <Select
                value={form.activity}
                onValueChange={(v) => setField("activity", v)}
              >
                <SelectTrigger className="mt-1.5" data-testid="form-select-activity">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ACTIVITIES.map((a) => (
                    <SelectItem key={a} value={a} data-testid={`activity-option-${a}`}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activity && <p className="text-xs text-rose-600 mt-1">{errors.activity}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email" className="text-[#0D1B2A] font-medium">
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="form-input-email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="info@partner.com"
                className="mt-1.5"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="revenue_2026" className="text-[#0D1B2A] font-medium">
                Fatturato 2026 (€)
              </Label>
              <Input
                id="revenue_2026"
                type="number"
                step="0.01"
                min="0"
                data-testid="form-input-revenue"
                value={form.revenue_2026 ?? ""}
                onChange={(e) => setField("revenue_2026", e.target.value)}
                placeholder="e.g. 12500.50 (leave empty if unknown)"
                className="mt-1.5"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Lascia vuoto se non disponibile.
              </p>
            </div>

            <div className="md:col-span-2">
              <Label className="text-[#0D1B2A] font-medium">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setField("status", v)}
              >
                <SelectTrigger className="mt-1.5" data-testid="form-select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} data-testid={`status-option-${s}`}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-rose-600 mt-1">{errors.status}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="form-cancel-button"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="form-submit-button"
              className="bg-[#0D1B2A] text-white hover:bg-[#0D1B2A]/90"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerFormDialog;
