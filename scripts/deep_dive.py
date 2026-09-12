import json
import os
import re
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"

def load_json(name):
    with open(os.path.join(DATA_DIR, f"{name}.json"), "r", encoding="utf-8") as f:
        return json.load(f)

listings = load_json("listings")["results"]
rentals = load_json("rentals")["results"]
projects = load_json("projects")["results"]

print("==================================================")
print("PART 1: DETAILED CORRUPT LISTINGS AUDIT (Q4)")
print("==================================================")

corrupt_map = defaultdict(list)
for l in listings:
    lid = l["listing_id"]
    p = l.get("price")
    ca = l.get("carpet_area")
    sba = l.get("super_built_up_area")
    fl = l.get("floor")
    tf = l.get("total_floors")
    bhk = l.get("bedroom")
    bath = l.get("bathroom")
    
    if p is None or p <= 0:
        corrupt_map[lid].append(f"Price: {p}")
    if ca is None or ca <= 0:
        corrupt_map[lid].append(f"Carpet area: {ca}")
    if sba is None or sba <= 0:
        corrupt_map[lid].append(f"Super builtup area: {sba}")
    if ca is not None and sba is not None and ca > sba:
        corrupt_map[lid].append(f"Carpet ({ca}) > Super Builtup ({sba})")
    if fl is not None and tf is not None and fl > tf:
        corrupt_map[lid].append(f"Floor ({fl}) > Total floors ({tf})")
    if fl is not None and fl < 0:
        corrupt_map[lid].append(f"Floor negative: {fl}")
    if tf is not None and tf <= 0:
        corrupt_map[lid].append(f"Total floors non-positive: {tf}")
    if bhk is not None and bhk <= 0:
        corrupt_map[lid].append(f"Bedroom non-positive: {bhk}")
    if bath is not None and bath <= 0:
        corrupt_map[lid].append(f"Bathroom non-positive: {bath}")

print(f"Total corrupt listing IDs: {len(corrupt_map)}")
for lid in sorted(corrupt_map.keys()):
    print(f"  {lid}: {', '.join(corrupt_map[lid])}")

print("\n==================================================")
print("PART 2: DETAILED PROJECTS & COSTLIEST PROJECT (Q7)")
print("==================================================")

def convert_project_price_to_inr(val):
    if val is None:
        return 0
    # In Indian real estate data:
    # If val < 10 (or < 15): value is in Crores (1 Cr = 10,000,000)
    # E.g. 1.95 Cr = 19,500,000; 3.09 Cr = 30,900,000
    # If val >= 10: value is in Lakhs (1 Lakh = 100,000)
    # E.g. 66.1 L = 6,610,000; 99.8 L = 9,980,000
    # Let's verify whether any project has raw INR (e.g. > 1000)
    if val > 10000:
        return int(val)
    elif val < 15: # Crores
        return int(round(val * 10000000))
    else: # Lakhs
        return int(round(val * 100000))

# Let's inspect all projects and their converted price_max
project_conversions = []
for p in projects:
    raw_max = p.get("price_max")
    raw_min = p.get("price_min")
    inr_max = convert_project_price_to_inr(raw_max)
    inr_min = convert_project_price_to_inr(raw_min)
    project_conversions.append({
        "project_id": p.get("project_id"),
        "apartment_name": p.get("apartment_name"),
        "developer_name": p.get("developer_name"),
        "locality": p.get("locality"),
        "raw_min": raw_min,
        "raw_max": raw_max,
        "inr_min": inr_min,
        "inr_max": inr_max,
        "min_area": p.get("min_area_sqft"),
        "max_area": p.get("max_area_sqft")
    })

# Check projects with raw_max
print("\nTop 10 costliest projects by INR conversion:")
by_inr = sorted(project_conversions, key=lambda x: x["inr_max"], reverse=True)
for p in by_inr[:10]:
    print(f"  {p['project_id']} | {p['apartment_name']} ({p['developer_name']}, {p['locality']}): raw_max={p['raw_max']} -> INR {p['inr_max']:,} (min: raw={p['raw_min']} -> INR {p['inr_min']:,})")

print("\nTop 10 projects by raw price_max (if treated literally without unit conversion):")
by_raw = sorted(project_conversions, key=lambda x: (x["raw_max"] or 0), reverse=True)
for p in by_raw[:10]:
    print(f"  {p['project_id']} | {p['apartment_name']}: raw_max={p['raw_max']} -> INR {p['inr_max']:,}")

print("\n==================================================")
print("PART 3: FAKE / HONEYPOT LISTINGS INVESTIGATION (Q9)")
print("==================================================")

# Look for patterns that indicate fake / enquiry generation listings:
# 1. Phone number reuse across disparate properties
phone_to_listings = defaultdict(list)
for l in listings:
    phone = l.get("posted_by_contact")
    if phone:
        phone_to_listings[phone].append(l)

print(f"Total unique phone numbers: {len(phone_to_listings)}")
phone_counts = Counter({phone: len(lst) for phone, lst in phone_to_listings.items()})
print("Top 10 phone numbers by listing count:")
for phone, count in phone_counts.most_common(10):
    locs = set(l.get("locality") for l in phone_to_listings[phone])
    names = set(l.get("posted_by_name") for l in phone_to_listings[phone])
    print(f"  {phone}: {count} listings across {len(locs)} localities, agent names: {names}")

