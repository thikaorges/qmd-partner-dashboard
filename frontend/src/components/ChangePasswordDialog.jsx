import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { authApi, formatApiError } from "@/lib/http";
import { toast } from "sonner";

export default function ChangePasswordDialog({ open, onOpenChange, onChanged }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!current || !next || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await authApi.changePassword(current, next);
      toast.success("Password updated successfully");
      onChanged?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(formatApiError(err, "Could not change password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md bg-white border-slate-200"
        data-testid="change-password-dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-md bg-[#0D1B2A] flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-[#C9A84C]" />
            </div>
            <DialogTitle className="text-[#0D1B2A] text-xl font-semibold tracking-tight">
              Change Password
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500">
            Choose a strong new password (min. 8 characters).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <Label htmlFor="cp-current" className="text-[#0D1B2A] font-medium">
              Current password
            </Label>
            <Input
              id="cp-current"
              type="password"
              autoComplete="current-password"
              data-testid="cp-current"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="cp-new" className="text-[#0D1B2A] font-medium">
              New password
            </Label>
            <Input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              data-testid="cp-new"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="cp-confirm" className="text-[#0D1B2A] font-medium">
              Confirm new password
            </Label>
            <Input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              data-testid="cp-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {error && (
            <p
              data-testid="cp-error"
              className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cp-cancel"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="cp-submit"
              className="bg-[#0D1B2A] hover:bg-[#0D1B2A]/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}