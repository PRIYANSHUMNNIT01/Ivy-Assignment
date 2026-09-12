import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
import ssl
import sqlite3

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FF1DA1A6D2AB"
DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data"
RAW_DIR = os.path.join(DATA_DIR, "raw")
os.makedirs(RAW_DIR, exist_ok=True)

ctx = ssl.create_default_context()

class IvyClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.access_token = None
        self.refresh_token = None
        self.expires_at = 0

    def login(self, email="demo1@ivy.homes", password="cfd53b6dd0"):
        url = f"{BASE_URL}/auth/login"
        req = urllib.request.Request(
            url,
            data=json.dumps({"email": email, "password": password}).encode("utf-8"),
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "X-API-Key": self.api_key,
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.access_token = data["access_token"]
            self.refresh_token = data.get("refresh_token")
            self.expires_at = time.time() + data.get("expires_in", 900) - 30
            print(f"Logged in as {email}. Access token valid for {data.get('expires_in')}s.")
            return data

    def refresh(self):
        url = f"{BASE_URL}/auth/refresh"
        req = urllib.request.Request(
            url,
            data=json.dumps({"refresh_token": self.refresh_token}).encode("utf-8"),
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "X-API-Key": self.api_key,
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.access_token = data["access_token"]
            self.refresh_token = data.get("refresh_token", self.refresh_token)
            self.expires_at = time.time() + data.get("expires_in", 900) - 30
            print("Token successfully refreshed.")

    def ensure_token(self):
        if not self.access_token or time.time() > self.expires_at:
            if self.refresh_token:
                try:
                    self.refresh()
                except Exception:
                    self.login()
            else:
                self.login()

    def get(self, path, params=None, max_retries=5):
        self.ensure_token()
        url = f"{BASE_URL}{path}"
        if params:
            query = urllib.parse.urlencode(params)
            url = f"{url}?{query}"
        
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "X-API-Key": self.api_key,
                "Authorization": f"Bearer {self.access_token}",
                "Connection": "close"
            },
            method="GET"
        )

        for attempt in range(1, max_retries + 1):
            try:
                with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
                    return resp.status, json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                err = e.read().decode("utf-8")
                if e.code == 401 and attempt < max_retries:
                    print(f"401 Unauthorized, re-logging in (attempt {attempt})...")
                    self.login()
                    req.headers["Authorization"] = f"Bearer {self.access_token}"
                    time.sleep(1)
                    continue
                try:
                    return e.code, json.loads(err)
                except Exception:
                    return e.code, err
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                print(f"Network error on {url} (attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    raise e
                time.sleep(1.5 * attempt)

    def fetch_all(self, endpoint_name, path):
        out_file = os.path.join(RAW_DIR, f"{endpoint_name}.json")
        checkpoint_file = os.path.join(RAW_DIR, f"{endpoint_name}_checkpoint.json")
        
        all_results = []
        offset = 0
        total_reported = None

        # Check if already completely downloaded
        if os.path.exists(out_file):
            try:
                with open(out_file, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    if saved.get("count") == saved.get("total") and saved.get("count", 0) > 0:
                        print(f"{endpoint_name} already fully downloaded ({saved.get('count')} records). Skipping fetch.")
                        return saved["results"]
            except Exception:
                pass

        # Check for checkpoint
        if os.path.exists(checkpoint_file):
            try:
                with open(checkpoint_file, "r", encoding="utf-8") as f:
                    chk = json.load(f)
                    all_results = chk.get("results", [])
                    total_reported = chk.get("total")
                    offset = len(all_results)
                    print(f"Resuming {endpoint_name} from offset {offset} ({len(all_results)} / {total_reported} records loaded)")
            except Exception:
                all_results = []
                offset = 0

        print(f"\n--- Fetching {endpoint_name} from {path} (starting offset={offset}) ---")
        limit = 50

        while True:
            status, data = self.get(path, {"offset": offset, "limit": limit})
            if status != 200:
                print(f"Error fetching offset {offset}: Status {status}, {data}")
                break
            
            total_reported = data.get("total")
            results = data.get("results", [])
            has_more = data.get("has_more", False)
            
            if not results:
                print(f"Offset {offset} returned 0 results. Done.")
                break
            
            all_results.extend(results)
            print(f"Offset {offset:4d}: got {len(results)} records (accumulated: {len(all_results)} / {total_reported})")
            
            # Save checkpoint every 500 records
            if len(all_results) % 250 == 0:
                with open(checkpoint_file, "w", encoding="utf-8") as f:
                    json.dump({"total": total_reported, "results": all_results}, f)

            if not has_more or len(all_results) >= total_reported:
                break
            
            offset += len(results)
            time.sleep(0.05)

        print(f"Finished {endpoint_name}: total downloaded = {len(all_results)}, server total = {total_reported}")
        
        # Save final raw JSON
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({"total": total_reported, "count": len(all_results), "results": all_results}, f, indent=2)
        print(f"Saved to {out_file}")
        
        # Remove checkpoint
        if os.path.exists(checkpoint_file):
            os.remove(checkpoint_file)
            
        return all_results

def build_sqlite_db(listings, rentals, projects):
    db_path = os.path.join(DATA_DIR, "chennai.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id TEXT,
        listing_url TEXT,
        website TEXT,
        city_id INTEGER,
        apartment_name TEXT,
        locality TEXT,
        property_type TEXT,
        bedroom INTEGER,
        bathroom INTEGER,
        balcony INTEGER,
        floor INTEGER,
        total_floors INTEGER,
        furnishing TEXT,
        facing_direction TEXT,
        covered_parking INTEGER,
        price REAL,
        carpet_area REAL,
        super_built_up_area REAL,
        latitude REAL,
        longitude REAL,
        posted_by TEXT,
        posted_by_name TEXT,
        posted_by_contact TEXT,
        project_id TEXT,
        is_verified INTEGER,
        description TEXT,
        posted_at TEXT,
        is_live INTEGER,
        raw_json TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE rentals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id TEXT,
        listing_url TEXT,
        website TEXT,
        city_id INTEGER,
        title TEXT,
        apartment_name TEXT,
        locality TEXT,
        property_type TEXT,
        bedroom INTEGER,
        bathroom INTEGER,
        floor INTEGER,
        total_floors INTEGER,
        furnishing TEXT,
        facing_direction TEXT,
        price REAL,
        deposit REAL,
        maintenance REAL,
        carpet_area REAL,
        super_builtup_area REAL,
        latitude REAL,
        longitude REAL,
        posted_by TEXT,
        posted_by_name TEXT,
        posted_by_contact TEXT,
        description TEXT,
        posted_at TEXT,
        is_live INTEGER,
        raw_json TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT,
        project_url TEXT,
        city_id INTEGER,
        apartment_name TEXT,
        developer_name TEXT,
        locality TEXT,
        project_status TEXT,
        total_units INTEGER,
        total_towers INTEGER,
        total_floors INTEGER,
        launch_date TEXT,
        possession_date TEXT,
        rera_number TEXT,
        min_area_sqft REAL,
        max_area_sqft REAL,
        amenities TEXT,
        latitude REAL,
        longitude REAL,
        total_listings INTEGER,
        price_min REAL,
        price_max REAL,
        raw_json TEXT
    )
    """)

    for l in listings:
        cursor.execute("""
        INSERT INTO listings (
            listing_id, listing_url, website, city_id, apartment_name, locality, property_type,
            bedroom, bathroom, balcony, floor, total_floors, furnishing, facing_direction,
            covered_parking, price, carpet_area, super_built_up_area, latitude, longitude,
            posted_by, posted_by_name, posted_by_contact, project_id, is_verified, description,
            posted_at, is_live, raw_json
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            l.get("listing_id"), l.get("listing_url"), l.get("website"), l.get("city_id"),
            l.get("apartment_name"), l.get("locality"), l.get("property_type"),
            l.get("bedroom"), l.get("bathroom"), l.get("balcony"), l.get("floor"), l.get("total_floors"),
            l.get("furnishing"), l.get("facing_direction"), l.get("covered_parking"),
            l.get("price"), l.get("carpet_area"), l.get("super_built_up_area"),
            l.get("latitude"), l.get("longitude"), l.get("posted_by"), l.get("posted_by_name"),
            l.get("posted_by_contact"), l.get("project_id"), 1 if l.get("is_verified") else 0,
            l.get("description"), l.get("posted_at"), 1 if l.get("is_live") else 0,
            json.dumps(l)
        ))

    for r in rentals:
        cursor.execute("""
        INSERT INTO rentals (
            listing_id, listing_url, website, city_id, title, apartment_name, locality,
            property_type, bedroom, bathroom, floor, total_floors, furnishing, facing_direction,
            price, deposit, maintenance, carpet_area, super_builtup_area, latitude, longitude,
            posted_by, posted_by_name, posted_by_contact, description, posted_at, is_live, raw_json
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            r.get("listing_id"), r.get("listing_url"), r.get("website"), r.get("city_id"),
            r.get("title"), r.get("apartment_name"), r.get("locality"),
            r.get("property_type"), r.get("bedroom"), r.get("bathroom"), r.get("floor"),
            r.get("total_floors"), r.get("furnishing"), r.get("facing_direction"),
            r.get("price"), r.get("deposit"), r.get("maintenance"),
            r.get("carpet_area"), r.get("super_builtup_area"),
            r.get("latitude"), r.get("longitude"), r.get("posted_by"),
            r.get("posted_by_name"), r.get("posted_by_contact"), r.get("description"),
            r.get("posted_at"), 1 if r.get("is_live") else 0, json.dumps(r)
        ))

    for p in projects:
        cursor.execute("""
        INSERT INTO projects (
            project_id, project_url, city_id, apartment_name, developer_name, locality,
            project_status, total_units, total_towers, total_floors, launch_date,
            possession_date, rera_number, min_area_sqft, max_area_sqft, amenities,
            latitude, longitude, total_listings, price_min, price_max, raw_json
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            p.get("project_id"), p.get("project_url"), p.get("city_id"),
            p.get("apartment_name"), p.get("developer_name"), p.get("locality"),
            p.get("project_status"), p.get("total_units"), p.get("total_towers"),
            p.get("total_floors"), p.get("launch_date"), p.get("possession_date"),
            p.get("rera_number"), p.get("min_area_sqft"), p.get("max_area_sqft"),
            json.dumps(p.get("amenities", [])), p.get("latitude"), p.get("longitude"),
            p.get("total_listings"), p.get("price_min"), p.get("price_max"),
            json.dumps(p)
        ))

    conn.commit()
    conn.close()
    print(f"\nSuccessfully populated SQLite database at {db_path}!")

def main():
    client = IvyClient(API_KEY)
    client.login()
    
    listings = client.fetch_all("listings", "/v1/listings")
    rentals = client.fetch_all("rentals", "/v1/rentals")
    projects = client.fetch_all("projects", "/v1/projects")
    
    build_sqlite_db(listings, rentals, projects)
    print("\nAll data ingestion and SQLite persistence completed successfully!")

if __name__ == "__main__":
    main()
