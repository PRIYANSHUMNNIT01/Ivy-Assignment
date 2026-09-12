import json
import os
import re
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"

def load_json(name):
    with open(os.path.join(DATA_DIR, f"{name}.json"), "r", encoding="utf-8") as f:
        return json.load(f)

listings_raw = load_json("listings")
rentals_raw = load_json("rentals")
projects_raw = load_json("projects")

listings = listings_raw["results"]
rentals = rentals_raw["results"]
projects = projects_raw["results"]

print("==================================================")
print(f"Loaded {len(listings)} listings, {len(rentals)} rentals, {len(projects)} projects.")
print("==================================================")

# Q1: total_listing_records
print("\n--- Q1: total_listing_records ---")
print(f"Server total: {listings_raw.get('total')}")
print(f"Total retrievable listing records: {len(listings)}")

# Check duplicate listing_ids
listing_ids = [l["listing_id"] for l in listings]
id_counts = Counter(listing_ids)
dup_ids = {k: v for k, v in id_counts.items() if v > 1}
print(f"Distinct listing_ids in listings: {len(id_counts)}")
print(f"Number of duplicate listing_ids: {len(dup_ids)}")

# Q3: active_listings
print("\n--- Q3: active_listings ---")
live_count = sum(1 for l in listings if l.get("is_live") is True)
false_count = sum(1 for l in listings if l.get("is_live") is False)
none_count = sum(1 for l in listings if l.get("is_live") is None)
print(f"is_live True: {live_count}")
print(f"is_live False: {false_count}")
print(f"is_live None: {none_count}")

# Q4: corrupt_listing_ids
print("\n--- Q4: corrupt_listing_ids (Physically impossible) ---")
corrupt_records = []

for l in listings:
    lid = l["listing_id"]
    reasons = []
    
    # 1. Price
    price = l.get("price")
    if price is None or price <= 0:
        reasons.append(f"Invalid price: {price}")
        
    # 2. Areas
    carpet = l.get("carpet_area")
    super_built = l.get("super_built_up_area")
    if carpet is None or carpet <= 0:
        reasons.append(f"Invalid carpet_area: {carpet}")
    if super_built is None or super_built <= 0:
        reasons.append(f"Invalid super_built_up_area: {super_built}")
    if carpet and super_built and carpet > super_built:
        reasons.append(f"carpet_area ({carpet}) > super_built_up_area ({super_built})")
        
    # 3. Floors
    floor = l.get("floor")
    total_floors = l.get("total_floors")
    if floor is not None and total_floors is not None:
        if floor > total_floors:
            reasons.append(f"floor ({floor}) > total_floors ({total_floors})")
        if floor < 0:
            reasons.append(f"floor ({floor}) < 0")
        if total_floors <= 0:
            reasons.append(f"total_floors ({total_floors}) <= 0")
            
    # 4. Bedrooms / Bathrooms
    bedroom = l.get("bedroom")
    bathroom = l.get("bathroom")
    if bedroom is not None and bedroom <= 0:
        reasons.append(f"bedroom ({bedroom}) <= 0")
    if bathroom is not None and bathroom <= 0:
        reasons.append(f"bathroom ({bathroom}) <= 0")
        
    # 5. Latitude / Longitude bounds for Chennai (approx Lat 12.5 - 13.5, Lon 80.0 - 80.5)
    lat = l.get("latitude")
    lon = l.get("longitude")
    if lat is not None and (lat < -90 or lat > 90):
        reasons.append(f"Invalid lat: {lat}")
    if lon is not None and (lon < -180 or lon > 180):
        reasons.append(f"Invalid lon: {lon}")
        
    if reasons:
        corrupt_records.append((lid, reasons, l))

print(f"Found {len(corrupt_records)} corrupt records:")
for lid, reasons, l in corrupt_records:
    print(f"  {lid}: {', '.join(reasons)}")

corrupt_ids = sorted(list(set(lid for lid, _, _ in corrupt_records)))
print(f"Sorted unique corrupt_listing_ids ({len(corrupt_ids)}): {corrupt_ids}")

# Q5: total_monthly_rent (assigned locality: Velachery)
print("\n--- Q5: total_monthly_rent (Velachery) ---")
# Check localities present in rentals
rental_localities = Counter(r.get("locality") for r in rentals)
print(f"Rental localities: {rental_localities}")

velachery_rentals = []
for r in rentals:
    loc = (r.get("locality") or "").strip().lower()
    if loc == "velachery":
        velachery_rentals.append(r)

print(f"Number of rentals with locality == 'velachery': {len(velachery_rentals)}")
total_rent_velachery = sum(r.get("price", 0) for r in velachery_rentals)
print(f"Total monthly rent in Velachery: {total_rent_velachery}")
print(f"Individual rental prices in Velachery: {[r.get('price') for r in velachery_rentals]}")

# Also check rentals where title mentions velachery
title_velachery = [r for r in rentals if "velachery" in (r.get("title") or "").lower()]
print(f"Rentals with 'velachery' in title: {len(title_velachery)}")
for r in title_velachery:
    print(f"  id: {r.get('listing_id')}, locality: {r.get('locality')}, title: {r.get('title')}, price: {r.get('price')}")

