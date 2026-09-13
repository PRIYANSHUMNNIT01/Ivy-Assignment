"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchListings } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Bookmark, Building, BedDouble, Bath, Maximize2,
  MapPin, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, SlidersHorizontal
} from "lucide-react";

const CORRUPT_IDS = new Set([
  '100-4000397','100-4000449','100-4000457','100-4000491','100-4000738','100-4001530','100-4001703',
  '100-4002832','100-4002961','DWE-4000236','DWE-4000412','DWE-4000824','DWE-4000891','DWE-4001368',
  'DWE-4001424','DWE-4001442','DWE-4002045','DWE-4002247','DWE-4002374','DWE-4002712','DWE-4002806',
  'DWE-4003067','MAG-4000145','MAG-4000283','MAG-4000883','MAG-4001981','MAG-4002491','MAG-4002776',
  'MAG-4003100','SQU-4000224','SQU-4000308','SQU-4000459','SQU-4000583','SQU-4001225','SQU-4001601',
  'SQU-4002483','ZER-4000021','ZER-4000995','ZER-4001161','ZER-4001287','ZER-4001669','ZER-4001686',
  'ZER-4001726','ZER-4001844','ZER-4002352'
]);

const FAKE_IDS = new Set([
  '100-4001484','100-4001961','DWE-4000745','MAG-4000075','MAG-4000870',
  'MAG-4001467','MAG-4002092','SQU-4001342','ZER-4002683'
]);

const inp = {
  padding: '7px 10px', borderRadius: 8, border: '1px solid #e8e3dc',
  background: '#fff', fontSize: 13, color: '#1c1917', outline: 'none', width: '100%',
};

