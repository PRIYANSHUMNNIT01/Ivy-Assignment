"use client";

import React, { useState, useEffect } from "react";
import { fetchProjects } from "../../services/api";
import { Building2, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const inp = { padding:'7px 10px', borderRadius:8, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color:'#1c1917', outline:'none', width:'100%' };

const STATUS_STYLE = {
  'ready to move':      { bg:'#dcfce7', color:'#15803d' },
  'under construction': { bg:'#fef9c3', color:'#854d0e' },
  'new launch':         { bg:'#ede9fe', color:'#6d28d9' },
};

export default function ProjectsPage() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [offset, setOffset]       = useState(0);
  const [limit]                   = useState(50);
  const [hasMore, setHasMore]     = useState(false);
  const [totalReported, setTotal] = useState(0);

  const [locality, setLocality]   = useState("all");
  const [status, setStatus]       = useState("all");

  const localities = ["all","adyar","anna nagar","guindy","omr","perungudi","porur","t nagar","tambaram","thoraipakkam","velachery"];
  const statuses   = ["all","under construction","ready to move","new launch"];

  const load = async (off) => {
    setLoading(true);
    try {
      const data = await fetchProjects({ offset:off, limit, locality:locality!=="all"?locality:undefined, project_status:status!=="all"?status:undefined });
      setProjects(data.results||[]);
      setHasMore(data.has_more||false);
      setTotal(data.total||0);
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  useEffect(()=>{setOffset(0);load(0);},[locality,status]);
  const next=()=>{if(hasMore){const n=offset+limit;setOffset(n);load(n);window.scrollTo({top:0,behavior:'smooth'});}};
  const prev=()=>{if(offset>=limit){const p=offset-limit;setOffset(p);load(p);window.scrollTo({top:0,behavior:'smooth'});}};

  const cvt = (v) => {
    if(v==null) return "N/A";
    if(v<15) return `₹${v.toFixed(2)} Cr`;
    if(v<1000) return `₹${v.toFixed(1)} L`;
    return `₹${(v/100000).toFixed(1)} L`;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ paddingBottom:20, borderBottom:'1px solid #e8e3dc' }}>
        <h1 style={{ margin:0, fontSize:28, fontWeight:400, color:'#1c1917' }}>Developer Projects — Chennai</h1>
        <p style={{ margin:'6px 0 0', fontSize:14, color:'#78716c' }}>
          {totalReported.toLocaleString()} projects · Prices corrected from raw API floats (Crores / Lakhs)
        </p>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e8e3dc', borderRadius:12, padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, fontSize:13, fontWeight:600, color:'#44403c' }}>
          <SlidersHorizontal size={15} color="#ea580c" /> Filters
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {[
            { label:'Locality', val:locality, set:setLocality, opts:localities.map(l=>({v:l,t:l==='all'?'All Localities':l.toUpperCase()})) },
            { label:'Status', val:status, set:setStatus, opts:statuses.map(s=>({v:s,t:s==='all'?'All Statuses':s.charAt(0).toUpperCase()+s.slice(1)})) },
          ].map(({label,val,set,opts})=>(
            <div key={label}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</label>
              <select value={val} onChange={e=>set(e.target.value)} style={inp}>
                {opts.map(o=><option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13, color:'#78716c' }}>
        <span>Showing <strong style={{color:'#1c1917'}}>{projects.length}</strong> projects</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={prev} disabled={offset===0||loading} style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 12px',borderRadius:7,border:'1px solid #e8e3dc',background:'#fff',fontSize:13,color:offset===0||loading?'#d4c5b2':'#57534e',cursor:offset===0||loading?'not-allowed':'pointer' }}>
            <ChevronLeft size={14}/> Prev
          </button>
          <span style={{fontWeight:600,color:'#1c1917'}}>Pg {Math.floor(offset/limit)+1}</span>
          <button onClick={next} disabled={!hasMore||loading} style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 12px',borderRadius:7,border:'1px solid #e8e3dc',background:'#fff',fontSize:13,color:!hasMore||loading?'#d4c5b2':'#57534e',cursor:!hasMore||loading?'not-allowed':'pointer' }}>
            Next <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
              <div className="skeleton" style={{height:18,width:'65%'}} />
              <div className="skeleton" style={{height:13,width:'40%'}} />
              <div className="skeleton" style={{height:36}} />
            </div>
          ))}
        </div>
      ) : projects.length===0 ? (
        <div className="card" style={{ padding:'60px 24px', textAlign:'center' }}>
          <Building2 size={36} color="#d4c5b2" style={{margin:'0 auto 12px'}} />
          <h3 style={{margin:'0 0 4px',fontSize:16,fontWeight:600}}>No projects found</h3>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {projects.map(p => {
            const amenities = Array.isArray(p.amenities)?p.amenities:typeof p.amenities==="string"?JSON.parse(p.amenities||"[]"):[];
            const sc = STATUS_STYLE[p.project_status] || { bg:'#f5f5f4', color:'#57534e' };
            return (
              <div key={p.project_id} className="card" style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'16px 18px', flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'#f5f5f4', color:'#57534e', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.developer_name}
                    </span>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:sc.bg, color:sc.color, textTransform:'capitalize', flexShrink:0 }}>
                      {p.project_status}
                    </span>
                  </div>

                  <h2 style={{ margin:'0 0 4px', fontSize:15, fontWeight:400, color:'#1c1917', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {p.apartment_name}
                  </h2>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#78716c', marginBottom:14 }}>
                    <MapPin size={12}/> <span style={{textTransform:'capitalize',fontWeight:500}}>{p.locality}</span>
                    <span>·</span><span style={{color:'#a8a29e'}}>{p.total_units} units</span>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom:12, marginBottom:12, borderBottom:'1px solid #f5f5f4' }}>
                    <div>
                      <div style={{fontSize:11,color:'#a8a29e',marginBottom:2}}>Price range</div>
                      <div style={{ fontSize:20, fontWeight:700, color:'#1c1917', fontFamily:"'DM Serif Display',Georgia,serif" }}>
                        {cvt(p.price_min)} – {cvt(p.price_max)}
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,color:'#a8a29e'}}>Inventory</div>
                      <div style={{fontSize:13,fontWeight:600,color:'#15803d'}}>{p.total_listings} listings</div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', textAlign:'center', fontSize:12, color:'#78716c', gap:4 }}>
                    <div><div style={{fontSize:10,color:'#a8a29e',marginBottom:2}}>Area (sqft)</div><div style={{fontWeight:600,color:'#1c1917'}}>{p.min_area_sqft}–{p.max_area_sqft}</div></div>
                    <div><div style={{fontSize:10,color:'#a8a29e',marginBottom:2}}>Towers</div><div style={{fontWeight:600,color:'#1c1917'}}>{p.total_towers}</div></div>
                    <div><div style={{fontSize:10,color:'#a8a29e',marginBottom:2}}>Floors</div><div style={{fontWeight:600,color:'#1c1917'}}>Up to {p.total_floors}</div></div>
                  </div>

                  {amenities.length>0 && (
                    <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:5 }}>
                      {amenities.slice(0,4).map(a=>(
                        <span key={a} style={{ fontSize:11, padding:'2px 7px', borderRadius:4, background:'#f5f5f4', color:'#57534e', textTransform:'capitalize' }}>{a}</span>
                      ))}
                      {amenities.length>4 && <span style={{ fontSize:11, padding:'2px 7px', borderRadius:4, background:'#f5f5f4', color:'#a8a29e' }}>+{amenities.length-4}</span>}
                    </div>
                  )}
                </div>

                <div style={{ padding:'9px 18px', background:'#fafaf8', borderTop:'1px solid #f5f5f4', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:'monospace', fontSize:11, color:'#a8a29e' }}>{p.project_id}</span>
                  <span style={{ fontSize:12, color:'#78716c' }}>Possession: {p.possession_date||"TBD"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
