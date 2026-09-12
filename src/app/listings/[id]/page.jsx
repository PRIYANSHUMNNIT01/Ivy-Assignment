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
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-28" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Property Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || "The requested listing does not exist."}</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Listings</span>
        </Link>
      </div>
    );
  }

  const isSqMeters = listing.website === "magichomes" && listing.carpet_area < 250 && listing.property_type !== "plot";
  const effectiveSqft = isSqMeters ? Math.round(listing.carpet_area * 10.7639) : listing.carpet_area;
  const pricePerSqft = effectiveSqft > 0 ? Math.round(listing.price / effectiveSqft) : 0;

  const formatPrice = (p) => {
    if (p < 0) return `-₹${Math.abs(p).toLocaleString("en-IN")}`;
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Back Button & Save Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings Catalog</span>
        </Link>
        <button
          onClick={() => toggleSave(listing.listing_id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            isSaved(listing.listing_id)
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved(listing.listing_id) ? "fill-red-600 text-red-600" : ""}`} />
          <span>{isSaved(listing.listing_id) ? "Saved in Favourites" : "Save Property"}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                {listing.property_type}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Portal: {listing.website}
              </span>
              {listing.is_verified && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 flex items-center space-x-1 border border-blue-200/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Listing</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {listing.apartment_name}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="capitalize font-semibold text-slate-700">{listing.locality}</span>
              <span>•</span>
              <span>Chennai, Tamil Nadu</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 md:text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatPrice(listing.price)}
            </div>
            {pricePerSqft > 0 && listing.price > 0 && (
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                ₹{pricePerSqft.toLocaleString("en-IN")} / sqft (effective)
              </div>
            )}
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {listing.is_live ? "● Active On Market" : "○ Inactive / Archived"}
            </div>
          </div>
        </div>

        {/* Metric Alert if applicable */}
        {isSqMeters && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Metric Dimension Normalization Applied</div>
              <p className="mt-0.5 text-amber-800">
                This listing from {listing.website} was scraped in square meters ({listing.carpet_area} m² carpet, {listing.super_built_up_area} m² super built-up). Our platform has automatically normalized it to {effectiveSqft} sqft to ensure accurate pricing benchmarks.
              </p>
            </div>
          </div>
        )}

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <BedDouble className="w-4 h-4" />
              <span>Bedrooms</span>
            </div>
            <div className="text-base font-bold text-slate-800">{listing.bedroom} BHK</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Bath className="w-4 h-4" />
              <span>Bathrooms</span>
            </div>
            <div className="text-base font-bold text-slate-800">{listing.bathroom} Baths</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Maximize2 className="w-4 h-4" />
              <span>Carpet Area</span>
            </div>
            <div className="text-base font-bold text-slate-800">
              {effectiveSqft} sqft
              {isSqMeters && <span className="text-xs text-slate-400 font-normal ml-1">({listing.carpet_area} m²)</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>Floor Level</span>
            </div>
            <div className="text-base font-bold text-slate-800">
              Floor {listing.floor} of {listing.total_floors}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Compass className="w-4 h-4" />
              <span>Facing</span>
            </div>
            <div className="text-base font-bold text-slate-800 capitalize">
              {listing.facing_direction || "Not specified"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Car className="w-4 h-4" />
              <span>Parking</span>
            </div>
            <div className="text-base font-bold text-slate-800">
              {listing.covered_parking ? `${listing.covered_parking} Covered` : "None"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Calendar className="w-4 h-4" />
              <span>Posted Date</span>
            </div>
            <div className="text-base font-bold text-slate-800">
              {(listing.posted_at || "").slice(0, 10)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Furnishing</span>
            </div>
            <div className="text-base font-bold text-slate-800 capitalize">
              {listing.furnishing || "Unfurnished"}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Seller Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            {listing.description || "No description provided."}
          </p>
        </div>

        {/* Seller / Agent Contact Card */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>{listing.posted_by_name || "Authorized Seller"}</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">
                  {listing.posted_by}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {listing.posted_by_contact || "Direct Contact"}
              </div>
            </div>
          </div>
          <a
            href={`tel:${listing.posted_by_contact}`}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Call Seller</span>
          </a>
        </div>
      </div>

      {/* Comparable / Similar Listings Section */}
      {similarListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Similar Properties in {listing.locality}</h2>
              <p className="text-xs text-slate-500">Comparable {listing.bedroom} BHK properties in the same neighborhood</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarListings.map((sim) => (
              <Link
                key={sim.listing_id}
                href={`/listings/${sim.listing_id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all space-y-2 block group"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {sim.bedroom} BHK · {sim.property_type}
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                  {sim.apartment_name}
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {formatPrice(sim.price)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {sim.carpet_area} sqft · {sim.locality}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
