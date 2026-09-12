"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchProjects } from "../../services/api";
import {
  Building2,
  Filter,
  MapPin,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Maximize2
} from "lucide-react";

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
        offset: currentOffset,
        limit,
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

  useEffect(() => {
    setOffset(0);
    loadData(0);
  }, [locality, status]);

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

  const convertPrice = (val) => {
    if (val === undefined || val === null) return "N/A";
    if (val < 15) {
      // In Crores
      return `₹${val.toFixed(2)} Cr`;
    } else if (val < 1000) {
      // In Lakhs
      return `₹${val.toFixed(1)} L`;
    }
    return `₹${(val / 100000).toFixed(1)} L`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-800/60 backdrop-blur-md text-purple-200 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Builder Developments · Unit-Corrected Prices</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Developer Projects in Chennai
          </h1>
          <p className="text-purple-200 text-sm sm:text-base mt-2 leading-relaxed">
            Major residential communities, high-rises, and gated townships across Chennai. Corrected from raw API floats into standardized Crores and Lakhs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Locality
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Localities" : loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2 bg-slate-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 capitalize"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pagination Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div>
          Showing <span className="font-semibold text-slate-800">{projects.length}</span> projects
          (Offset {offset} to {offset + projects.length} of {totalReported}+ in catalog)
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
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No projects found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const rawAmenities = Array.isArray(p.amenities)
              ? p.amenities
              : typeof p.amenities === "string"
              ? JSON.parse(p.amenities || "[]")
              : [];

            return (
              <div
                key={p.project_id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/50">
                      {p.developer_name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {p.project_status}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                    {p.apartment_name}
                  </h2>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="capitalize font-semibold text-slate-700">{p.locality}</span>
                    <span>•</span>
                    <span className="text-slate-400">{p.total_units} Total Units</span>
                  </div>

                  {/* Price Range */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Price Range</span>
                      <div className="text-lg font-black text-slate-900">
                        {convertPrice(p.price_min)} – {convertPrice(p.price_max)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Inventory</span>
                      <div className="text-xs font-bold text-emerald-700">
                        {p.total_listings} active listings
                      </div>
                    </div>
                  </div>

                  {/* Area and Spec Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Unit Sizes</div>
                      <div className="font-semibold text-slate-800">
                        {p.min_area_sqft} – {p.max_area_sqft} sqft
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Towers</div>
                      <div className="font-semibold text-slate-800">{p.total_towers} Towers</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Floors</div>
                      <div className="font-semibold text-slate-800">Up to {p.total_floors} fl.</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {rawAmenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {rawAmenities.slice(0, 4).map((am) => (
                        <span
                          key={am}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize"
                        >
                          {am}
                        </span>
                      ))}
                      {rawAmenities.length > 4 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">
                          +{rawAmenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* RERA */}
                  {p.rera_number && (
                    <div className="mt-3 text-[11px] text-slate-400 truncate">
                      <span className="font-semibold text-slate-500">RERA:</span> {p.rera_number}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{p.project_id}</span>
                  <span className="text-slate-500 text-[11px]">Possession: {p.possession_date || "TBD"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
