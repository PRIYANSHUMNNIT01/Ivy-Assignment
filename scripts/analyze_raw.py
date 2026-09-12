import json
import os
from collections import Counter, defaultdict

RAW_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"

def load_json(name):
    path = os.path.join(RAW_DIR, f"{name}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def analyze():
    print("========================================")
    print("Analyzing Raw Data from Ivy Homes API")
    print("========================================")

    # 1. LISTINGS
    listings_data = load_json("listings")
    raw_listings = listings_data["results"]
    print(f"\n1. LISTINGS:")
    print(f"Server reported total: {listings_data.get('total')}")
    print(f"Total downloaded records: {len(raw_listings)}")
    
    # Check duplicate listing_ids
    listing_ids = [l["listing_id"] for l in raw_listings]
    id_counts = Counter(listing_ids)
    dup_ids = {k: v for k, v in id_counts.items() if v > 1}
    print(f"Distinct listing_ids: {len(id_counts)}")
    print(f"Duplicate listing_ids count: {len(dup_ids)}")
    print(f"Sample duplicate listing_ids: {list(dup_ids.items())[:10]}")

    # Inspect the records with duplicate listing_ids
    if dup_ids:
        sample_dup_id = list(dup_ids.keys())[0]
        sample_dup_records = [l for l in raw_listings if l["listing_id"] == sample_dup_id]
        print(f"\nSample duplicate listing_id '{sample_dup_id}' records:")
        for r in sample_dup_records:
            print(f"  apartment: {r.get('apartment_name')}, price: {r.get('price')}, area: {r.get('carpet_area')}, posted_at: {r.get('posted_at')}, is_live: {r.get('is_live')}")

    # 2. RENTALS
    rentals_data = load_json("rentals")
    raw_rentals = rentals_data["results"]
    print(f"\n2. RENTALS:")
    print(f"Server reported total: {rentals_data.get('total')}")
    print(f"Total downloaded records: {len(raw_rentals)}")
    rental_ids = [r["listing_id"] for r in raw_rentals]
    rental_id_counts = Counter(rental_ids)
    rental_dup_ids = {k: v for k, v in rental_id_counts.items() if v > 1}
    print(f"Distinct rental listing_ids: {len(rental_id_counts)}")
    print(f"Duplicate rental listing_ids count: {len(rental_dup_ids)}")
    if rental_dup_ids:
        print(f"Sample duplicate rental listing_ids: {list(rental_dup_ids.items())[:10]}")

    # 3. PROJECTS
    projects_data = load_json("projects")
    raw_projects = projects_data["results"]
    print(f"\n3. PROJECTS:")
    print(f"Server reported total: {projects_data.get('total')}")
    print(f"Total downloaded records: {len(raw_projects)}")
    proj_ids = [p["project_id"] for p in raw_projects]
    proj_id_counts = Counter(proj_ids)
    proj_dup_ids = {k: v for k, v in proj_id_counts.items() if v > 1}
    print(f"Distinct project_ids: {len(proj_id_counts)}")
    print(f"Duplicate project_ids count: {len(proj_dup_ids)}")
    if proj_dup_ids:
        print(f"Sample duplicate project_ids: {list(proj_dup_ids.items())[:10]}")

if __name__ == "__main__":
    analyze()
