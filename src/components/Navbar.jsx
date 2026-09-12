"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, Key, Building2, BarChart3, Bookmark, LogIn, LogOut, CheckCircle2, ShieldAlert } from "lucide-react";
import { API_BASE } from "../services/api";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, savedIds } = useAuth();
  const [serverOk, setServerOk] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setServerOk(data.status === "ok"))
      .catch(() => setServerOk(false));
  }, []);

  const navItems = [
    { name: "Listings", href: "/", icon: Home },
    { name: "Rentals", href: "/rentals", icon: Key },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Insights & Audit", href: "/insights", icon: BarChart3, badge: "15 Discrepancies" },
    { name: "Saved", href: "/saved", icon: Bookmark, count: savedIds.size },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
                IV
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Ivy Homes
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Chennai
                </span>
              </div>
            </Link>

            {/* Server Status Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              <span className={`w-2 h-2 rounded-full ${serverOk ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <span>{serverOk ? "Live API (solve.ivy.homes)" : "Connecting API..."}</span>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 flex items-center justify-end space-x-1">
                    <span>{user.email}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-[10px] text-slate-500">Auto-refresh active (15m)</div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Demo Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
