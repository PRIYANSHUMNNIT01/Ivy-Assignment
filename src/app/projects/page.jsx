"use client";

import React, { useState, useEffect } from "react";
import { fetchProjects } from "../../services/api";
import {
  Building2, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal,
  Layers, Calendar
} from "lucide-react";

const S = {
  card: { background: 'rgba(22,27,39,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' },
  label: { display: 'block', fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' },
  select: { appearance: 'none', width: '100%', padding: '7px 32px 7px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f2f8', fontSize: '12px', fontWeight: 500, outline: 'none', cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892a4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(false);
  const [totalReported, setTotalReported] = useState(0);

  const [locality, setLocality] = useState("all");
  const [status, setStatus] = useState("all");

  const localities = [
    "all", "adyar", "anna nagar", "guindy", "omr", "perungudi",
    "porur", "t nagar", "tambaram", "thoraipakkam", "velachery"
  ];
  const statuses = ["all", "under construction", "ready to move", "new launch"];

  const loadData = async (currentOffset) => {
    setLoading(true);
    try {
      const data = await fetchProjects({
        offset: currentOffset, limit,
        locality: locality !== "all" ? locality : undefined,
        project_status: status !== "all" ? status : undefined,
      });
      setProjects(data.results || []);
      setHasMore(data.has_more || false);
      setTotalReported(data.total || 0);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setOffset(0); loadData(0); }, [locality, status]);

  const handleNext = () => { if (hasMore) { const n = offset + limit; setOffset(n); loadData(n); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const handlePrev = () => { if (offset >= limit) { const p = offset - limit; setOffset(p); loadData(p); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const convertPrice = (val) => {
    if (val === undefined || val === null) return "N/A";
    if (val < 15) return `₹${val.toFixed(2)} Cr`;
    if (val < 1000) return `₹${val.toFixed(1)} L`;
    return `₹${(val / 100000).toFixed(1)} L`;
  };

  const statusColors = {
    'ready to move': { bg: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: 'rgba(45,212,191,0.25)' },
    'under construction': { bg: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
    'new launch': { bg: 'rgba(108,99,255,0.12)', color: '#9b95ff', border: 'rgba(108,99,255,0.3)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '40px 36px',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(14,17,23,0) 60%)',
        border: '1px solid rgba(168,85,247,0.15)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(168,85,247,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', marginBottom: '16px',
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
            fontSize: '11px', fontWeight: 700, color: '#c084fc', letterSpacing: '0.04em',
          }}>
            <Building2 style={{ width: 12, height: 12 }} />
            <span>BUILDER DEVELOPMENTS · UNIT-CORRECTED PRICES</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#f0f2f8', margin: 0, lineHeight: 1.1 }}>
            Developer Projects
            <br />
            <span style={{ background: 'linear-gradient(90deg,#a855f7,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in Chennai
            </span>
          </h1>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#8892a4', lineHeight: 1.6, maxWidth: '480px' }}>
            Major residential communities, high-rises, and gated townships. Prices auto-corrected from raw API floats into Crores and Lakhs.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.04, pointerEvents: 'none' }}>
          <Building2 style={{ width: 220, height: 220, color: '#fff' }} />
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...S.card, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontWeight: 600, color: '#f0f2f8' }}>
          <SlidersHorizontal style={{ width: 15, height: 15, color: '#a855f7' }} />
          <span>Project Filters</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Locality', value: locality, onChange: e => setLocality(e.target.value),
              options: localities.map(l => ({ value: l, label: l === 'all' ? 'All Localities' : l.toUpperCase() })) },
            { label: 'Project Status', value: status, onChange: e => setStatus(e.target.value),
              options: statuses.map(s => ({ value: s, label: s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) })) },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label style={S.label}>{label}</label>
              <select value={value} onChange={onChange} style={S.select}>
                {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1d2433' }}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#8892a4', padding: '0 4px' }}>
        <span>Showing <strong style={{ color: '#f0f2f8' }}>{projects.length}</strong> projects · {offset}–{offset + projects.length} of {totalReported}+</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handlePrev} disabled={offset === 0 || loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: offset === 0 || loading ? '#2a3349' : '#f0f2f8', fontSize: '12px', fontWeight: 500, cursor: offset === 0 || loading ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft style={{ width: 13, height: 13 }} /> Previous
          </button>
          <span style={{ fontWeight: 600, color: '#f0f2f8', padding: '0 4px' }}>Pg {Math.floor(offset / limit) + 1}</span>
          <button onClick={handleNext} disabled={!hasMore || loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: !hasMore || loading ? '#2a3349' : '#f0f2f8', fontSize: '12px', fontWeight: 500, cursor: !hasMore || loading ? 'not-allowed' : 'pointer' }}>
            Next <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: 18, width: '70%' }} />
              <div className="skeleton" style={{ height: 14, width: '45%' }} />
              <div className="skeleton" style={{ height: 40, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ ...S.card, padding: '64px 24px', textAlign: 'center' }}>
          <Building2 style={{ width: 48, height: 48, color: '#2a3349', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f2f8', margin: '0 0 6px' }}>No projects found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map(p => {
            const rawAmenities = Array.isArray(p.amenities) ? p.amenities : typeof p.amenities === "string" ? JSON.parse(p.amenities || "[]") : [];
            const sc = statusColors[p.project_status] || { bg: 'rgba(255,255,255,0.04)', color: '#8892a4', border: 'rgba(255,255,255,0.08)' };

            return (
              <div key={p.project_id} className="glass-hover" style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: '6px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {p.developer_name}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>
                      {p.project_status}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f2f8', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.apartment_name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892a4' }}>
                    <MapPin style={{ width: 12, height: 12 }} />
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{p.locality}</span>
                    <span style={{ color: '#2a3349' }}>·</span>
                    <span>{p.total_units} units</span>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#8892a4', marginBottom: '2px' }}>Price Range</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>
                        {convertPrice(p.price_min)} – {convertPrice(p.price_max)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#8892a4' }}>Inventory</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#2dd4bf' }}>{p.total_listings} listings</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#8892a4', textAlign: 'center', gap: '4px' }}>
                    <div><div style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>Area</div><div style={{ fontWeight: 600, color: '#f0f2f8', fontSize: '12px' }}>{p.min_area_sqft}–{p.max_area_sqft}</div></div>
                    <div><div style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>Towers</div><div style={{ fontWeight: 600, color: '#f0f2f8', fontSize: '12px' }}>{p.total_towers}</div></div>
                    <div><div style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>Floors</div><div style={{ fontWeight: 600, color: '#f0f2f8', fontSize: '12px' }}>Up to {p.total_floors}</div></div>
                  </div>

                  {rawAmenities.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rawAmenities.slice(0, 4).map(am => (
                        <span key={am} style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: '#8892a4', textTransform: 'capitalize', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {am}
                        </span>
                      ))}
                      {rawAmenities.length > 4 && (
                        <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: '#4a5568', border: '1px solid rgba(255,255,255,0.06)' }}>
                          +{rawAmenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 16px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a5568' }}>{p.project_id}</span>
                  <span style={{ fontSize: '11px', color: '#8892a4' }}>Possession: {p.possession_date || "TBD"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