# 2. Description duplicates / templates
desc_to_listings = defaultdict(list)
for l in listings:
    desc = (l.get("description") or "").strip()
    if desc:
        desc_to_listings[desc].append(l)

desc_counts = Counter({desc: len(lst) for desc, lst in desc_to_listings.items()})
print("\nTop duplicate descriptions count:")
for desc, count in desc_counts.most_common(5):
    if count > 1:
        print(f"  Count {count}: {desc[:100]}...")

# 3. Suspicious price per sqft (extremely cheap or extreme outliers)
print("\nChecking price per sqft distribution for 2BHK / overall:")
rates = []
for l in listings:
    p = l.get("price")
    ca = l.get("carpet_area")
    if p and ca and p > 0 and ca > 0:
        rate = p / ca
        rates.append((rate, l))

rates.sort(key=lambda x: x[0])
print(f"Lowest 10 price/sqft:")
for r, l in rates[:10]:
    print(f"  {l['listing_id']}: price={l['price']}, carpet={l['carpet_area']} -> rate={r:.2f} INR/sqft, loc={l['locality']}, apt={l['apartment_name']}, desc={l['description'][:60]}")

print(f"\nHighest 10 price/sqft:")
for r, l in rates[-10:]:
    print(f"  {l['listing_id']}: price={l['price']}, carpet={l['carpet_area']} -> rate={r:.2f} INR/sqft, loc={l['locality']}, apt={l['apartment_name']}, desc={l['description'][:60]}")

# 4. Check agent names and contacts
agent_names = Counter(l.get("posted_by_name") for l in listings)
print(f"\nMost common posted_by_names:")
for name, count in agent_names.most_common(10):
    print(f"  {name}: {count}")

# 5. Check if any listings have explicit fake flags, or mentions of "call now", "urgent", etc.
fake_keywords = ["fake", "test", "dummy", "honeypot", "sample", "enquiry", "lead"]
keyword_matches = []
for l in listings:
    text = f"{l.get('description', '')} {l.get('apartment_name', '')} {l.get('posted_by_name', '')}".lower()
    for kw in fake_keywords:
        if kw in text:
            keyword_matches.append((l['listing_id'], kw, l['description']))
print(f"\nKeyword matches for test/dummy/honeypot/etc: {len(keyword_matches)}")
for m in keyword_matches[:10]:
    print(f"  {m[0]}: matched '{m[1]}' -> {m[2][:80]}")

print("\n==================================================")
print("PART 4: UNIQUE PROPERTIES DEDUPLICATION (Q2)")
print("==================================================")

# In Q2: "Among those records, genuine or not, how many distinct properties do they describe? A property described by several records counts once."
# Let's test various property signatures:
# Sig 1: (latitude, longitude, floor, carpet_area, bedroom)
# Sig 2: (apartment_name, floor, carpet_area, bedroom)
# Sig 3: (apartment_name, locality, floor, carpet_area, bedroom, property_type)
# Sig 4: (round(latitude, 4), round(longitude, 4), floor, carpet_area, bedroom)

sigs1 = set()
sigs2 = set()
sigs3 = set()
sigs4 = set()
for l in listings:
    lat = round(l.get("latitude", 0), 4) if l.get("latitude") else None
    lon = round(l.get("longitude", 0), 4) if l.get("longitude") else None
    fl = l.get("floor")
    ca = l.get("carpet_area")
    bhk = l.get("bedroom")
    apt = (l.get("apartment_name") or "").strip().lower()
    loc = (l.get("locality") or "").strip().lower()
    pt = (l.get("property_type") or "").strip().lower()
    
    sigs1.add((lat, lon, fl, ca, bhk))
    sigs2.add((apt, fl, ca, bhk))
    sigs3.add((apt, loc, fl, ca, bhk, pt))
    sigs4.add((lat, lon, apt, fl, ca, bhk))

print(f"Total listing records: {len(listings)}")
print(f"Unique physical units via (lat, lon, floor, carpet, bhk): {len(sigs1)}")
print(f"Unique physical units via (apt, floor, carpet, bhk): {len(sigs2)}")
print(f"Unique physical units via (apt, loc, floor, carpet, bhk, type): {len(sigs3)}")
print(f"Unique physical units via (lat, lon, apt, floor, carpet, bhk): {len(sigs4)}")

# Check duplicate records: are there records that have the exact same listing_id or exact same fields across websites?
websites = Counter(l.get("website") for l in listings)
print(f"\nWebsites distribution in listings: {websites}")

# Check properties cross-posted on multiple websites:
cross_posted = defaultdict(list)
for l in listings:
    # A property signature
    sig = (l.get("apartment_name", "").lower(), l.get("floor"), l.get("carpet_area"), l.get("bedroom"))
    cross_posted[sig].append(l)

multisite = {k: v for k, v in cross_posted.items() if len(v) > 1}
print(f"Number of properties appearing in multiple listing records: {len(multisite)}")
print("Sample cross-posted property records:")
for sig, recs in list(multisite.items())[:3]:
    print(f"  Property {sig}: {len(recs)} listings -> {[r['listing_id'] + ' (' + r['website'] + ', price=' + str(r['price']) + ')' for r in recs]}")
