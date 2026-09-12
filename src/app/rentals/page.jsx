"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchRentals } from "../../services/api";
import {
  Key,
  Filter,
  Building,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  DollarSign
} from "lucide-react";

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
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
        offset: currentOffset,
        limit,
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

  useEffect(() => {
    setOffset(0);
    loadData(0);
  }, [locality, bhk]);

  const handleNext = () => {
    if (hasMore) {
      const next = offset + limit;
      setOffset(next);
      loadData(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (offset >= limit) {
      const prev = offset - limit;
      setOffset(prev);
      loadData(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredRentals = useMemo(() => {
    let list = [...rentals];
    if (furnishing !== "all") {
      list = list.filter((r) => (r.furnishing || "").toLowerCase() === furnishing.toLowerCase());
    }
    if (maxRent) {
      const max = parseFloat(maxRent);
      if (!isNaN(max)) {
        list = list.filter((r) => r.price <= max);
      }
    }
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "area_desc") {
      list.sort((a, b) => b.carpet_area - a.carpet_area);
    }
    return list;
  }, [rentals, furnishing, maxRent, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-800/60 backdrop-blur-md text-blue-200 text-xs font-semibold mb-3">
            <Key className="w-3.5 h-3.5" />
            <span>Rental Homes & Apartments · Chennai Scoped</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Residential Rentals in Chennai
          </h1>
          <p className="text-blue-200 text-sm sm:text-base mt-2 leading-relaxed">
            Browse verified rental properties with transparent monthly rents, deposit requirements, and maintenance fees. Assigned locality focus: <span className="text-white font-bold underline decoration-blue-400">Velachery</span>.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Locality
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Localities" : loc.toUpperCase() + (loc === "velachery" ? " ★ (Assigned)" : "")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bedrooms (BHK)
            </label>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Furnishing <span className="text-blue-600 text-[10px]">(Client)</span>
            </label>
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Max Monthly Rent (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 35000"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="default">Default Order</option>
              <option value="price_asc">Rent: Low to High</option>
              <option value="price_desc">Rent: High to Low</option>
              <option value="area_desc">Area: Largest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredRentals.length}</span> rentals
          (Offset {offset} to {offset + rentals.length} of {totalReported}+ in catalog)
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
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
            onClick={handleNext}
            disabled={!hasMore || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No rentals found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((r) => (
            <div
              key={r.listing_id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/50">
                    {r.bedroom} BHK {r.property_type}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {r.furnishing}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                  {r.apartment_name}
                </h2>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="capitalize font-semibold text-slate-700">{r.locality}</span>
                  <span>•</span>
                  <span className="text-slate-400">Portal: {r.website}</span>
                </div>

                {/* Price and Deposit */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-xl font-black text-slate-900">
                      ₹{r.price.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-slate-500">/ month</span>
                    </div>
                    {r.maintenance > 0 && (
                      <div className="text-[11px] text-slate-500">
                        + ₹{r.maintenance.toLocaleString("en-IN")} maintenance
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Deposit</span>
                    <div className="text-xs font-bold text-slate-800">
                      ₹{(r.deposit || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center space-x-1">
                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.bedroom} Beds</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.bathroom} Baths</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.carpet_area} sqft</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {r.description || "No description provided."}
                </p>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{r.listing_id}</span>
                <span className="font-semibold text-slate-700">Contact: {r.posted_by_contact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
