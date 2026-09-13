"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchListings } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Search, Filter, Bookmark, Building, BedDouble, Bath,
  Maximize2, MapPin, ChevronLeft, ChevronRight,
  ShieldAlert, AlertTriangle, ArrowUpDown, Sparkles, SlidersHorizontal
} from "lucide-react";

const CORRUPT_IDS = new Set([
  '100-4000397', '100-4000449', '100-4000457', '100-4000491', '100-4000738', '100-4001530', '100-4001703',
  '100-4002832', '100-4002961', 'DWE-4000236', 'DWE-4000412', 'DWE-4000824', 'DWE-4000891', 'DWE-4001368',
  'DWE-4001424', 'DWE-4001442', 'DWE-4002045', 'DWE-4002247', 'DWE-4002374', 'DWE-4002712', 'DWE-4002806',
  'DWE-4003067', 'MAG-4000145', 'MAG-4000283', 'MAG-4000883', 'MAG-4001981', 'MAG-4002491', 'MAG-4002776',
  'MAG-4003100', 'SQU-4000224', 'SQU-4000308', 'SQU-4000459', 'SQU-4000583', 'SQU-4001225', 'SQU-4001601',
  'SQU-4002483', 'ZER-4000021', 'ZER-4000995', 'ZER-4001161', 'ZER-4001287', 'ZER-4001669', 'ZER-4001686',
  'ZER-4001726', 'ZER-4001844', 'ZER-4002352'
]);

const FAKE_IDS = new Set([
  '100-4001484', '100-4001961', 'DWE-4000745', 'MAG-4000075', 'MAG-4000870',
  'MAG-4001467', 'MAG-4002092', 'SQU-4001342', 'ZER-4002683'
]);

const S = {
  card: {
    background: 'rgba(22,27,39,0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
  },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0f2f8',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    padding: '7px 10px',
    width: '100%',
    outline: 'none',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    color: '#8892a4',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '5px',
  },
};

