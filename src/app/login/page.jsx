"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, KeyRound, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState("cfd53b6dd0");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const demoUsers = [
    { email: "demo1@ivy.homes", label: "Demo User 1 (Primary)" },
    { email: "demo2@ivy.homes", label: "Demo User 2" },
    { email: "demo3@ivy.homes", label: "Demo User 3" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed. Check your API key and credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ivy Homes Authentication</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access live Chennai property endpoints with automatic 15-minute session renewal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                placeholder="demo1@ivy.homes"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Ivy Homes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Fill Demo Accounts
          </div>
          <div className="space-y-2">
            {demoUsers.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword("cfd53b6dd0");
                }}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                  email === d.email
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div>
                  <div className="font-semibold">{d.label}</div>
                  <div className="text-slate-500">{d.email}</div>
                </div>
                {email === d.email && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Auth Insight Callout */}
        <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Auth Audit Discovery:</span> The documentation claims tokens last 24 hours without a refresh flow. The real API returns <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">expires_in: 900</code> (15 mins) and a <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">refresh_token</code>. Our app seamlessly handles automatic token rotation via <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">/auth/refresh</code> so sessions survive indefinitely.
        </div>
      </div>
    </div>
  );
}
