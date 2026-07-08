import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatApiError } from "@/lib/http";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(formatApiError(err, "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1B2838] to-[#0D1B2A] px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#C9A84C]">qmd</span>
            <span className="text-white align-top text-sm">®</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-[0.15em]">
            Global Partner Dashboard
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-white text-xl font-semibold mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input
                type="email"
                placeholder="you@hakomed.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#C9A84C] focus:ring-[#C9A84C]/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#C9A84C] focus:ring-[#C9A84C]/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] font-semibold h-11 rounded-lg transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Hakomed Italia · Access restricted to authorized personnel
          </p>
        </form>
      </div>
    </div>
  );
}
