import json
import os
import subprocess
import time
import sqlite3

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FF1DA1A6D2AB"
DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data"
RAW_DIR = os.path.join(DATA_DIR, "raw")
os.makedirs(RAW_DIR, exist_ok=True)

class TrueDataFetcher:
    def __init__(self, api_key):
        self.api_key = api_key
        self.access_token = None
        self.expires_at = 0

    def login(self):
        cmd = [
            "curl", "-s", "-X", "POST", f"{BASE_URL}/auth/login",
            "-H", f"X-API-Key: {self.api_key}",
            "-H", "Content-Type: application/json",
            "-d", '{"email":"demo1@ivy.homes","password":"cfd53b6dd0"}'
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(res.stdout)
        self.access_token = data["access_token"]
        self.expires_at = time.time() + data.get("expires_in", 900) - 30
        print("Logged in successfully.")

    def ensure_token(self):
        if not self.access_token or time.time() > self.expires_at:
            self.login()

    def fetch_full(self, name, endpoint):
        self.ensure_token()
        print(f"\nFetching complete collection for {name} ({endpoint}) until has_more == False...")
        offset = 0
        limit = 50
        all_records = []
        reported_total = None

        while True:
            cmd = [
                "curl", "-s", "-X", "GET", f"{BASE_URL}{endpoint}?offset={offset}&limit={limit}",
                "-H", f"X-API-Key: {self.api_key}",
                "-H", f"Authorization: Bearer {self.access_token}"
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            try:
                data = json.loads(res.stdout)
            except Exception:
                self.login()
                continue
            
            if "detail" in data:
                self.login()
                continue
                
            reported_total = data.get("total")
            results = data.get("results", [])
            has_more = data.get("has_more", False)
            
            all_records.extend(results)
            print(f"Offset {offset:4d}..{offset+len(results)-1:4d} | Fetched {len(results):2d} | Accumulated {len(all_records):4d} | has_more={has_more}")
            
            if not results or not has_more:
                break
                
            offset += len(results)
            time.sleep(0.04)

        out_path = os.path.join(RAW_DIR, f"{name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({
                "reported_total": reported_total,
                "retrievable_total": len(all_records),
                "count": len(all_records),
                "results": all_records
            }, f, indent=2)
        print(f"--> Saved {len(all_records)} records to {out_path} (reported total was {reported_total})")
        return all_records

def rebuild_sqlite(listings, rentals, projects):
    db_path = os.path.join(DATA_DIR, "chennai.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("""
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

    cur.execute("""
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

    cur.execute("""
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
        cur.execute("""
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
        cur.execute("""
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
        cur.execute("""
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
    print(f"\nSuccessfully stored TRUE full dataset in SQLite: {db_path}")

def main():
    fetcher = TrueDataFetcher(API_KEY)
    projects = fetcher.fetch_full("projects", "/v1/projects")
    rentals = fetcher.fetch_full("rentals", "/v1/rentals")
    listings = fetcher.fetch_full("listings", "/v1/listings")
    rebuild_sqlite(listings, rentals, projects)
    print("\nALL TRUE DATASETS FULLY CACHED!")

if __name__ == "__main__":
    main()
