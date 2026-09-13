"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { fetchSavedListings, removeSavedListing } from "../../services/api";
import { Bookmark, Building, BedDouble, Bath, Maximize2, MapPin, Trash2, LogIn, ArrowRight, Heart } from "lucide-react";

const S = {
  card: { background: 'rgba(22,27,39,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' },
};

export default function SavedPage() {
  const { user, toggleSave } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await fetchSavedListings();
      setSavedItems(data.results || []);
    } catch (err) {
      console.error("Failed to load saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSaved(); }, [user]);

  const handleRemove = async (listingId) => {
    await toggleSave(listingId);
    setSavedItems(prev => prev.filter(item => item.listing_id !== listingId));
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Bookmark style={{ width: 28, height: 28, color: '#4a5568' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f0f2f8', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Sign in to View Saved Properties
        </h2>
        <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: 1.6, margin: '0 0 24px' }}>
          Saved listings are synced directly to your account using the{' '}
          <code style={{ fontFamily: 'monospace', fontSize: '12px', padding: '2px 6px', borderRadius: '5px', background: 'rgba(108,99,255,0.12)', color: '#9b95ff' }}>/v1/saved</code> endpoint and persist across reloads.
        </p>
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px',
          background: 'linear-gradient(135deg, #6c63ff, #4b43cc)', color: '#fff', fontSize: '14px', fontWeight: 700,
          borderRadius: '10px', textDecoration: 'none', boxShadow: '0 0 20px rgba(108,99,255,0.3)',
        }}>
          <LogIn style={{ width: 16, height: 16 }} />
          <span>Go to Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)' }}>
              <Heart style={{ width: 18, height: 18, color: '#fb7185', fill: '#fb7185' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f2f8', margin: 0, letterSpacing: '-0.02em' }}>
              Saved Properties
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#8892a4', margin: 0 }}>
            Synced with <code style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 6px', borderRadius: '5px', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' }}>GET /v1/saved</code> for {user.email}
          </p>
        </div>
        <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', fontWeight: 600, color: '#f0f2f8', whiteSpace: 'nowrap' }}>
          {savedItems.length} {savedItems.length === 1 ? "Listing" : "Listings"} Saved
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: 18, width: '70%' }} />
              <div className="skeleton" style={{ height: 14, width: '45%' }} />
              <div className="skeleton" style={{ height: 40 }} />
            </div>
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div style={{ ...S.card, padding: '64px 24px', textAlign: 'center' }}>
          <Bookmark style={{ width: 48, height: 48, color: '#2a3349', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f2f8', margin: '0 0 6px' }}>No saved properties yet</h3>
          <p style={{ fontSize: '13px', color: '#8892a4', margin: '0 0 20px' }}>
            Browse listings and click the bookmark icon to save properties.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>
            Browse Listings Catalog <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {savedItems.map(l => (
            <div key={l.listing_id} className="glass-hover" style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', background: 'rgba(251,113,133,0.08)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)' }}>
                    {l.property_type}
                  </span>
                  <button
                    onClick={() => handleRemove(l.listing_id)}
                    title="Remove from Saved"
                    style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', color: '#4a5568' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(251,113,133,0.08)'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#4a5568'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                <Link href={`/listings/${l.listing_id}`}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f2f8', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer' }}>
                    {l.apartment_name}
                  </h2>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892a4' }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{l.locality}</span>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>
                    ₹{l.price ? l.price.toLocaleString("en-IN") : "N/A"}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#8892a4' }}>
                    {l.bedroom} BHK · {l.carpet_area} sqft
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 16px 16px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a5568' }}>{l.listing_id}</span>
                <Link href={`/listings/${l.listing_id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
