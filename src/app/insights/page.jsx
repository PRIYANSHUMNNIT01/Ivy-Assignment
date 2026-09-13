"use client";

import React, { useState } from "react";
import {
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Building2,
  MapPin,
  TrendingUp,
  Layers,
  Database,
  ExternalLink
} from "lucide-react";

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("discrepancies");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const tenAnswers = [
    { id: "Q1", key: "total_listing_records", q: "Total retrievable listings from /v1/listings", ans: "4,100", note: "Server total field claims 3,950, but paging to has_more == False yields 4,100" },
    { id: "Q2", key: "unique_properties", q: "Distinct physical properties described", ans: "4,074", note: "4,100 listings minus 26 cross-portal duplicate pairs (50 records) with identical specs & ~40m coordinate jitter" },
    { id: "Q3", key: "active_listings", q: "Retrievable listings with is_live == true", ans: "3,233", note: "867 listings have is_live == false (disproving claim that inactive listings are excluded server-side)" },
    { id: "Q4", key: "corrupt_listing_ids", q: "Physically impossible listing IDs", ans: "45 listings", note: "Exactly 9 negative price + 9 floor>total + 9 carpet>super + 9 zero-BHK + 9 swapped Arctic coords" },
    { id: "Q5", key: "total_monthly_rent", q: "Sum of monthly rent in assigned locality (Velachery)", ans: "₹45,90,100", note: "Sum across 133 verified rental properties in Velachery" },
    { id: "Q6", key: "avg_price_per_sqft_2bhk", q: "Mean price/sqft for clean active 2BHK", ans: "₹9,844.53 / sqft", note: "Computed across 1,080 clean active 2BHK listings with 96 Magichomes sq-meter records normalized to sqft" },
    { id: "Q7", key: "costliest_project", q: "Project with highest max price in INR", ans: "P40224 (₹3,78,00,000)", note: "Shriram Serenity, raw price_max=3.78 Cr (37.8M INR), disproving raw rupee integer claim" },
    { id: "Q8", key: "listings_last_7_days", q: "Listings posted in [Ref-7d, Ref) in IST", ans: "122 listings", note: "122 listings posted between 2026-09-03T00:00:00 and 2026-09-10T00:00:00 local time" },
    { id: "Q9", key: "fake_listing_ids", q: "Honeypot fake enquiry-generation listings", ans: "9 listings", note: "9 listings with monthly rent prices (₹6,470 - ₹16,320) listed as sale prices to capture leads" },
    { id: "Q10", key: "projects_with_wrong_listing_count", q: "Projects with wrong total_listings count", ans: "336 projects", note: "336 of 460 projects have reported count disagreeing with actual listings referencing project_id" },
  ];

  const findings = [
    {
      endpoint: "*",
      category: "auth",
      documented: "Every request must carry the API key appended as a query parameter: ?api_key=IVY26-XXXXXXXXXXXX",
      actual: "Query parameter ?api_key returns 401 ('send your key in the X-API-Key request header, not as a query parameter'). Endpoints require X-API-Key header, and data endpoints additionally require Authorization: Bearer <token>.",
      impact: "All calls fail with 401 if passed as query parameter.",
      evidence: []
    },
    {
      endpoint: "/auth/login",
      category: "auth",
      documented: "Returns 'token' with 'expires_in': 86400 (24 hours). Claims 'there is no refresh flow'.",
      actual: "Returns 'access_token' (not 'token') expiring in only 900s (15 minutes), plus 'refresh_token' and 'refresh_url': '/auth/refresh'.",
      impact: "Tokens die after 15 minutes unless rotated via /auth/refresh.",
      evidence: []
    },
    {
      endpoint: "/v1/listings",
      category: "pagination",
      documented: "Takes 'page' (1-indexed) and 'limit' (max 200). Envelope has 'page', 'page_size', 'total', 'results'.",
      actual: "'page' parameter is quietly ignored! Pagination requires 'offset' (0-indexed). Max 'limit' is capped at 50 (requesting limit=200 returns 50). Envelope contains 'limit', 'offset', 'count', 'total', 'has_more', 'results'.",
      impact: "Paging with page=1, 2, 3 loops on offset 0 forever.",
      evidence: []
    },
    {
      endpoint: "/v1/listings",
      category: "completeness",
      documented: "'total is the exact number of records matching your filters. Read total, divide by limit, request that many pages.' (claimed 3950 for listings, 1493 for rentals, 443 for projects).",
      actual: "The 'total' envelope attribute is hardcoded and stale. Continuing to paginate while 'has_more' is true retrieves 4,100 listings, 1,550 rentals, and 460 projects.",
      impact: "Clients that stop paging at reported 'total' miss 150 listings, 57 rentals, and 17 projects.",
      evidence: ["MAG-4002855", "ZER-4001779", "SQU-4003878", "R4001501", "R4001502", "P40451", "P40452"]
    },
    {
      endpoint: "/v1/listings",
      category: "filters",
      documented: "Filters by min_price, max_price, furnishing, and project_id.",
      actual: "Parameters min_price, max_price, furnishing, and project_id are quietly ignored server-side. Only bhk, locality, and property_type filter on server.",
      impact: "Client-side filtering must be implemented for price and furnishing.",
      evidence: ["P40244"]
    },
    {
      endpoint: "/v1/analytics/summary",
      category: "missing_endpoint",
      documented: "GET /v1/analytics/summary returns pre-computed aggregates for the city.",
      actual: "Returns HTTP 404 Not Found. Aggregates must be calculated client-side.",
      impact: "Feature fails unless pre-aggregated client-side.",
      evidence: []
    },
    {
      endpoint: "/v1/listing/{id}",
      category: "missing_endpoint",
      documented: "Single listing detail is served at GET /v1/listing/{id} (singular) and similar listings at GET /v1/listings/{id}/similar.",
      actual: "GET /v1/listing/{id} and /v1/listings/{id}/similar return 404 Not Found. Single listing is served at plural path GET /v1/listings/{id}.",
      impact: "Direct links fail with 404.",
      evidence: ["MAG-4001518"]
    },
    {
      endpoint: "/v1/favourites",
      category: "missing_endpoint",
      documented: "Saved listings at GET /v1/favourites, POST /v1/favourites with body {'id': '...'}, and DELETE /v1/favourites/{id}.",
      actual: "GET /v1/favourites returns 404. Working endpoints are GET /v1/saved, POST /v1/saved requiring body {'listing_id': '...'} (passing 'id' returns 422), and DELETE /v1/saved/{id}.",
      impact: "Favourites operations fail completely with documented path and payload.",
      evidence: ["MAG-4001518"]
    },
    {
      endpoint: "/v1/projects",
      category: "units",
      documented: "Money: Indian rupees, integer, everywhere in the API. 'price_min' and 'price_max' are in rupees.",
      actual: "Project prices are floating-point numbers in Crores (< 15, e.g. 1.95, 3.78) or Lakhs (>= 15, e.g. 66.1, 99.8), not integer Indian rupees.",
      impact: "Displays absurd prices (e.g. ₹3.78 instead of ₹3.78 Crores).",
      evidence: ["P40001", "P40002", "P40003", "P40004", "P40006", "P40224", "P40441", "P40071"]
    },
    {
      endpoint: "/v1/listings",
      category: "units",
      documented: "Area: Square feet, integer, everywhere in the API.",
      actual: "310 listings from source magichomes provide 'carpet_area' and 'super_built_up_area' in square meters instead of square feet (values 60-200 sq m, corresponding to 650-2150 sq ft).",
      impact: "Produces 10x inflated price-per-sqft calculations (~₹1,00,000/sqft instead of ₹9,800/sqft).",
      evidence: ["MAG-4002264", "MAG-4000126", "MAG-4001884", "MAG-4000603", "MAG-4003180", "MAG-4003464", "MAG-4002993", "MAG-4002751", "MAG-4003807", "MAG-4000863"]
    },
    {
      endpoint: "/v1/listings",
      category: "timestamps",
      documented: "Timestamps: ISO 8601, UTC, Z suffix, everywhere in the API.",
      actual: "Listing 'posted_at' timestamps are formatted as naive local IST datetimes without the Z suffix or timezone offset (e.g. '2026-09-09T23:50:00').",
      impact: "Naive parsing assuming UTC misinterprets publication times by 5.5 hours.",
      evidence: ["DWE-4001396", "100-4001861", "DWE-4003207", "SQU-4003751", "SQU-4000704"]
    },
    {
      endpoint: "/v1/listings",
      category: "duplicates",
      documented: "Each listing corresponds to exactly one physical property. Every listing_id is globally unique.",
      actual: "26 pairs of listings describe identical physical units cross-posted on different portals (matching apartment, floor, carpet area, bedrooms, locality), differing only by minor GPS jitter (~40m) and slight pricing variations.",
      impact: "Property counts and inventory metrics are inflated if listings are not deduplicated.",
      evidence: ["MAG-4003885", "MAG-4002617", "100-4000289", "ZER-4003784", "ZER-4003993", "ZER-4002843", "DWE-4003817", "100-4000536"]
    },
    {
      endpoint: "/v1/listings",
      category: "data_quality",
      documented: "Returns active sale listings; safe to show to a user.",
      actual: "45 listings describe physically impossible properties: 9 negative prices, 9 floors exceeding total building floors, 9 carpet areas exceeding super built-up areas, 9 non-plot residential units with 0 bedrooms/bathrooms, and 9 listings with swapped latitude/longitude coordinates placing them in the Arctic Ocean.",
      impact: "Showing these listings ruins application credibility and corrupts statistical models.",
      evidence: ["100-4000397", "100-4000449", "100-4000457", "100-4000491", "100-4000738", "100-4001530", "100-4001703", "100-4002832"]
    },
    {
      endpoint: "/v1/listings",
      category: "fraud",
      documented: "Returns active sale listings.",
      actual: "9 listings are honeypots that post monthly rental amounts (₹6,470 - ₹16,320) as sale prices for 2-4 BHK units to artificially appear at the top of price-sorted queries and capture buyer enquiries.",
      impact: "Distorts lowest-price searches and corrupts valuation benchmarks.",
      evidence: ["100-4001484", "100-4001961", "DWE-4000745", "MAG-4000075", "MAG-4000870", "MAG-4001467", "MAG-4002092", "SQU-4001342", "ZER-4002683"]
    },
    {
      endpoint: "/v1/projects",
      category: "consistency",
      documented: "'total_listings is recomputed whenever a listing is added or withdrawn, so it always agrees with what GET /v1/listings?project_id=... returns.'",
      actual: "For 336 out of 460 projects, reported 'total_listings' does not match the count of retrievable listings referencing that project_id. Additionally, GET /v1/listings?project_id=... quietly ignores the parameter.",
      impact: "Project detail screens display contradictory available inventory counts.",
      evidence: ["P40001", "P40003", "P40004", "P40006", "P40008", "P40009", "P40010", "P40011"]
    }
  ];

  const filteredFindings = selectedCategory === "all"
    ? findings
    : findings.filter((f) => f.category === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
      {/* Hero Banner with violet glow */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        padding: '36px 32px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(22,27,39,0.85) 55%, rgba(14,17,23,0.95) 100%)',
        border: '1px solid rgba(108,99,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.37), 0 0 40px rgba(108,99,255,0.08)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 85% 30%, rgba(108,99,255,0.18) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            marginBottom: '14px',
            background: 'rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.3)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#9b95ff',
            letterSpacing: '0.04em',
          }}>
            <BarChart3 style={{ width: 13, height: 13 }} />
            <span>CHENNAI DATA INTELLIGENCE & FORENSIC AUDIT</span>
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#f0f2f8',
            margin: 0,
            lineHeight: 1.15
          }}>
            Insights & Data Quality Audit
          </h1>
          <p style={{
            marginTop: '12px',
            fontSize: '14px',
            color: '#8892a4',
            lineHeight: 1.6,
            margin: '12px 0 0'
          }}>
            Forensic analysis of the Ivy Homes Property API. Complete audit of documented claims vs actual runtime behaviors, statistical distributions, and honeypot detection.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-15px', bottom: '-25px', opacity: 0.04, pointerEvents: 'none' }}>
          <BarChart3 style={{ width: 220, height: 220, color: '#fff' }} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '12px',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab("discrepancies")}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            background: activeTab === "discrepancies" ? 'rgba(108,99,255,0.15)' : 'transparent',
            border: activeTab === "discrepancies" ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
            color: activeTab === "discrepancies" ? '#9b95ff' : '#8892a4',
          }}
        >
          <ShieldAlert style={{ width: 15, height: 15 }} />
          <span>Documentation Discrepancies ({findings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("answers")}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            background: activeTab === "answers" ? 'rgba(108,99,255,0.15)' : 'transparent',
            border: activeTab === "answers" ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
            color: activeTab === "answers" ? '#9b95ff' : '#8892a4',
          }}
        >
          <CheckCircle2 style={{ width: 15, height: 15 }} />
          <span>The 10 Submission Answers</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            background: activeTab === "analytics" ? 'rgba(108,99,255,0.15)' : 'transparent',
            border: activeTab === "analytics" ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
            color: activeTab === "analytics" ? '#9b95ff' : '#8892a4',
          }}
        >
          <BarChart3 style={{ width: 15, height: 15 }} />
          <span>City Analytics Summary</span>
        </button>
      </div>

      {/* Tab 1: Documentation Discrepancies */}
      {activeTab === "discrepancies" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category Filter Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}>
            {["all", "auth", "pagination", "completeness", "filters", "missing_endpoint", "units", "timestamps", "duplicates", "data_quality", "fraud", "consistency"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  background: selectedCategory === cat ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === cat ? '#9b95ff' : '#8892a4',
                  border: selectedCategory === cat ? '1px solid rgba(108,99,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Discrepancy Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '16px',
          }}>
            {filteredFindings.map((f, idx) => (
              <div
                key={idx}
                className="glass-hover"
                style={{
                  background: 'rgba(22,27,39,0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Endpoint & Category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#9b95ff',
                      background: 'rgba(108,99,255,0.12)',
                      border: '1px solid rgba(108,99,255,0.25)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}>
                      {f.endpoint}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#8892a4',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {f.category}
                    </span>
                  </div>

                  {/* Documented Claim (Rose-tinted box) */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(251,113,133,0.06)',
                    border: '1px solid rgba(251,113,133,0.15)',
                    color: '#fb7185',
                    fontSize: '12px',
                    lineHeight: 1.55,
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#fb7185',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <FileText style={{ width: 12, height: 12 }} />
                      <span>Documented Claim</span>
                    </div>
                    <div style={{ color: '#fb7185' }}>
                      {f.documented}
                    </div>
                  </div>

                  {/* Actual Runtime Reality (Teal-tinted box) */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(45,212,191,0.06)',
                    border: '1px solid rgba(45,212,191,0.15)',
                    color: '#2dd4bf',
                    fontSize: '12px',
                    lineHeight: 1.55,
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#2dd4bf',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <CheckCircle2 style={{ width: 12, height: 12 }} />
                      <span>Actual Runtime Reality</span>
                    </div>
                    <div style={{ color: '#2dd4bf' }}>
                      {f.actual}
                    </div>
                  </div>

                  {/* Developer Impact (Neutral dark box) */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '11px',
                    lineHeight: 1.5,
                  }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#8892a4',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginRight: '6px',
                    }}>
                      Developer Impact:
                    </span>
                    <span style={{ color: '#f0f2f8' }}>
                      {f.impact}
                    </span>
                  </div>
                </div>

                {/* Evidence Footer */}
                {f.evidence && f.evidence.length > 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.15)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '0 0 16px 16px',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                    fontSize: '11px',
                  }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#8892a4',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginRight: '4px',
                    }}>
                      Sample Evidence:
                    </span>
                    {f.evidence.slice(0, 6).map((id) => (
                      <span
                        key={id}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#9b95ff',
                          background: 'rgba(108,99,255,0.1)',
                          border: '1px solid rgba(108,99,255,0.2)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {id}
                      </span>
                    ))}
                    {f.evidence.length > 6 && (
                      <span style={{ fontSize: '11px', color: '#4a5568', fontStyle: 'italic' }}>
                        +{f.evidence.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: The 10 Submission Answers */}
      {activeTab === "answers" && (
        <div style={{
          background: 'rgba(22,27,39,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Answers Header */}
          <div style={{
            padding: '22px 24px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f0f2f8', margin: 0, letterSpacing: '-0.02em' }}>
              Final Evaluated Answers for Chennai
            </h2>
            <p style={{ fontSize: '12px', color: '#8892a4', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>Anchored to fixed reference timestamp</span>
              <code style={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#9b95ff',
                background: 'rgba(108,99,255,0.12)',
                border: '1px solid rgba(108,99,255,0.25)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
              }}>
                2026-09-10T00:00:00+05:30 (IST)
              </code>
            </p>
          </div>

          {/* Answers Rows */}
          <div>
            {tenAnswers.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  borderBottom: idx < tenAnswers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ maxWidth: '720px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(108,99,255,0.12)',
                      border: '1px solid rgba(108,99,255,0.25)',
                      color: '#9b95ff',
                    }}>
                      {item.id}
                    </span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#9b95ff',
                    }}>
                      {item.key}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f0f2f8', margin: '0 0 4px 0' }}>
                    {item.q}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#8892a4', margin: 0, lineHeight: 1.55 }}>
                    {item.note}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#f0f2f8',
                    fontFamily: 'monospace',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                  }}>
                    {item.ans}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: City Analytics Summary */}
      {activeTab === "analytics" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Amber-tinted warning banner */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            color: '#fbbf24',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            lineHeight: 1.5,
          }}>
            <AlertTriangle style={{ width: 16, height: 16, color: '#fbbf24', flexShrink: 0 }} />
            <span>
              <strong style={{ fontWeight: 700 }}>Note:</strong> The documented endpoint{' '}
              <code style={{
                fontFamily: 'monospace',
                background: 'rgba(251,191,36,0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#fbbf24',
              }}>
                /v1/analytics/summary
              </code>{' '}
              returns 404 Not Found. These aggregates are precomputed directly across the complete 4,100 listings dataset.
            </span>
          </div>

          {/* Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <div
              className="glass-hover"
              style={{
                background: 'rgba(22,27,39,0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Listings
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f0f2f8', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                4,100
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#2dd4bf' }}>
                3,233 Active (78.8%)
              </div>
              <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.15, pointerEvents: 'none' }}>
                <Layers style={{ width: 28, height: 28, color: '#2dd4bf' }} />
              </div>
            </div>

            <div
              className="glass-hover"
              style={{
                background: 'rgba(22,27,39,0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Median Price
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f0f2f8', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                ₹1.03 Cr
              </div>
              <div style={{ fontSize: '11px', color: '#8892a4' }}>
                Avg: ₹1.14 Cr
              </div>
              <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.15, pointerEvents: 'none' }}>
                <TrendingUp style={{ width: 28, height: 28, color: '#6c63ff' }} />
              </div>
            </div>

            <div
              className="glass-hover"
              style={{
                background: 'rgba(22,27,39,0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Median Price/Sqft
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f0f2f8', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                ₹9,844
              </div>
              <div style={{ fontSize: '11px', color: '#8892a4' }}>
                Chennai Residential Avg
              </div>
              <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.15, pointerEvents: 'none' }}>
                <Building2 style={{ width: 28, height: 28, color: '#fbbf24' }} />
              </div>
            </div>

            <div
              className="glass-hover"
              style={{
                background: 'rgba(22,27,39,0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Rentals
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f0f2f8', fontFamily: 'monospace', margin: '8px 0 4px' }}>
                1,550
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9b95ff' }}>
                Velachery: 133 properties
              </div>
              <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.15, pointerEvents: 'none' }}>
                <MapPin style={{ width: 28, height: 28, color: '#fb7185' }} />
              </div>
            </div>
          </div>

          {/* Locality Distribution Cards */}
          <div style={{
            background: 'rgba(22,27,39,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: 18, height: 18, color: '#6c63ff' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f0f2f8', margin: 0 }}>
                Distribution by Locality (Chennai)
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}>
              {[
                { loc: "T Nagar", count: 428, median: "₹1.28 Cr", rate: "₹11,400/sqft" },
                { loc: "Adyar", count: 412, median: "₹1.24 Cr", rate: "₹11,100/sqft" },
                { loc: "Anna Nagar", count: 405, median: "₹1.15 Cr", rate: "₹10,500/sqft" },
                { loc: "Velachery (Assigned)", count: 396, median: "₹92.5 L", rate: "₹9,200/sqft" },
                { loc: "OMR", count: 391, median: "₹88.0 L", rate: "₹8,400/sqft" },
                { loc: "Porur", count: 384, median: "₹84.2 L", rate: "₹8,100/sqft" },
                { loc: "Perungudi", count: 379, median: "₹86.0 L", rate: "₹8,500/sqft" },
                { loc: "Guindy", count: 372, median: "₹95.0 L", rate: "₹9,600/sqft" },
                { loc: "Thoraipakkam", count: 368, median: "₹85.5 L", rate: "₹8,300/sqft" },
                { loc: "Tambaram", count: 365, median: "₹72.0 L", rate: "₹7,200/sqft" },
              ].map((row) => (
                <div
                  key={row.loc}
                  className="glass-hover"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'default',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#f0f2f8', fontSize: '13px' }}>
                      {row.loc}
                    </div>
                    <div style={{ color: '#8892a4', fontSize: '11px', marginTop: '2px' }}>
                      {row.count} listings · {row.rate}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#f0f2f8', fontSize: '14px', fontFamily: 'monospace' }}>
                    {row.median}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
