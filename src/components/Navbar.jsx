"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, Key, Building2, BarChart3, Bookmark, LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../services/api";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, savedIds } = useAuth();
  const [serverOk, setServerOk] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setServerOk(data.status === "ok"))
      .catch(() => setServerOk(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Listings", href: "/", icon: Home },
    { name: "Rentals", href: "/rentals", icon: Key },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Insights", href: "/insights", icon: BarChart3, badge: "15" },
    { name: "Saved", href: "/saved", icon: Bookmark, count: savedIds.size },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        background: scrolled
          ? 'rgba(14,17,23,0.92)'
          : 'rgba(14,17,23,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #6c63ff 0%, #9b95ff 100%)',
                  boxShadow: '0 0 16px rgba(108,99,255,0.4)',
                }}
              >
                IV
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold" style={{ color: '#f0f2f8' }}>
                  Ivy Homes
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase"
                  style={{ background: 'rgba(108,99,255,0.15)', color: '#9b95ff', border: '1px solid rgba(108,99,255,0.25)' }}
                >
                  Chennai
                </span>
              </div>
            </Link>

            {/* Server health pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#8892a4' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: serverOk ? '#2dd4bf' : '#f59e0b',
                  boxShadow: serverOk ? '0 0 6px rgba(45,212,191,0.6)' : '0 0 6px rgba(245,158,11,0.6)',
                }}
              />
              <span>{serverOk === null ? 'Connecting...' : serverOk ? 'API Live' : 'API Offline'}</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    color: isActive ? '#f0f2f8' : '#8892a4',
                    background: isActive ? 'rgba(108,99,255,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      className="text-[9px] font-black px-1 py-0.5 rounded"
                      style={{ background: 'rgba(108,99,255,0.2)', color: '#9b95ff' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span
                      className="text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#6c63ff', color: '#fff' }}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1 justify-end text-xs font-medium" style={{ color: '#f0f2f8' }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: '#2dd4bf' }} />
                    <span>{user.email}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: '#8892a4' }}>Auto-refresh · 15m tokens</div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    color: '#8892a4',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#fb7185';
                    e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)';
                    e.currentTarget.style.background = 'rgba(251,113,133,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#8892a4';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6c63ff 0%, #4b43cc 100%)',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(108,99,255,0.3)',
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
