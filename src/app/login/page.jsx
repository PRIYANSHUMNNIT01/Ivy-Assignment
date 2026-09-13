"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, KeyRound, ShieldAlert, ArrowRight, CheckCircle2, Zap } from "lucide-react";

const S = {
  input: {
    width: '100%',
    padding: '11px 14px 11px 42px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0f2f8',
    fontSize: '14px',
    outline: 'none',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState("cfd53b6dd0");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const demoUsers = [
    { email: "demo1@ivy.homes", label: "Demo User 1", sub: "Primary · Senior Analyst" },
    { email: "demo2@ivy.homes", label: "Demo User 2", sub: "Portfolio Lead" },
    { email: "demo3@ivy.homes", label: "Demo User 3", sub: "Acquisitions Director" },
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
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{
        background: 'rgba(22,27,39,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.08))',
            border: '1px solid rgba(108,99,255,0.3)',
          }}>
            <Lock style={{ width: 22, height: 22, color: '#6c63ff' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f2f8', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Sign in to Ivy Homes
          </h1>
          <p style={{ fontSize: '13px', color: '#8892a4', margin: 0, lineHeight: 1.5 }}>
            Access live Chennai property endpoints with automatic 15-minute session renewal
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: '20px', padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)',
            display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#fb7185',
          }}>
            <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4a5568' }} />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                style={S.input}
                placeholder="demo1@ivy.homes"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4a5568' }} />
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                style={S.input}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: loading ? 'rgba(108,99,255,0.4)' : 'linear-gradient(135deg, #6c63ff, #4b43cc)',
              color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 0 24px rgba(108,99,255,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <span>Sign In to Ivy Homes</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo */}
        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Quick Fill — Demo Accounts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoUsers.map(d => (
              <button
                key={d.email} type="button"
                onClick={() => { setEmail(d.email); setPassword("cfd53b6dd0"); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px',
                  background: email === d.email ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: email === d.email ? '1px solid rgba(108,99,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: email === d.email ? '#9b95ff' : '#f0f2f8' }}>{d.label}</div>
                  <div style={{ fontSize: '11px', color: '#8892a4', marginTop: '1px' }}>{d.email} · {d.sub}</div>
                </div>
                {email === d.email && <CheckCircle2 style={{ width: 16, height: 16, color: '#6c63ff' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Auth Discovery Callout */}
        <div style={{
          marginTop: '20px', padding: '14px', borderRadius: '10px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
          fontSize: '12px', color: '#8892a4', lineHeight: 1.5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, color: '#fbbf24' }}>
            <Zap style={{ width: 13, height: 13 }} />
            <span>Auth Audit Discovery</span>
          </div>
          Docs claim tokens last 24h with no refresh flow. The real API returns <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', color: '#fbbf24', fontFamily: 'monospace' }}>expires_in: 900</code> (15 min) plus a <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', color: '#fbbf24', fontFamily: 'monospace' }}>refresh_token</code>. Our app handles rotation automatically via <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', color: '#fbbf24', fontFamily: 'monospace' }}>/auth/refresh</code>.
        </div>
      </div>
    </div>
  );
}
