"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, KeyRound, ShieldAlert, ArrowRight } from "lucide-react";

const inp = { width:'100%', padding:'9px 12px 9px 38px', borderRadius:8, border:'1px solid #e8e3dc', background:'#fff', fontSize:14, color:'#1c1917', outline:'none' };

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState("demo1@ivy.homes");
  const [password, setPassword] = useState("cfd53b6dd0");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const demoUsers = [
    { email: "demo1@ivy.homes", label: "Demo User 1" },
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
      setError(err.message || "Login failed. Check credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'#fff7ed', border:'1px solid #fed7aa', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Lock size={20} color="#ea580c" />
          </div>
          <h1 style={{ margin:'0 0 6px', fontSize:24, fontWeight:400, color:'#1c1917' }}>Sign in</h1>
          <p style={{ margin:0, fontSize:13, color:'#78716c', lineHeight:1.5 }}>
            Access live Chennai property data. Sessions auto-refresh every 15 minutes.
          </p>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px', borderRadius:8, background:'#fff1f2', border:'1px solid #fecdd3', fontSize:13, color:'#be123c', marginBottom:20 }}>
            <ShieldAlert size={15} style={{ flexShrink:0, marginTop:1 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#57534e', marginBottom:5 }}>Email</label>
            <div style={{ position:'relative' }}>
              <Mail size={14} color="#a8a29e" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="demo1@ivy.homes" />
            </div>
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#57534e', marginBottom:5 }}>Password</label>
            <div style={{ position:'relative' }}>
              <KeyRound size={14} color="#a8a29e" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} style={inp} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', borderRadius:8, background: loading ? '#fdba74' : '#ea580c', color:'#fff', fontSize:14, fontWeight:600, border:'none', cursor: loading ? 'not-allowed':'pointer', marginTop:4 }}>
            {loading ? 'Signing in...' : <><span>Sign in to Ivy Homes</span><ArrowRight size={15}/></>}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #f5f5f4' }}>
          <p style={{ margin:'0 0 10px', fontSize:12, color:'#a8a29e', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Quick fill</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {demoUsers.map(d => (
              <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword("cfd53b6dd0"); }}
                style={{ textAlign:'left', padding:'9px 12px', borderRadius:8, border:`1px solid ${email===d.email ? '#fed7aa' : '#e8e3dc'}`, background: email===d.email ? '#fff7ed' : '#fff', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color: email===d.email ? '#ea580c' : '#1c1917' }}>{d.label}</div>
                  <div style={{ fontSize:11, color:'#a8a29e', marginTop:1 }}>{d.email}</div>
                </div>
                {email===d.email && <span style={{ fontSize:11, fontWeight:600, color:'#ea580c' }}>✓ selected</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Note about token */}
        <div style={{ marginTop:20, padding:'12px 14px', borderRadius:8, background:'#fffbeb', border:'1px solid #fde68a', fontSize:12, color:'#78716c', lineHeight:1.6 }}>
          <strong style={{color:'#92400e'}}>Note:</strong> Docs claim 24h tokens. Reality: <code style={{fontFamily:'monospace', color:'#92400e'}}>expires_in: 900</code> (15 min) with a <code style={{fontFamily:'monospace', color:'#92400e'}}>refresh_token</code>. The app handles rotation automatically.
        </div>
      </div>
    </div>
  );
}