export default function ListingsPage() {
  const { isSaved, toggleSave } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [totalReported, setTotalReported] = useState(0);

  const [locality, setLocality] = useState("all");
  const [bhk, setBhk] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [furnishing, setFurnishing] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [hideCorrupt, setHideCorrupt] = useState(false);

  const localities = [
    "all", "adyar", "anna nagar", "guindy", "omr", "perungudi",
    "porur", "t nagar", "tambaram", "thoraipakkam", "velachery"
  ];

  const propertyTypes = ["all", "apartment", "villa", "independent house", "builder floor", "plot"];
  const furnishingTypes = ["all", "unfurnished", "semi-furnished", "fully-furnished"];

  const loadData = async (currentOffset) => {
    setLoading(true);
    try {
      const data = await fetchListings({
        offset: currentOffset, limit,
        locality: locality !== "all" ? locality : undefined,
        bhk: bhk !== "all" ? bhk : undefined,
        property_type: propertyType !== "all" ? propertyType : undefined,
      });
      setListings(data.results || []);
      setHasMore(data.has_more || false);
      setTotalReported(data.total || 0);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setOffset(0); loadData(0); }, [locality, bhk, propertyType]);

  const handleNextPage = () => {
    if (hasMore) { const n = offset + limit; setOffset(n); loadData(n); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handlePrevPage = () => {
    if (offset >= limit) { const p = offset - limit; setOffset(p); loadData(p); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (furnishing !== "all") result = result.filter(l => (l.furnishing || "").toLowerCase() === furnishing.toLowerCase());
    if (minPrice) { const min = parseFloat(minPrice); if (!isNaN(min)) result = result.filter(l => l.price >= min); }
    if (maxPrice) { const max = parseFloat(maxPrice); if (!isNaN(max)) result = result.filter(l => l.price <= max); }
    if (hideCorrupt) result = result.filter(l => !CORRUPT_IDS.has(l.listing_id) && !FAKE_IDS.has(l.listing_id));
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "area_desc") result.sort((a, b) => b.carpet_area - a.carpet_area);
    else if (sortBy === "newest") result.sort((a, b) => (b.posted_at || "").localeCompare(a.posted_at || ""));
    return result;
  }, [listings, furnishing, minPrice, maxPrice, hideCorrupt, sortBy]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    if (price < 0) return `-₹${Math.abs(price).toLocaleString("en-IN")}`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const selectStyle = { ...S.input, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Banner */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '40px 36px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(14,17,23,0) 60%)',
        border: '1px solid rgba(108,99,255,0.2)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '20px',
          backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(108,99,255,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '999px', marginBottom: '16px',
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
            fontSize: '11px', fontWeight: 700, color: '#9b95ff', letterSpacing: '0.04em',
          }}>
            <Sparkles style={{ width: 12, height: 12 }} />
            <span>CHENNAI · LIVE API · CLIENT FILTER REDUNDANCY</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#f0f2f8', margin: 0, lineHeight: 1.1 }}>
            Property Listings
            <br />
            <span style={{ background: 'linear-gradient(90deg,#6c63ff,#9b95ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in Chennai
            </span>
          </h1>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#8892a4', lineHeight: 1.6, maxWidth: '480px' }}>
            Explore active residential sales across 11 key localities. Real-time unit conversions and audit overlays for corrupt and honeypot records.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.04, pointerEvents: 'none' }}>
          <Building style={{ width: 240, height: 240, color: '#fff' }} />
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...S.card, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#f0f2f8' }}>
            <SlidersHorizontal style={{ width: 15, height: 15, color: '#6c63ff' }} />
            <span>Search & Filter Engine</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#8892a4' }}>— client-side redundancy active</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#8892a4', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={hideCorrupt}
              onChange={e => setHideCorrupt(e.target.checked)}
              style={{ accentColor: '#6c63ff', width: 14, height: 14 }}
            />
            <span>Hide Corrupt & Fake</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Locality', value: locality, onChange: e => setLocality(e.target.value),
              options: localities.map(l => ({ value: l, label: l === 'all' ? 'All Localities' : l.toUpperCase() })) },
            { label: 'Bedrooms (BHK)', value: bhk, onChange: e => setBhk(e.target.value),
              options: [{ value: 'all', label: 'All BHK' }, ...['1','2','3','4','5'].map(n => ({ value: n, label: `${n} BHK` }))] },
            { label: 'Property Type', value: propertyType, onChange: e => setPropertyType(e.target.value),
              options: propertyTypes.map(t => ({ value: t, label: t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) })) },
            { label: 'Furnishing (Client)', value: furnishing, onChange: e => setFurnishing(e.target.value),
              options: furnishingTypes.map(f => ({ value: f, label: f === 'all' ? 'All Furnishing' : f.charAt(0).toUpperCase() + f.slice(1) })) },
            { label: 'Sort By', value: sortBy, onChange: e => setSortBy(e.target.value),
              options: [
                { value: 'default', label: 'Default Order' }, { value: 'price_asc', label: 'Price: Low → High' },
                { value: 'price_desc', label: 'Price: High → Low' }, { value: 'area_desc', label: 'Largest Area' }, { value: 'newest', label: 'Newest Posted' }
              ] },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label style={S.label}>{label}</label>
              <select value={value} onChange={onChange} style={selectStyle}>
                {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1d2433', color: '#f0f2f8' }}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={S.label}>Max Price ₹ (Client)</label>
            <input
              type="number"
              placeholder="e.g. 10000000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              style={S.input}
            />
          </div>
        </div>
      </div>

      {/* Pagination bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#8892a4', padding: '0 4px' }}>
        <span>
          Showing <strong style={{ color: '#f0f2f8' }}>{filteredListings.length}</strong> listings · offset {offset}–{offset + listings.length} of {totalReported}+ in catalog
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevPage}
            disabled={offset === 0 || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
              color: offset === 0 || loading ? '#4a5568' : '#f0f2f8', fontSize: '12px', fontWeight: 500, cursor: offset === 0 || loading ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: 13, height: 13 }} /> Previous
          </button>
          <span style={{ fontWeight: 600, color: '#f0f2f8', padding: '0 4px' }}>Page {Math.floor(offset / limit) + 1}</span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
              color: !hasMore || loading ? '#4a5568' : '#f0f2f8', fontSize: '12px', fontWeight: 500, cursor: !hasMore || loading ? 'not-allowed' : 'pointer',
            }}
          >
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
              <div className="skeleton" style={{ height: 14, width: '35%' }} />
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{ ...S.card, padding: '64px 24px', textAlign: 'center' }}>
          <Building style={{ width: 48, height: 48, color: '#2a3349', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f2f8', margin: '0 0 6px' }}>No properties found</h3>
          <p style={{ fontSize: '13px', color: '#8892a4', margin: 0 }}>Try relaxing your price or furnishing filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredListings.map((l) => {
            const isCorrupt = CORRUPT_IDS.has(l.listing_id);
            const isFake = FAKE_IDS.has(l.listing_id);
            const isSqMeters = l.website === "magichomes" && l.carpet_area < 250 && l.property_type !== "plot";
            const effectiveSqft = isSqMeters ? Math.round(l.carpet_area * 10.7639) : l.carpet_area;
            const pricePerSqft = effectiveSqft > 0 ? Math.round(l.price / effectiveSqft) : 0;
            const saved = isSaved(l.listing_id);

            return (
              <div
                key={l.listing_id}
                className="glass-hover"
                style={{
                  ...S.card,
                  display: 'flex', flexDirection: 'column',
                  ...(isCorrupt ? { borderColor: 'rgba(251,113,133,0.2)' } : {}),
                  ...(isFake ? { borderColor: 'rgba(108,99,255,0.2)' } : {}),
                }}
              >
                <div style={{ padding: '20px', flex: 1 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#8892a4'
                      }}>
                        {l.property_type}
                      </span>
                      {l.is_live ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)' }}>
                          Live
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', color: '#4a5568' }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleSave(l.listing_id)}
                      style={{
                        padding: '6px', borderRadius: '8px', background: saved ? 'rgba(251,113,133,0.12)' : 'rgba(255,255,255,0.04)',
                        border: saved ? '1px solid rgba(251,113,133,0.25)' : '1px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      title={saved ? "Saved" : "Save Listing"}
                    >
                      <Bookmark style={{ width: 14, height: 14, color: saved ? '#fb7185' : '#8892a4', fill: saved ? '#fb7185' : 'none' }} />
                    </button>
                  </div>

                  {/* Title */}
                  <Link href={`/listings/${l.listing_id}`}>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f2f8', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer' }}>
                      {l.apartment_name}
                    </h2>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892a4' }}>
                    <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} />
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{l.locality}</span>
                    <span style={{ color: '#2a3349' }}>·</span>
                    <span style={{ color: '#4a5568' }}>{l.website}</span>
                  </div>

                  {/* Price row */}
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>
                        {formatPrice(l.price)}
                      </div>
                      {pricePerSqft > 0 && l.price > 0 && (
                        <div style={{ fontSize: '11px', color: '#8892a4', marginTop: '1px' }}>
                          ₹{pricePerSqft.toLocaleString("en-IN")}/sqft
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f2f8' }}>{l.bedroom} BHK</div>
                      <div style={{ fontSize: '11px', color: '#8892a4', textTransform: 'capitalize' }}>{l.furnishing || "Unfurnished"}</div>
                    </div>
                  </div>

                  {/* Specs strip */}
                  <div style={{
                    marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#8892a4', gap: '4px',
                  }}>
                    {[
                      [BedDouble, `${l.bedroom} Beds`],
                      [Bath, `${l.bathroom} Baths`],
                      [Maximize2, `${effectiveSqft} sqft`],
                    ].map(([Icon, text]) => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon style={{ width: 12, height: 12, color: '#4a5568' }} />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Alert badges */}
                  {isSqMeters && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '7px 10px', borderRadius: '8px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                      <AlertTriangle style={{ width: 12, height: 12, flexShrink: 0 }} />
                      <span>Magichomes: {l.carpet_area} m² → {effectiveSqft} sqft</span>
                    </div>
                  )}
                  {isCorrupt && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '7px 10px', borderRadius: '8px', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
                      <ShieldAlert style={{ width: 12, height: 12, flexShrink: 0 }} />
                      <span>Corrupt Record · Physically impossible values</span>
                    </div>
                  )}
                  {isFake && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '7px 10px', borderRadius: '8px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)', color: '#9b95ff' }}>
                      <ShieldAlert style={{ width: 12, height: 12, flexShrink: 0 }} />
                      <span>Honeypot · Rental price listed as sale</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 16px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a5568' }}>{l.listing_id}</span>
                  <Link href={`/listings/${l.listing_id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>
                    View Details →
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
