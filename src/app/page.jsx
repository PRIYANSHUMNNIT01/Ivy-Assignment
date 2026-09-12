"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchListings } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Filter,
  Bookmark,
  Building,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  ArrowUpDown,
  Sparkles
} from "lucide-react";

// Corrupt & Fake IDs for Data Quality Badges
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

export default function ListingsPage() {
  const { isSaved, toggleSave } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(false);
  const [totalReported, setTotalReported] = useState(0);

  // Filter States
  const [locality, setLocality] = useState("all");
  const [bhk, setBhk] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [furnishing, setFurnishing] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [hideCorrupt, setHideCorrupt] = useState(false);

  // Localities list for Chennai
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
        offset: currentOffset,
        limit,
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

  useEffect(() => {
    setOffset(0);
    loadData(0);
  }, [locality, bhk, propertyType]);

  const handleNextPage = () => {
    if (hasMore) {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
      loadData(nextOffset);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (offset >= limit) {
      const prevOffset = offset - limit;
      setOffset(prevOffset);
      loadData(prevOffset);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Client-side filtering for parameters quietly ignored by server (min_price, max_price, furnishing)
  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (furnishing !== "all") {
      result = result.filter(
        (l) => (l.furnishing || "").toLowerCase() === furnishing.toLowerCase()
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((l) => l.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((l) => l.price <= max);
      }
    }

    if (hideCorrupt) {
      result = result.filter((l) => !CORRUPT_IDS.has(l.listing_id) && !FAKE_IDS.has(l.listing_id));
    }

    // Client-side sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "area_desc") {
      result.sort((a, b) => b.carpet_area - a.carpet_area);
    } else if (sortBy === "newest") {
      result.sort((a, b) => (b.posted_at || "").localeCompare(a.posted_at || ""));
    }

    return result;
  }, [listings, furnishing, minPrice, maxPrice, hideCorrupt, sortBy]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    if (price < 0) return `-₹${Math.abs(price).toLocaleString("en-IN")}`;
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chennai Scoped · Live API with Client Filter Redundancy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Property Listings in Chennai
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed">
            Explore active residential sales across 11 key localities. Real-time unit conversions for sq meters and audit overlays for corrupt and honeypot records.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Building className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Search & Filter Engine</span>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={hideCorrupt}
              onChange={(e) => setHideCorrupt(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Filter Out Corrupt & Fake Listings</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Locality */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Locality
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Localities" : loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* BHK */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bedrooms (BHK)
            </label>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5 BHK</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {propertyTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {pt === "all" ? "All Types" : pt.charAt(0).toUpperCase() + pt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Furnishing (Client filtered) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Furnishing <span className="text-emerald-600 text-[10px]">(Client)</span>
            </label>
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {furnishingTypes.map((f) => (
                <option key={f} value={f}>
                  {f === "all" ? "All Furnishing" : f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Max Price (₹) <span className="text-emerald-600 text-[10px]">(Client)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 10000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="default">Default Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Carpet Area: Largest</option>
              <option value="newest">Newest Posted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header & Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredListings.length}</span>{" "}
          listings on current page (Offset {offset} to {offset + listings.length} of {totalReported}+ in catalog)
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={offset === 0 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="font-semibold text-slate-700 px-1">
            Page {Math.floor(offset / limit) + 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1">Try relaxing your price or furnishing filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((l) => {
            const isCorrupt = CORRUPT_IDS.has(l.listing_id);
            const isFake = FAKE_IDS.has(l.listing_id);
            const isSqMeters = l.website === "magichomes" && l.carpet_area < 250 && l.property_type !== "plot";
            const effectiveSqft = isSqMeters ? Math.round(l.carpet_area * 10.7639) : l.carpet_area;
            const pricePerSqft = effectiveSqft > 0 ? Math.round(l.price / effectiveSqft) : 0;

            return (
              <div
                key={l.listing_id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {l.property_type}
                      </span>
                      {l.is_live ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleSave(l.listing_id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isSaved(l.listing_id)
                          ? "text-red-500 bg-red-50"
                          : "text-slate-400 hover:text-red-500 hover:bg-slate-50"
                      }`}
                      title={isSaved(l.listing_id) ? "Saved" : "Save Listing"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved(l.listing_id) ? "fill-red-500" : ""}`} />
                    </button>
                  </div>

                  {/* Title & Locality */}
                  <Link href={`/listings/${l.listing_id}`}>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {l.apartment_name}
                    </h2>
                  </Link>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="capitalize font-medium">{l.locality}</span>
                    <span>•</span>
                    <span className="text-slate-400">Portal: {l.website}</span>
                  </div>

                  {/* Price Row */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {formatPrice(l.price)}
                      </div>
                      {pricePerSqft > 0 && l.price > 0 && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          ₹{pricePerSqft.toLocaleString("en-IN")}/sqft
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">
                        {l.bedroom} BHK
                      </span>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {l.furnishing || "Unfurnished"}
                      </div>
                    </div>
                  </div>

                  {/* Specs Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 p-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center space-x-1">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      <span>{l.bedroom} Beds</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <span>{l.bathroom} Baths</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      <span title={isSqMeters ? `${l.carpet_area} sq meters` : undefined}>
                        {effectiveSqft} sqft
                      </span>
                    </div>
                  </div>

                  {/* Data Quality & Unit Warnings */}
                  {isSqMeters && (
                    <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Magichomes metric unit: {l.carpet_area} m² converted to {effectiveSqft} sqft</span>
                    </div>
                  )}

                  {isCorrupt && (
                    <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-200/60">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Corrupt Record: Physically impossible values</span>
                    </div>
                  )}

                  {isFake && (
                    <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-purple-700 bg-purple-50 p-1.5 rounded-lg border border-purple-200/60">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Honeypot Listing: Rental price listed as sale</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    ID: {l.listing_id}
                  </span>
                  <Link
                    href={`/listings/${l.listing_id}`}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
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
