"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { fetchSavedListings, removeSavedListing } from "../../services/api";
import {
  Bookmark,
  Building,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Trash2,
  LogIn,
  ArrowRight
} from "lucide-react";

export default function SavedPage() {
  const { user, toggleSave } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
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

  useEffect(() => {
    loadSaved();
  }, [user]);

  const handleRemove = async (listingId) => {
    await toggleSave(listingId);
    setSavedItems((prev) => prev.filter((item) => item.listing_id !== listingId));
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your Saved Properties</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Saved listings are synced directly to your account using the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/v1/saved</code> endpoint and persist across browser reloads.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Go to Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Properties</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">GET /v1/saved</code> for user {user.email}
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
          {savedItems.length} {savedItems.length === 1 ? "Listing" : "Listings"} Saved
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No saved properties yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse listings and click the bookmark icon to save properties to your account.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-4"
          >
            <span>Browse Listings Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((l) => (
            <div
              key={l.listing_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                    {l.property_type}
                  </span>
                  <button
                    onClick={() => handleRemove(l.listing_id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from Saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link href={`/listings/${l.listing_id}`}>
                  <h2 className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                    {l.apartment_name}
                  </h2>
                </Link>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="capitalize font-semibold text-slate-700">{l.locality}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div className="text-lg font-black text-slate-900">
                    ₹{l.price ? l.price.toLocaleString("en-IN") : "N/A"}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {l.bedroom} BHK · {l.carpet_area} sqft
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{l.listing_id}</span>
                <Link
                  href={`/listings/${l.listing_id}`}
                  className="font-semibold text-emerald-700 hover:text-emerald-800"
                >
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