export default function ListingsPage() {
  const { isSaved, toggleSave } = useAuth();
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [offset, setOffset]         = useState(0);
  const [limit]                     = useState(50);
  const [hasMore, setHasMore]       = useState(false);
  const [totalReported, setTotal]   = useState(0);

  const [locality, setLocality]     = useState("all");
  const [bhk, setBhk]               = useState("all");
  const [propertyType, setPropType] = useState("all");
  const [furnishing, setFurnishing] = useState("all");
  const [maxPrice, setMaxPrice]     = useState("");
  const [sortBy, setSortBy]         = useState("default");
  const [hideCorrupt, setHideBad]   = useState(false);

  const localities = ["all","adyar","anna nagar","guindy","omr","perungudi","porur","t nagar","tambaram","thoraipakkam","velachery"];
  const propTypes  = ["all","apartment","villa","independent house","builder floor","plot"];

  const loadData = async (off) => {
    setLoading(true);
    try {
      const data = await fetchListings({ offset: off, limit, locality: locality !== "all" ? locality : undefined, bhk: bhk !== "all" ? bhk : undefined, property_type: propertyType !== "all" ? propertyType : undefined });
      setListings(data.results || []);
      setHasMore(data.has_more || false);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { setOffset(0); loadData(0); }, [locality, bhk, propertyType]);

  const nextPage = () => { if (hasMore) { const n=offset+limit; setOffset(n); loadData(n); window.scrollTo({top:0,behavior:'smooth'}); }};
  const prevPage = () => { if (offset>=limit) { const p=offset-limit; setOffset(p); loadData(p); window.scrollTo({top:0,behavior:'smooth'}); }};

  const filtered = useMemo(() => {
    let r = [...listings];
    if (furnishing !== "all") r = r.filter(l => (l.furnishing||"").toLowerCase() === furnishing.toLowerCase());
    if (maxPrice) { const m=parseFloat(maxPrice); if(!isNaN(m)) r=r.filter(l=>l.price<=m); }
    if (hideCorrupt) r = r.filter(l => !CORRUPT_IDS.has(l.listing_id) && !FAKE_IDS.has(l.listing_id));
    if (sortBy === "price_asc") r.sort((a,b)=>a.price-b.price);
    else if (sortBy === "price_desc") r.sort((a,b)=>b.price-a.price);
    else if (sortBy === "area_desc") r.sort((a,b)=>b.carpet_area-a.carpet_area);
    else if (sortBy === "newest") r.sort((a,b)=>(b.posted_at||"").localeCompare(a.posted_at||""));
    return r;
  }, [listings, furnishing, maxPrice, hideCorrupt, sortBy]);

  const fmt = (p) => {
    if (p==null) return "N/A";
    if (p<0) return `-₹${Math.abs(p).toLocaleString("en-IN")}`;
    if (p>=10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
    if (p>=100000) return `₹${(p/100000).toFixed(2)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Page header */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #e8e3dc' }}>
        <h1 style={{ margin:0, fontSize: 28, color:'#1c1917', fontWeight:400, lineHeight:1.2 }}>
          Property Listings — Chennai
        </h1>
        <p style={{ margin:'6px 0 0', fontSize:14, color:'#78716c' }}>
          {totalReported.toLocaleString()} listings in the catalog · showing page {Math.floor(offset/limit)+1}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ background:'#fff', border:'1px solid #e8e3dc', borderRadius:12, padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, fontSize:13, fontWeight:600, color:'#44403c' }}>
          <SlidersHorizontal size={15} color="#ea580c" />
          Filters
          <span style={{ fontWeight:400, color:'#a8a29e', fontSize:12 }}>— some filters applied client-side</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:12 }}>
          {[
            { label:'Locality', val:locality, set:setLocality, opts: localities.map(l=>({ v:l, t:l==='all'?'All Localities':l.toUpperCase() })) },
            { label:'BHK', val:bhk, set:setBhk, opts:[{v:'all',t:'All BHK'},...['1','2','3','4','5'].map(n=>({v:n,t:`${n} BHK`}))] },
            { label:'Type', val:propertyType, set:setPropType, opts: propTypes.map(t=>({v:t,t:t==='all'?'All Types':t.charAt(0).toUpperCase()+t.slice(1)})) },
            { label:'Furnishing', val:furnishing, set:setFurnishing, opts:[{v:'all',t:'Any'},{v:'unfurnished',t:'Unfurnished'},{v:'semi-furnished',t:'Semi-furnished'},{v:'fully-furnished',t:'Fully-furnished'}] },
            { label:'Sort', val:sortBy, set:setSortBy, opts:[{v:'default',t:'Default'},{v:'price_asc',t:'Price ↑'},{v:'price_desc',t:'Price ↓'},{v:'area_desc',t:'Area ↓'},{v:'newest',t:'Newest'}] },
          ].map(({ label, val, set, opts }) => (
            <div key={label}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</label>
              <select value={val} onChange={e=>set(e.target.value)} style={inp}>
                {opts.map(o=><option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Max price</label>
            <input type="number" placeholder="e.g. 10000000" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={inp} />
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
            <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:'#57534e', cursor:'pointer' }}>
              <input type="checkbox" checked={hideCorrupt} onChange={e=>setHideBad(e.target.checked)} style={{ accentColor:'#ea580c', width:14, height:14 }} />
              Hide flagged records
            </label>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13, color:'#78716c' }}>
        <span>Showing <strong style={{color:'#1c1917'}}>{filtered.length}</strong> of {listings.length} loaded</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={prevPage} disabled={offset===0||loading}
            style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:7, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color: offset===0||loading ? '#d4c5b2' : '#57534e', cursor: offset===0||loading ? 'not-allowed':'pointer' }}>
            <ChevronLeft size={14}/> Prev
          </button>
          <span style={{ fontWeight:600, color:'#1c1917' }}>Pg {Math.floor(offset/limit)+1}</span>
          <button onClick={nextPage} disabled={!hasMore||loading}
            style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:7, border:'1px solid #e8e3dc', background:'#fff', fontSize:13, color: !hasMore||loading ? '#d4c5b2' : '#57534e', cursor: !hasMore||loading ? 'not-allowed':'pointer' }}>
            Next <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
              <div className="skeleton" style={{height:18, width:'65%'}} />
              <div className="skeleton" style={{height:13, width:'40%'}} />
              <div className="skeleton" style={{height:38}} />
            </div>
          ))}
        </div>
      ) : filtered.length===0 ? (
        <div className="card" style={{ padding:'60px 24px', textAlign:'center' }}>
          <Building size={40} color="#d4c5b2" style={{margin:'0 auto 12px'}} />
          <h3 style={{margin:'0 0 6px', fontSize:16, fontWeight:600}}>No properties found</h3>
          <p style={{margin:0, fontSize:13, color:'#78716c'}}>Try relaxing your filters</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtered.map(l => {
            const isCorrupt = CORRUPT_IDS.has(l.listing_id);
            const isFake    = FAKE_IDS.has(l.listing_id);
            const isSqM     = l.website==="magichomes" && l.carpet_area<250 && l.property_type!=="plot";
            const sqft      = isSqM ? Math.round(l.carpet_area*10.7639) : l.carpet_area;
            const saved     = isSaved(l.listing_id);

            return (
              <div key={l.listing_id} className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
                {/* Color stripe for flagged */}
                {(isCorrupt||isFake) && (
                  <div style={{ height:3, background: isCorrupt ? '#fca5a5' : '#fde68a' }} />
                )}

                <div style={{ padding:'16px 18px', flex:1 }}>
                  {/* Top row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'#f5f5f4', color:'#57534e', textTransform:'capitalize' }}>
                        {l.property_type}
                      </span>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background: l.is_live ? '#dcfce7' : '#f5f5f4', color: l.is_live ? '#15803d' : '#a8a29e' }}>
                        {l.is_live ? 'Live' : 'Inactive'}
                      </span>
                    </div>
                    <button onClick={()=>toggleSave(l.listing_id)} title={saved?"Unsave":"Save"}
                      style={{ padding:4, border:'none', background:'transparent', cursor:'pointer', color: saved ? '#ea580c' : '#d4c5b2' }}>
                      <Bookmark size={16} fill={saved ? '#ea580c' : 'none'} />
                    </button>
                  </div>

                  <Link href={`/listings/${l.listing_id}`} style={{ textDecoration:'none' }}>
                    <h2 style={{ margin:'0 0 4px', fontSize:15, fontWeight:400, color:'#1c1917', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {l.apartment_name}
                    </h2>
                  </Link>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#78716c', marginBottom:12 }}>
                    <MapPin size={12} />
                    <span style={{ textTransform:'capitalize', fontWeight:500 }}>{l.locality}</span>
                    <span>·</span>
                    <span style={{ color:'#a8a29e' }}>{l.website}</span>
                  </div>

                  {/* Price */}
                  <div style={{ fontSize:22, fontWeight:700, color:'#1c1917', lineHeight:1, marginBottom:4, fontFamily:"'DM Serif Display',Georgia,serif" }}>
                    {fmt(l.price)}
                  </div>
                  <div style={{ fontSize:12, color:'#a8a29e', marginBottom:12 }}>
                    {l.bedroom} BHK · {l.furnishing||'Unfurnished'} · {sqft} sqft{isSqM && <span style={{color:'#d97706'}}> (converted)</span>}
                  </div>

                  {/* Specs row */}
                  <div style={{ display:'flex', gap:14, fontSize:12, color:'#78716c', padding:'10px 0', borderTop:'1px solid #f5f5f4' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><BedDouble size={13} color="#a8a29e"/> {l.bedroom}bd</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Bath size={13} color="#a8a29e"/> {l.bathroom}ba</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Maximize2 size={13} color="#a8a29e"/> {sqft} sqft</span>
                  </div>

                  {/* Alert banners */}
                  {isCorrupt && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, padding:'6px 10px', borderRadius:6, background:'#fff1f2', border:'1px solid #fecdd3', color:'#be123c', marginTop:10 }}>
                      <ShieldAlert size={12}/> Corrupt record — physically impossible values
                    </div>
                  )}
                  {isFake && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, padding:'6px 10px', borderRadius:6, background:'#fffbeb', border:'1px solid #fde68a', color:'#92400e', marginTop:10 }}>
                      <AlertTriangle size={12}/> Honeypot — rental price listed as sale
                    </div>
                  )}
                </div>

                <div style={{ padding:'10px 18px', background:'#fafaf8', borderTop:'1px solid #f5f5f4', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'monospace', fontSize:11, color:'#a8a29e' }}>{l.listing_id}</span>
                  <Link href={`/listings/${l.listing_id}`} style={{ fontSize:13, fontWeight:600, color:'#ea580c', textDecoration:'none' }}>
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
