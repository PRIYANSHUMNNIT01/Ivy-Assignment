"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, Key, Building2, BarChart3, Bookmark, LogIn, LogOut } from "lucide-react";
import { API_BASE } from "../services/api";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, savedIds } = useAuth();
  const [serverOk, setServerOk] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => setServerOk(d.status === "ok"))
      .catch(() => setServerOk(false));
  }, []);

  const navItems = [
    { name: "Listings", href: "/", icon: Home },
    { name: "Rentals", href: "/rentals", icon: Key },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Insights", href: "/insights", icon: BarChart3 },
    { name: "Saved", href: "/saved", icon: Bookmark, count: savedIds.size },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #e8e3dc',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>

        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: '#ea580c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Serif Display', Georgia, serif",
            color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.5,
          }}>
            Iv
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17, color: '#1c1917', lineHeight: 1 }}>
              Ivy Homes
            </div>
            <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 1 }}>Chennai</div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? '#ea580c' : '#57534e',
                  background: active ? '#fff7ed' : 'transparent',
                  position: 'relative',
                }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{item.name}</span>
                {item.count > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 999, background: '#ea580c',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  }}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* API status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a8a29e' }} className="hidden lg:flex">
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: serverOk ? '#22c55e' : '#f59e0b', display: 'inline-block' }} />
            <span>{serverOk === null ? '...' : serverOk ? 'API live' : 'API offline'}</span>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="hidden sm:block" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#1c1917', fontWeight: 500 }}>{user.email}</div>
                <div style={{ fontSize: 11, color: '#a8a29e' }}>15-min auto-refresh</div>
              </div>
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8,
                  border: '1px solid #e8e3dc', background: '#fff',
                  fontSize: 13, color: '#57534e', cursor: 'pointer',
                }}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8,
                background: '#ea580c', color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <LogIn size={14} />
              Sign in
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