# Q7: costliest_project
print("\n--- Q7: costliest_project ---")
print("Inspecting projects price_max and price_min units...")
# Let's inspect sample projects price_max
for p in projects[:10]:
    print(f"  {p.get('project_id')} ({p.get('apartment_name')}): price_min={p.get('price_min')}, price_max={p.get('price_max')}, min_area={p.get('min_area_sqft')}, max_area={p.get('max_area_sqft')}")

# Let's analyze distribution of price_max
price_max_vals = [(p.get("project_id"), p.get("apartment_name"), p.get("price_max"), p.get("price_min")) for p in projects if p.get("price_max") is not None]
price_max_vals.sort(key=lambda x: x[2], reverse=True)
print("\nTop 10 highest raw price_max in projects:")
for p in price_max_vals[:10]:
    print(p)

print("\nLowest 10 price_max in projects:")
for p in price_max_vals[-10:]:
    print(p)

# Q8: listings_last_7_days
print("\n--- Q8: listings_last_7_days ---")
# Reference moment: 2026-09-10T00:00:00+05:30 (IST)
# Window: [2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)
ist_tz = timezone(timedelta(hours=5, minutes=30))
ref_end = datetime(2026, 9, 10, 0, 0, 0, tzinfo=ist_tz)
ref_start = ref_end - timedelta(days=7) # 2026-09-03T00:00:00+05:30

print(f"Reference Window (IST): [{ref_start.isoformat()}, {ref_end.isoformat()})")

def parse_iso_dt(ts_str):
    if not ts_str:
        return None
    # Check if format has Z or offset
    # Note: earlier we noticed "2026-01-19T12:56:00" without timezone!
    # If no timezone specified, is it UTC or IST?
    # Docs say: "Timestamps: ISO 8601, UTC, Z suffix, everywhere in the API"
    # But server health had: "timezone": "Asia/Kolkata", "server_time": "...+05:30"
    if ts_str.endswith("Z"):
        dt = datetime.fromisoformat(ts_str[:-1]).replace(tzinfo=timezone.utc)
        return dt.astimezone(ist_tz)
    elif "+" in ts_str or "-" in ts_str[10:]:
        return datetime.fromisoformat(ts_str).astimezone(ist_tz)
    else:
        # Naive timestamp - let's analyze whether treating as IST or UTC
        # If treated as IST:
        return datetime.fromisoformat(ts_str).replace(tzinfo=ist_tz)

posted_dates_ist = []
posted_dates_utc = []
for l in listings:
    ts = l.get("posted_at")
    if ts:
        if ts.endswith("Z"):
            dt_ist = datetime.fromisoformat(ts[:-1]).replace(tzinfo=timezone.utc).astimezone(ist_tz)
            dt_utc = dt_ist
        elif "+" in ts or "-" in ts[10:]:
            dt_ist = datetime.fromisoformat(ts).astimezone(ist_tz)
            dt_utc = dt_ist
        else:
            # Assume IST directly
            dt_ist = datetime.fromisoformat(ts).replace(tzinfo=ist_tz)
            # Assume UTC
            dt_utc = datetime.fromisoformat(ts).replace(tzinfo=timezone.utc).astimezone(ist_tz)
            
        if ref_start <= dt_ist < ref_end:
            posted_dates_ist.append(l)
        if ref_start <= dt_utc < ref_end:
            posted_dates_utc.append(l)

print(f"Listings in [Ref-7d, Ref) if naive is treated as IST: {len(posted_dates_ist)}")
print(f"Listings in [Ref-7d, Ref) if naive is treated as UTC: {len(posted_dates_utc)}")

# Let's inspect sample posted_at formats
posted_formats = Counter()
for l in listings:
    ts = l.get("posted_at", "")
    if ts.endswith("Z"):
        posted_formats["UTC with Z"] += 1
    elif "+" in ts or "-" in ts[10:]:
        posted_formats["With explicit offset"] += 1
    else:
        posted_formats["Naive without offset/Z"] += 1
print(f"posted_at format counts in listings: {posted_formats}")

# Q10: projects_with_wrong_listing_count
print("\n--- Q10: projects_with_wrong_listing_count ---")
# Count listings per project_id
# Note: Should we count all listings or only active/live listings?
# In API_REFERENCE.md line 271:
# "total_listings is the number of listings currently available in the project. It always agrees with what GET /v1/listings?project_id=... returns."
# And in problem statement Q10:
# "Every project reports how many listings it has. For how many projects is that number wrong?"
listings_by_project_all = Counter(l.get("project_id") for l in listings if l.get("project_id"))
listings_by_project_live = Counter(l.get("project_id") for l in listings if l.get("project_id") and l.get("is_live"))

wrong_count_all = 0
wrong_count_live = 0
discrepancy_details = []

for p in projects:
    pid = p.get("project_id")
    reported = p.get("total_listings", 0)
    actual_all = listings_by_project_all.get(pid, 0)
    actual_live = listings_by_project_live.get(pid, 0)
    
    if reported != actual_all:
        wrong_count_all += 1
    if reported != actual_live:
        wrong_count_live += 1
    if reported != actual_all or reported != actual_live:
        discrepancy_details.append((pid, reported, actual_all, actual_live))

print(f"Projects with wrong listing count (comparing reported vs ALL listings): {wrong_count_all} / {len(projects)}")
print(f"Projects with wrong listing count (comparing reported vs LIVE listings): {wrong_count_live} / {len(projects)}")
print(f"Sample discrepancies (pid, reported, actual_all, actual_live): {discrepancy_details[:10]}")

