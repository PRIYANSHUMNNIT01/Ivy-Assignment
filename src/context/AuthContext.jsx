"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getStoredAuth,
  login as apiLogin,
  logout as apiLogout,
  getValidToken,
  fetchSavedListings,
  addSavedListing,
  removeSavedListing,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedLoading, setSavedLoading] = useState(false);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const auth = getStoredAuth();
    if (auth && auth.user) {
      setUser(auth.user);
    }
    setLoading(false);

    // Setup periodic token freshness check every 5 minutes
    const interval = setInterval(async () => {
      const token = await getValidToken();
      if (!token && user) {
        // Auto logout if tokens completely expired
        setUser(null);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch saved listings when user logs in
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    async function loadSaved() {
      setSavedLoading(true);
      try {
        const data = await fetchSavedListings();
        const ids = new Set((data.results || []).map((item) => item.listing_id));
        setSavedIds(ids);
      } catch (err) {
        console.warn("Could not load saved listings:", err);
      } finally {
        setSavedLoading(false);
      }
    }

    loadSaved();
  }, [user]);

  const handleLogin = async (email, password) => {
    const auth = await apiLogin(email, password);
    setUser(auth.user);
    return auth;
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setSavedIds(new Set());
  };

  const isSaved = (listingId) => savedIds.has(listingId);

  const toggleSave = async (listingId) => {
    if (!user) {
      alert("Please log in to save listings.");
      return false;
    }

    const alreadySaved = savedIds.has(listingId);
    // Optimistic UI update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (alreadySaved) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      if (alreadySaved) {
        await removeSavedListing(listingId);
      } else {
        await addSavedListing(listingId);
      }
      return !alreadySaved;
    } catch (err) {
      console.error("Failed to toggle save status:", err);
      // Revert optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
      return alreadySaved;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        savedIds,
        savedLoading,
        isSaved,
        toggleSave,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
