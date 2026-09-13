"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { fetchSavedListings, removeSavedListing } from "../../services/api";
import { Bookmark, MapPin, Trash2, LogIn, ArrowRight } from "lucide-react";

export default function SavedPage() {
  const { user, toggleSave } = useAuth();
  const [savedItems, setSaved]  = useState([]);
  const [loading, setLoading]   = useState(true);

  const loadSaved = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try { const d=await fetchSavedListings(); setSaved(d.results||[]); }
    catch(e){ console.error(e); } finally{ setLoading(false); }
  };

  useEffect(()=>{ loadSaved(); },[user]);

  const handleRemove = async (id) => {
    await toggleSave(id);
    setSaved(p=>p.filter(x=>x.listing_id!==id));
  };

  if (!user) {
    return (
      <div style={{ maxWidth:380, margin:'80px auto', textAlign:'center', padding:'0 20px' }}>
        <div style={{ width:52, height:52, borderRadius:12, background:'#fff7ed', border:'1px solid #fed7aa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Bookmark size={24} color="#ea580c" />
        </div>
        <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:400, color:'#1c1917' }}>Sign in to see your saved homes</h2>
        <p style={{ margin:'0 0 24px', fontSize:13, color:'#78716c', lineHeight:1.6 }}>
          Saved listings sync to your account via <code style={{fontFamily:'monospace', color:'#57534e'}}>/v1/saved</code> and persist across sessions.
        </p>
        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:8, background:'#ea580c', color:'#fff', fontSize:14, fontWeight:600, textDecoration:'none' }}>
          <LogIn size={15} /> Sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', paddingBottom:20, borderBottom:'1px solid #e8e3dc', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:400, color:'#1c1917' }}>Saved Properties</h1>
          <p style={{ margin:'6px 0 0', fontSize:13, color:'#78716c' }}>
            Via <code style={{fontFamily:'monospace', color:'#57534e'}}>GET /v1/saved</code> for {user.email}
          </p>
        </div>
        <span style={{ padding:'6px 14px', borderRadius:8, background:'#f5f5f4', fontSize:13, fontWeight:600, color:'#57534e' }}>
          {savedItems.length} saved
        </span>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[...Array(3)].map((_,i)=>(
            <div key={i} className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
              <div className="skeleton" style={{height:18,width:'65%'}} />
              <div className="skeleton" style={{height:13,width:'40%'}} />
              <div className="skeleton" style={{height:36}} />
            </div>
          ))}
        </div>
      ) : savedItems.length===0 ? (
        <div className="card" style={{ padding:'60px 24px', textAlign:'center' }}>
          <Bookmark size={36} color="#d4c5b2" style={{margin:'0 auto 12px'}} />
          <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:600}}>Nothing saved yet</h3>
          <p style={{margin:'0 0 20px',fontSize:13,color:'#78716c'}}>Browse listings and hit the bookmark icon to save.</p>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:'#ea580c', textDecoration:'none' }}>
            Browse listings <ArrowRight size={14}/>
          </Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {savedItems.map(l => (
            <div key={l.listing_id} className="card" style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'16px 18px', flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'#fff7ed', color:'#ea580c', textTransform:'capitalize' }}>
                    {l.property_type}
                  </span>
                  <button onClick={()=>handleRemove(l.listing_id)} title="Remove"
                    style={{ padding:4, border:'none', background:'transparent', cursor:'pointer', color:'#d4c5b2' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                    onMouseLeave={e=>e.currentTarget.style.color='#d4c5b2'}>
                    <Trash2 size={15}/>
                  </button>
                </div>

                <Link href={`/listings/${l.listing_id}`} style={{textDecoration:'none'}}>
                  <h2 style={{ margin:'0 0 4px', fontSize:15, fontWeight:400, color:'#1c1917', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden', cursor:'pointer' }}>
                    {l.apartment_name}
                  </h2>
                </Link>
                <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#78716c', marginBottom:14 }}>
                  <MapPin size={12}/> <span style={{textTransform:'capitalize',fontWeight:500}}>{l.locality}</span>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#1c1917', fontFamily:"'DM Serif Display',Georgia,serif" }}>
                    ₹{l.price?l.price.toLocaleString("en-IN"):"N/A"}
                  </div>
                  <div style={{ fontSize:13, color:'#78716c' }}>{l.bedroom} BHK · {l.carpet_area} sqft</div>
                </div>
              </div>

              <div style={{ padding:'9px 18px', background:'#fafaf8', borderTop:'1px solid #f5f5f4', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#a8a29e' }}>{l.listing_id}</span>
                <Link href={`/listings/${l.listing_id}`} style={{ fontSize:13, fontWeight:600, color:'#ea580c', textDecoration:'none' }}>
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
