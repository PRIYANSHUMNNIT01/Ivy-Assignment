"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchListingById, fetchListings } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import {
  ArrowLeft,
  Bookmark,
  Building,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Compass,
  Car,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

const S = {
  card: {
    background: 'rgba(22, 27, 39, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    color: '#8892a4',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { isSaved, toggleSave } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetchListingById(id)
      .then((data) => {
        setListing(data);
        // Load comparable listings matching locality and BHK
        return fetchListings({
          locality: data.locality,
          bhk: data.bedroom,
          limit: 10,
        });
      })
      .then((similarData) => {
        const sim = (similarData.results || []).filter((item) => item.listing_id !== id);
        setSimilarListings(sim.slice(0, 4));
      })
      .catch((err) => {
        setError(err.message || "Failed to load listing details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '36px', width: '180px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ height: '36px', width: '140px', borderRadius: '10px' }} />
        </div>
        <div style={{ ...S.card, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="skeleton" style={{ height: '24px', width: '80px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ height: '24px', width: '120px', borderRadius: '6px' }} />
              </div>
              <div className="skeleton" style={{ height: '36px', width: '70%', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '16px', width: '40%', borderRadius: '6px' }} />
            </div>
            <div className="skeleton" style={{ height: '90px', width: '220px', borderRadius: '16px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '76px', width: '100%', borderRadius: '14px' }} />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '0 16px' }}>
        <div
          style={{
            ...S.card,
            padding: '40px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            borderColor: 'rgba(251, 113, 133, 0.25)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(251, 113, 133, 0.12)',
              border: '1px solid rgba(251, 113, 133, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185',
            }}
          >
            <ShieldAlert style={{ width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f2f8', margin: 0 }}>
            Property Record Not Found
          </h2>
          <p style={{ fontSize: '13px', color: '#8892a4', margin: 0, lineHeight: 1.5 }}>
            {error || "The requested listing does not exist."}
          </p>
          <Link
            href="/"
            className="glass-hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#6c63ff',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(108, 99, 255, 0.1)',
              border: '1px solid rgba(108, 99, 255, 0.25)',
              textDecoration: 'none',
              marginTop: '8px',
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Back to All Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  const isSqMeters = listing.website === "magichomes" && listing.carpet_area < 250 && listing.property_type !== "plot";
  const effectiveSqft = isSqMeters ? Math.round(listing.carpet_area * 10.7639) : listing.carpet_area;
  const pricePerSqft = effectiveSqft > 0 ? Math.round(listing.price / effectiveSqft) : 0;

  const formatPrice = (p) => {
    if (p === undefined || p === null) return "N/A";
    if (p < 0) return `-₹${Math.abs(p).toLocaleString("en-IN")}`;
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  const specs = [
    { icon: BedDouble, label: "Bedrooms", value: `${listing.bedroom} BHK` },
    { icon: Bath, label: "Bathrooms", value: `${listing.bathroom} Baths` },
    {
      icon: Maximize2,
      label: "Carpet Area",
      value: (
        <span>
          {effectiveSqft} sqft
          {isSqMeters && (
            <span style={{ fontSize: '11px', color: '#8892a4', fontWeight: 400, marginLeft: '4px' }}>
              ({listing.carpet_area} m²)
            </span>
          )}
        </span>
      ),
    },
    { icon: Layers, label: "Floor Level", value: `Floor ${listing.floor} of ${listing.total_floors}` },
    { icon: Compass, label: "Facing", value: listing.facing_direction || "Not specified", capitalize: true },
    { icon: Car, label: "Parking", value: listing.covered_parking ? `${listing.covered_parking} Covered` : "None" },
    { icon: Calendar, label: "Posted Date", value: (listing.posted_at || "").slice(0, 10) || "N/A" },
    { icon: Sparkles, label: "Furnishing", value: listing.furnishing || "Unfurnished", capitalize: true },
  ];

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px 0' }}>
      {/* Back Button & Save Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          href="/"
          className="glass-hover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#8892a4',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span>Back to Listings Catalog</span>
        </Link>
        <button
          onClick={() => toggleSave(listing.listing_id)}
          className="glass-hover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: isSaved(listing.listing_id) ? 'rgba(251, 113, 133, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: isSaved(listing.listing_id) ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isSaved(listing.listing_id) ? '#fb7185' : '#f0f2f8',
          }}
        >
          <Bookmark style={{ width: 14, height: 14, fill: isSaved(listing.listing_id) ? '#fb7185' : 'none', color: isSaved(listing.listing_id) ? '#fb7185' : '#8892a4' }} />
          <span>{isSaved(listing.listing_id) ? "Saved in Favourites" : "Save Property"}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(108, 99, 255, 0.12)',
                  border: '1px solid rgba(108, 99, 255, 0.25)',
                  color: '#9b95ff',
                }}>
                  {listing.property_type}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#8892a4',
                }}>
                  Portal: {listing.website}
                </span>
                {listing.is_verified && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                    color: '#2dd4bf',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <ShieldCheck style={{ width: 13, height: 13 }} />
                    <span>Verified Listing</span>
                  </span>
                )}
              </div>
              <h1 style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#f0f2f8',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                margin: '0 0 8px',
              }}>
                {listing.apartment_name}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#8892a4',
              }}>
                <MapPin style={{ width: 14, height: 14, color: '#2dd4bf', flexShrink: 0 }} />
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#f0f2f8' }}>{listing.locality}</span>
                <span style={{ color: '#4a5568' }}>•</span>
                <span>Chennai, Tamil Nadu</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div style={{
              padding: '20px 24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'right',
              flexShrink: 0,
              minWidth: '220px',
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#f0f2f8',
                lineHeight: 1.1,
              }}>
                {formatPrice(listing.price)}
              </div>
              {pricePerSqft > 0 && listing.price > 0 && (
                <div style={{ fontSize: '12px', color: '#8892a4', fontWeight: 500, marginTop: '4px' }}>
                  ₹{pricePerSqft.toLocaleString("en-IN")} / sqft (effective)
                </div>
              )}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: listing.is_live ? '#2dd4bf' : '#4a5568',
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: listing.is_live ? '#2dd4bf' : '#4a5568',
                  boxShadow: listing.is_live ? '0 0 6px rgba(45, 212, 191, 0.6)' : 'none',
                }} />
                <span>{listing.is_live ? "Active On Market" : "Inactive / Archived"}</span>
              </div>
            </div>
          </div>

          {/* Metric Alert if applicable */}
          {isSqMeters && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              fontSize: '12px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <AlertTriangle style={{ width: 18, height: 18, color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#fbbf24', marginBottom: '2px' }}>
                  Metric Dimension Normalization Applied
                </div>
                <p style={{ margin: 0, color: 'rgba(251, 191, 36, 0.85)', lineHeight: 1.5 }}>
                  This listing from {listing.website} was scraped in square meters ({listing.carpet_area} m² carpet, {listing.super_built_up_area} m² super built-up). Our platform has automatically normalized it to {effectiveSqft} sqft to ensure accurate pricing benchmarks.
                </p>
              </div>
            </div>
          )}

          {/* Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            {specs.map(({ icon: Icon, label, value, capitalize }) => (
              <div
                key={label}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#8892a4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  <Icon style={{ width: 13, height: 13, color: '#6c63ff' }} />
                  <span>{label}</span>
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#f0f2f8',
                  textTransform: capitalize ? 'capitalize' : 'none',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 style={{ ...S.label, marginBottom: '10px' }}>Seller Description</h3>
            <p style={{
              fontSize: '13px',
              color: '#8892a4',
              lineHeight: 1.7,
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              margin: 0,
              whiteSpace: 'pre-line',
            }}>
              {listing.description || "No description provided."}
            </p>
          </div>

          {/* Seller / Agent Contact Card */}
          <div style={{
            padding: '20px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(22, 27, 39, 0.6) 100%)',
            border: '1px solid rgba(108, 99, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(108, 99, 255, 0.2)',
                border: '1px solid rgba(108, 99, 255, 0.4)',
                color: '#9b95ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f2f8' }}>
                    {listing.posted_by_name || "Authorized Seller"}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(108, 99, 255, 0.15)',
                    color: '#9b95ff',
                    border: '1px solid rgba(108, 99, 255, 0.25)',
                  }}>
                    {listing.posted_by}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8892a4', fontFamily: 'monospace', marginTop: '3px' }}>
                  {listing.posted_by_contact || "Direct Contact"}
                </div>
              </div>
            </div>
            <a
              href={`tel:${listing.posted_by_contact}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #6c63ff 0%, #5850ec 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(108, 99, 255, 0.35)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <Phone style={{ width: 15, height: 15 }} />
              <span>Call Seller</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '0 0 16px 16px',
          fontSize: '11px',
          color: '#8892a4',
        }}>
          <span style={{ fontFamily: 'monospace', color: '#4a5568' }}>ID: {listing.listing_id}</span>
          <span>Source: <strong style={{ color: '#f0f2f8' }}>{listing.website}</strong></span>
        </div>
      </div>

      {/* Comparable / Similar Listings Section */}
      {similarListings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f0f2f8', margin: 0 }}>
              Similar Properties in {listing.locality}
            </h2>
            <p style={{ fontSize: '12px', color: '#8892a4', margin: '4px 0 0' }}>
              Comparable {listing.bedroom} BHK properties in the same neighborhood
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {similarListings.map((sim) => (
              <Link
                key={sim.listing_id}
                href={`/listings/${sim.listing_id}`}
                className="glass-hover"
                style={{
                  ...S.card,
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#9b95ff',
                  }}>
                    {sim.bedroom} BHK · {sim.property_type}
                  </div>
                  <div style={{
                    fontWeight: 700,
                    color: '#f0f2f8',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {sim.apartment_name}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>
                    {formatPrice(sim.price)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8892a4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{sim.carpet_area} sqft</span>
                    <span style={{ textTransform: 'capitalize' }}>{sim.locality}</span>
                  </div>
                </div>

                <div style={{
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '0 0 16px 16px',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a5568' }}>{sim.listing_id}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6c63ff' }}>View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
