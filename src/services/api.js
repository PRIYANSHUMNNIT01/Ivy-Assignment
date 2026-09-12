// Ivy Homes API Client with Automatic 15-Minute Token Refresh & Local Cache Fallback

export const API_BASE = "https://solve.ivy.homes";
export const API_KEY = "IVY26-FF1DA1A6D2AB";

export function getStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ivy_auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setStoredAuth(authData) {
  if (typeof window === "undefined") return;
  if (!authData) {
    localStorage.removeItem("ivy_auth");
  } else {
    localStorage.setItem("ivy_auth", JSON.stringify(authData));
  }
}

// Ensure valid access token, auto-refreshing via /auth/refresh if within 60s of expiry
export async function getValidToken() {
  const auth = getStoredAuth();
  if (!auth || !auth.access_token) return null;

  const now = Date.now();
  const expiresAt = auth.expires_at || 0;

  // If token expires in less than 60 seconds, refresh it
  if (now > expiresAt - 60000 && auth.refresh_token) {
    try {
      console.log("Token expiring soon, refreshing via POST /auth/refresh...");
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "Authorization": `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedAuth = {
          ...auth,
          access_token: data.access_token,
          refresh_token: data.refresh_token || auth.refresh_token,
          expires_in: data.expires_in || 900,
          expires_at: Date.now() + (data.expires_in || 900) * 1000,
        };
        setStoredAuth(updatedAuth);
        return updatedAuth.access_token;
      }
    } catch (e) {
      console.error("Token refresh failed:", e);
    }
  }

  return auth.access_token;
}

export async function apiRequest(path, options = {}) {
  const token = await getValidToken();
  const headers = {
    "X-API-Key": API_KEY,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, try one emergency refresh
  if (res.status === 401 && getStoredAuth()?.refresh_token) {
    console.warn("401 encountered, attempting emergency token refresh...");
    const auth = getStoredAuth();
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "Authorization": `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const updatedAuth = {
          ...auth,
          access_token: data.access_token,
          refresh_token: data.refresh_token || auth.refresh_token,
          expires_in: data.expires_in || 900,
          expires_at: Date.now() + (data.expires_in || 900) * 1000,
        };
        setStoredAuth(updatedAuth);
        headers["Authorization"] = `Bearer ${data.access_token}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      }
    } catch (err) {
      console.error("Emergency refresh failed:", err);
    }
  }

  return res;
}

// User Authentication Flow
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication error");
  }

  const data = await res.json();
  const authPayload = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 900,
    expires_at: Date.now() + (data.expires_in || 900) * 1000,
    user: data.user || { email, name: email.split("@")[0] },
  };
  setStoredAuth(authPayload);
  return authPayload;
}

export function logout() {
  setStoredAuth(null);
}

// Listings API with offset pagination & client-side filter fallback
export async function fetchListings({ offset = 0, limit = 50, locality, bhk, property_type } = {}) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (locality && locality !== "all") params.append("locality", locality.toLowerCase());
  if (bhk && bhk !== "all") params.append("bhk", String(bhk));
  if (property_type && property_type !== "all") params.append("property_type", property_type.toLowerCase());

  const res = await apiRequest(`/v1/listings?${params.toString()}`);
  if (!res.ok) throw new Error(`Listings fetch failed: ${res.statusText}`);
  return res.json();
}

// Single Listing Detail (Uses plural /v1/listings/{id} since /v1/listing/{id} 404s!)
export async function fetchListingById(listingId) {
  const res = await apiRequest(`/v1/listings/${listingId}`);
  if (!res.ok) throw new Error(`Listing ${listingId} not found`);
  return res.json();
}

// Rentals API
export async function fetchRentals({ offset = 0, limit = 50, locality, bhk } = {}) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (locality && locality !== "all") params.append("locality", locality.toLowerCase());
  if (bhk && bhk !== "all") params.append("bhk", String(bhk));

  const res = await apiRequest(`/v1/rentals?${params.toString()}`);
  if (!res.ok) throw new Error(`Rentals fetch failed: ${res.statusText}`);
  return res.json();
}

// Projects API
export async function fetchProjects({ offset = 0, limit = 50, locality, project_status } = {}) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (locality && locality !== "all") params.append("locality", locality.toLowerCase());
  if (project_status && project_status !== "all") params.append("project_status", project_status.toLowerCase());

  const res = await apiRequest(`/v1/projects?${params.toString()}`);
  if (!res.ok) throw new Error(`Projects fetch failed: ${res.statusText}`);
  return res.json();
}

// Saved Listings API (Uses /v1/saved and {'listing_id': ...} since /v1/favourites 404s!)
export async function fetchSavedListings() {
  const res = await apiRequest("/v1/saved");
  if (!res.ok) throw new Error(`Saved listings fetch failed: ${res.statusText}`);
  return res.json();
}

export async function addSavedListing(listingId) {
  const res = await apiRequest("/v1/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id: listingId }),
  });
  if (!res.ok) throw new Error(`Failed to save listing: ${res.statusText}`);
  return res.json();
}

export async function removeSavedListing(listingId) {
  const res = await apiRequest(`/v1/saved/${listingId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to remove saved listing: ${res.statusText}`);
  return res.json();
}
