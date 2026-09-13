"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchRentals } from "../../services/api";
import {
  Key, Building, BedDouble, Bath, Maximize2, MapPin,
  ChevronLeft, ChevronRight, SlidersHorizontal
} from "lucide-react";

const S = {
  card: { background: 'rgba(22,27,39,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' },
  label: { display: 'block', fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' },
  select: { appearance: 'none', width: '100%', padding: '7px 32px 7px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f2f8', fontSize: '12px', fontWeight: 500, outline: 'none', cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892a4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' },
  input: { width: '100%', padding: '7px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f2f8', fontSize: '12px', fontWeight: 500, outline: 'none' },
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [totalReported, setTotalReported] = useState(0);

  const [locality, setLocality] = useState("all");
  const [bhk, setBhk] = useState("all");
  const [furnishing, setFurnishing] = useState("all");
  const [maxRent, setMaxRent] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const localities = [
    "all", "adyar", "anna nagar", "guindy", "omr", "perungudi",
    "porur", "t nagar", "tambaram", "thoraipakkam", "velachery"
  ];

  const loadData = async (currentOffset) => {
    setLoading(true);
    try {
      const data = await fetchRentals({
        offset: currentOffset, limit,
        locality: locality !== "all" ? locality : undefined,
        bhk: bhk !== "all" ? bhk : undefined,
      });
      setRentals(data.results || []);
      setHasMore(data.has_more || false);
      setTotalReported(data.total || 0);
    } catch (err) {
      console.error("Failed to load rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setOffset(0); loadData(0); }, [locality, bhk]);

  const handleNext = () => { if (hasMore) { const n = offset + limit; setOffset(n); loadData(n); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const handlePrev = () => { if (offset >= limit) { const p = offset - limit; setOffset(p); loadData(p); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const filteredRentals = useMemo(() => {
    let list = [...rentals];
    if (furnishing !== "all") list = list.filter(r => (r.furnishing || "").toLowerCase() === furnishing.toLowerCase());
    if (maxRent) { const max = parseFloat(maxRent); if (!isNaN(max)) list = list.filter(r => r.price <= max); }
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "area_desc") list.sort((a, b) => b.carpet_area - a.carpet_area);
    return list;
  }, [rentals, furnishing, maxRent, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '40px 36px',
        background: 'linear-gradient(135deg, rgba(45,212,191,0.1) 0%, rgba(14,17,23,0) 60%)',
        border: '1px solid rgba(45,212,191,0.15)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(45,212,191,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', marginBottom: '16px',
            background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)',
            fontSize: '11px', fontWeight: 700, color: '#2dd4bf', letterSpacing: '0.04em',
          }}>
            <Key style={{ width: 12, height: 12 }} />
            <span>RENTAL HOMES & APARTMENTS · CHENNAI SCOPED</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#f0f2f8', margin: 0, lineHeight: 1.1 }}>
            Residential Rentals
            <br />
            <span style={{ background: 'linear-gradient(90deg,#2dd4bf,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in Chennai
            </span>
          </h1>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#8892a4', lineHeight: 1.6, maxWidth: '480px' }}>
            Verified rentals with transparent monthly rents, deposit requirements, and maintenance fees. Assigned locality focus:{" "}
            <strong style={{ color: '#2dd4bf' }}>Velachery</strong>.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.04, pointerEvents: 'none' }}>
          <Building style={{ width: 220, height: 220, color: '#fff' }} />
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...S.card, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontWeight: 600, color: '#f0f2f8' }}>
          <SlidersHorizontal style={{ width: 15, height: 15, color: '#2dd4bf' }} />
          <span>Rental Filters</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Locality', value: locality, onChange: e => setLocality(e.target.value),
              options: localities.map(l => ({ value: l, label: l === 'all' ? 'All Localities' : l.toUpperCase() + (l === 'velachery' ? ' ★' : '') })) },
            { label: 'Bedrooms (BHK)', value: bhk, onChange: e => setBhk(e.target.value),
              options: [{ value: 'all', label: 'All BHK' }, ...['1','2','3','4'].map(n => ({ value: n, label: `${n} BHK` }))] },
            { label: 'Furnishing (Client)', value: furnishing, onChange: e => setFurnishing(e.target.value),
              options: [{ value: 'all', label: 'All Furnishing' }, { value: 'unfurnished', label: 'Unfurnished' }, { value: 'semi-furnished', label: 'Semi-Furnished' }, { value: 'fully-furnished', label: 'Fully-Furnished' }] },
            { label: 'Sort By', value: sortBy, onChange: e => setSortBy(e.target.value),
              options: [{ value: 'default', label: 'Default' }, { value: 'price_asc', label: 'Rent: Low → High' }, { value: 'price_desc', label: 'Rent: High → Low' }, { value: 'area_desc', label: 'Largest Area' }] },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label style={S.label}>{label}</label>
              <select value={value} onChange={onChange} style={S.select}>
                {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1d2433' }}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={S.label}>Max Monthly Rent (₹)</label>
            <input type="number" placeholder="e.g. 35000" value={maxRent} onChange={e => setMaxRent(e.target.value)} style={S.input} />
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#8892a4', padding: '0 4px' }}>
        <span>Showing <strong style={{ color: '#f0f2f8' }}>{filteredRentals.length}</strong> rentals · {offset}–{offset + rentals.length} of {totalReported}+</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[{ label: 'Previous', onClick: handlePrev, disabled: offset === 0 || loading, icon: ChevronLeft, side: 'left' },
            { label: 'Next', onClick: handleNext, disabled: !hasMore || loading, icon: ChevronRight, side: 'right' }].map(({ label, onClick, disabled, icon: Icon, side }) => (
            <button key={label} onClick={onClick} disabled={disabled} style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
              color: disabled ? '#2a3349' : '#f0f2f8', fontSize: '12px', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
            }}>
              {side === 'left' && <Icon style={{ width: 13, height: 13 }} />}
              {label}
              {side === 'right' && <Icon style={{ width: 13, height: 13 }} />}
            </button>
          ))}
          <span style={{ fontWeight: 600, color: '#f0f2f8', padding: '0 4px' }}>Pg {Math.floor(offset / limit) + 1}</span>
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
      ) : filteredRentals.length === 0 ? (
        <div style={{ ...S.card, padding: '64px 24px', textAlign: 'center' }}>
          <Key style={{ width: 48, height: 48, color: '#2a3349', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f2f8', margin: '0 0 6px' }}>No rentals found</h3>
          <p style={{ fontSize: '13px', color: '#8892a4', margin: 0 }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredRentals.map(r => (
            <div key={r.listing_id} className="glass-hover" style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)' }}>
                    {r.bedroom} BHK {r.property_type}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: '#8892a4', textTransform: 'capitalize' }}>
                    {r.furnishing}
                  </span>
                </div>

                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f2f8', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.apartment_name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892a4' }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{r.locality}</span>
                  <span style={{ color: '#2a3349' }}>·</span>
                  <span style={{ color: '#4a5568' }}>{r.website}</span>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>
                      ₹{r.price.toLocaleString("en-IN")}
                      <span style={{ fontSize: '12px', fontWeight: 400, color: '#8892a4', marginLeft: '4px' }}>/month</span>
                    </div>
                    {r.maintenance > 0 && (
                      <div style={{ fontSize: '11px', color: '#8892a4', marginTop: '2px' }}>
                        + ₹{r.maintenance.toLocaleString("en-IN")} maintenance
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#8892a4', marginBottom: '2px' }}>Deposit</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f2f8' }}>₹{(r.deposit || 0).toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div style={{
                  marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#8892a4', gap: '4px',
                }}>
                  {[[BedDouble, `${r.bedroom} Beds`], [Bath, `${r.bathroom} Baths`], [Maximize2, `${r.carpet_area} sqft`]].map(([Icon, text]) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon style={{ width: 12, height: 12, color: '#4a5568' }} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {r.description && (
                  <p style={{ marginTop: '12px', fontSize: '12px', color: '#8892a4', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.description}
                  </p>
                )}
              </div>

              <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 16px 16px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a5568' }}>{r.listing_id}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#8892a4' }}>{r.posted_by_contact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
