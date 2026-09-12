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
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-800/60 backdrop-blur-md text-purple-200 text-xs font-semibold mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chennai Data Intelligence & Forensic Audit</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Insights & Data Quality Audit
          </h1>
          <p className="text-purple-200 text-sm sm:text-base mt-2 leading-relaxed">
            Forensic analysis of the Ivy Homes Property API. Complete audit of documented claims vs actual runtime behaviors, statistical distributions, and honeypot detection.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("discrepancies")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "discrepancies"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Documentation Discrepancies ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab("answers")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "answers"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          The 10 Submission Answers
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "analytics"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          City Analytics Summary
        </button>
      </div>

      {/* Tab 1: Documentation Discrepancies */}
      {activeTab === "discrepancies" && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
            {["all", "auth", "pagination", "completeness", "filters", "missing_endpoint", "units", "timestamps", "duplicates", "data_quality", "fraud", "consistency"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFindings.map((f, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {f.endpoint}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {f.category}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 text-red-950">
                      <span className="font-bold text-red-800 block text-[10px] uppercase tracking-wider mb-0.5">Documented Claim:</span>
                      {f.documented}
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                      <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider mb-0.5">Actual Runtime Reality:</span>
                      {f.actual}
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-700">Developer Impact: </span>
                      {f.impact}
                    </div>
                  </div>
                </div>

                {f.evidence && f.evidence.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Sample Evidence IDs: </span>
                    <span className="font-mono text-slate-700">{f.evidence.slice(0, 6).join(", ")}</span>
                    {f.evidence.length > 6 && <span className="text-slate-400"> +{f.evidence.length - 6} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: The 10 Answers */}
      {activeTab === "answers" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/60 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Final Evaluated Answers for Chennai</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Anchored to fixed reference timestamp <code className="font-mono font-semibold text-slate-800">2026-09-10T00:00:00+05:30 (IST)</code>
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {tenAnswers.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                      {item.id}
                    </span>
                    <span className="text-xs font-mono text-emerald-700 font-semibold">
                      {item.key}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">{item.q}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.note}</p>
                </div>
                <div className="md:text-right flex-shrink-0">
                  <div className="text-lg font-black text-slate-900 font-mono">
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
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Note:</strong> The documented endpoint <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">/v1/analytics/summary</code> returns 404 Not Found. These aggregates are precomputed directly across the complete 4,100 listings dataset.
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</div>
              <div className="text-2xl font-black text-slate-900 mt-1">4,100</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">3,233 Active (78.8%)</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Median Price</div>
              <div className="text-2xl font-black text-slate-900 mt-1">₹1.03 Cr</div>
              <div className="text-[11px] text-slate-500 mt-1">Avg: ₹1.14 Cr</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Median Price/Sqft</div>
              <div className="text-2xl font-black text-slate-900 mt-1">₹9,844</div>
              <div className="text-[11px] text-slate-500 mt-1">Chennai Residential Avg</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rentals</div>
              <div className="text-2xl font-black text-slate-900 mt-1">1,550</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-1">Velachery: 133 properties</div>
            </div>
          </div>

          {/* Locality Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Distribution by Locality (Chennai)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                <div key={row.loc} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{row.loc}</div>
                    <div className="text-slate-500 text-[11px]">{row.count} listings · {row.rate}</div>
                  </div>
                  <div className="font-black text-slate-800 text-sm">{row.median}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
