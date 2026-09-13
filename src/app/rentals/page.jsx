"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchRentals } from "../../services/api";
import { Key, BedDouble, Bath, Maximize2, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const inp = { padding:'7px 10px', borderRadius:8, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color:'#1c1917', outline:'none', width:'100%' };

export default function RentalsPage() {
  const [rentals, setRentals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [offset, setOffset]       = useState(0);
  const [limit]                   = useState(50);
  const [hasMore, setHasMore]     = useState(false);
  const [totalReported, setTotal] = useState(0);

  const [locality, setLocality]   = useState("all");
  const [bhk, setBhk]             = useState("all");
  const [furnishing, setFurn]     = useState("all");
  const [maxRent, setMaxRent]     = useState("");
  const [sortBy, setSortBy]       = useState("default");

  const localities = ["all","adyar","anna nagar","guindy","omr","perungudi","porur","t nagar","tambaram","thoraipakkam","velachery"];

  const load = async (off) => {
    setLoading(true);
    try {
      const data = await fetchRentals({ offset:off, limit, locality:locality!=="all"?locality:undefined, bhk:bhk!=="all"?bhk:undefined });
      setRentals(data.results||[]);
      setHasMore(data.has_more||false);
      setTotal(data.total||0);
    } catch(e){ console.error(e); } finally{ setLoading(false); }
  };

  useEffect(() => { setOffset(0); load(0); }, [locality, bhk]);
  const next = () => { if(hasMore){const n=offset+limit;setOffset(n);load(n);window.scrollTo({top:0,behavior:'smooth'});} };
  const prev = () => { if(offset>=limit){const p=offset-limit;setOffset(p);load(p);window.scrollTo({top:0,behavior:'smooth'});} };

  const filtered = useMemo(() => {
    let r=[...rentals];
    if(furnishing!=="all") r=r.filter(x=>(x.furnishing||"").toLowerCase()===furnishing.toLowerCase());
    if(maxRent){const m=parseFloat(maxRent);if(!isNaN(m))r=r.filter(x=>x.price<=m);}
    if(sortBy==="price_asc") r.sort((a,b)=>a.price-b.price);
    else if(sortBy==="price_desc") r.sort((a,b)=>b.price-a.price);
    else if(sortBy==="area_desc") r.sort((a,b)=>b.carpet_area-a.carpet_area);
    return r;
  }, [rentals, furnishing, maxRent, sortBy]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ paddingBottom:20, borderBottom:'1px solid #e8e3dc' }}>
        <h1 style={{ margin:0, fontSize:28, fontWeight:400, color:'#1c1917' }}>Rentals — Chennai</h1>
        <p style={{ margin:'6px 0 0', fontSize:14, color:'#78716c' }}>
          Assigned locality: <strong style={{color:'#1c1917'}}>Velachery</strong> · {totalReported.toLocaleString()} total in catalog
        </p>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e8e3dc', borderRadius:12, padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, fontSize:13, fontWeight:600, color:'#44403c' }}>
          <SlidersHorizontal size={15} color="#ea580c" /> Filters
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
          {[
            { label:'Locality', val:locality, set:setLocality, opts:localities.map(l=>({v:l,t:l==='all'?'All Localities':l.toUpperCase()+(l==='velachery'?' ★':'')})) },
            { label:'BHK', val:bhk, set:setBhk, opts:[{v:'all',t:'All BHK'},...['1','2','3','4'].map(n=>({v:n,t:`${n} BHK`}))] },
            { label:'Furnishing', val:furnishing, set:setFurn, opts:[{v:'all',t:'Any'},{v:'unfurnished',t:'Unfurnished'},{v:'semi-furnished',t:'Semi'},{v:'fully-furnished',t:'Fully'}] },
            { label:'Sort', val:sortBy, set:setSortBy, opts:[{v:'default',t:'Default'},{v:'price_asc',t:'Rent ↑'},{v:'price_desc',t:'Rent ↓'},{v:'area_desc',t:'Area ↓'}] },
          ].map(({label,val,set,opts})=>(
            <div key={label}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</label>
              <select value={val} onChange={e=>set(e.target.value)} style={inp}>
                {opts.map(o=><option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Max rent (₹)</label>
            <input type="number" placeholder="e.g. 35000" value={maxRent} onChange={e=>setMaxRent(e.target.value)} style={inp} />
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13, color:'#78716c' }}>
        <span>Showing <strong style={{color:'#1c1917'}}>{filtered.length}</strong> rentals</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={prev} disabled={offset===0||loading} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:7, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color:offset===0||loading?'#d4c5b2':'#57534e', cursor:offset===0||loading?'not-allowed':'pointer' }}>
            <ChevronLeft size={14}/> Prev
          </button>
          <span style={{fontWeight:600, color:'#1c1917'}}>Pg {Math.floor(offset/limit)+1}</span>
          <button onClick={next} disabled={!hasMore||loading} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:7, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color:!hasMore||loading?'#d4c5b2':'#57534e', cursor:!hasMore||loading?'not-allowed':'pointer' }}>
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
      ) : filtered.length===0 ? (
        <div className="card" style={{ padding:'60px 24px', textAlign:'center' }}>
          <Key size={36} color="#d4c5b2" style={{margin:'0 auto 12px'}} />
          <h3 style={{margin:'0 0 4px', fontSize:16, fontWeight:600}}>No rentals found</h3>
          <p style={{margin:0, fontSize:13, color:'#78716c'}}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtered.map(r => (
            <div key={r.listing_id} className="card" style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'16px 18px', flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'#fff7ed', color:'#ea580c' }}>
                    {r.bedroom} BHK {r.property_type}
                  </span>
                  <span style={{ fontSize:11, color:'#a8a29e', textTransform:'capitalize' }}>{r.furnishing}</span>
                </div>

                <h2 style={{ margin:'0 0 4px', fontSize:15, fontWeight:400, color:'#1c1917', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {r.apartment_name}
                </h2>
                <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#78716c', marginBottom:14 }}>
                  <MapPin size={12}/> <span style={{textTransform:'capitalize',fontWeight:500}}>{r.locality}</span>
                  <span>·</span><span style={{color:'#a8a29e'}}>{r.website}</span>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom:12, marginBottom:12, borderBottom:'1px solid #f5f5f4' }}>
                  <div>
                    <div style={{ fontSize:22, fontWeight:700, color:'#1c1917', fontFamily:"'DM Serif Display',Georgia,serif" }}>
                      ₹{r.price.toLocaleString("en-IN")}
                      <span style={{fontSize:12, fontWeight:400, color:'#a8a29e'}}>/mo</span>
                    </div>
                    {r.maintenance>0 && <div style={{fontSize:11, color:'#a8a29e', marginTop:1}}>+ ₹{r.maintenance.toLocaleString("en-IN")} maint.</div>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11, color:'#a8a29e'}}>Deposit</div>
                    <div style={{fontSize:13, fontWeight:600, color:'#1c1917'}}>₹{(r.deposit||0).toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:14, fontSize:12, color:'#78716c' }}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><BedDouble size={13} color="#a8a29e"/> {r.bedroom}bd</span>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><Bath size={13} color="#a8a29e"/> {r.bathroom}ba</span>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><Maximize2 size={13} color="#a8a29e"/> {r.carpet_area} sqft</span>
                </div>

                {r.description && <p style={{margin:'10px 0 0', fontSize:12, color:'#78716c', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{r.description}</p>}
              </div>

              <div style={{ padding:'9px 18px', background:'#fafaf8', borderTop:'1px solid #f5f5f4', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#a8a29e' }}>{r.listing_id}</span>
                <span style={{ fontSize:12, color:'#78716c' }}>{r.posted_by_contact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
