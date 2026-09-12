import json
import os
import re
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"

with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings_data = json.load(f)
with open(os.path.join(DATA_DIR, "rentals.json"), "r") as f:
    rentals_data = json.load(f)
with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
    projects_data = json.load(f)

listings = listings_data["results"]
rentals = rentals_data["results"]
projects = projects_data["results"]

print("================================================================================")
print("FINAL RE-CALCULATION ACROSS TRUE FULL DATASET")
print(f"Listings: {len(listings)} (reported total was {listings_data.get('reported_total')})")
print(f"Rentals:  {len(rentals)}  (reported total was {rentals_data.get('reported_total')})")
print(f"Projects: {len(projects)}  (reported total was {projects_data.get('reported_total')})")
print("================================================================================")

# ==============================================================================
# Q1: total_listing_records
# ==============================================================================
q1_total_listing_records = len(listings)
print(f"\nQ1 (total_listing_records): {q1_total_listing_records}")

# ==============================================================================
# Q3: active_listings
# ==============================================================================
q3_active_listings = sum(1 for l in listings if l.get("is_live") is True)
q3_inactive = sum(1 for l in listings if l.get("is_live") is False)
print(f"\nQ3 (active_listings): {q3_active_listings} (inactive: {q3_inactive})")

# ==============================================================================
# Q4: corrupt_listing_ids
# ==============================================================================
# Physically impossible:
# 1. Negative price
# 2. Floor > total_floors (and total_floors > 0)
# 3. Carpet area > super builtup area
# 4. Non-plot with 0 bedrooms (e.g. 0 BHK apartment/villa)
# 5. Swapped coordinates (lat > 70)
corrupt_set = set()
corrupt_by_cat = defaultdict(list)

for l in listings:
    lid = l["listing_id"]
    if l.get("price", 0) < 0:
        corrupt_by_cat["negative_price"].append(lid)
        corrupt_set.add(lid)
    if l.get("floor") is not None and l.get("total_floors") is not None and l["floor"] > l["total_floors"] and l["total_floors"] > 0:
        corrupt_by_cat["floor_gt_total"].append(lid)
        corrupt_set.add(lid)
    if l.get("carpet_area") is not None and l.get("super_built_up_area") is not None and l["carpet_area"] > l["super_built_up_area"]:
        corrupt_by_cat["carpet_gt_super"].append(lid)
        corrupt_set.add(lid)
    if l.get("property_type") != "plot" and (l.get("bedroom") is None or l.get("bedroom") <= 0):
        corrupt_by_cat["zero_bhk_non_plot"].append(lid)
        corrupt_set.add(lid)
    if l.get("latitude") and l.get("latitude") > 70:
        corrupt_by_cat["swapped_coordinates"].append(lid)
        corrupt_set.add(lid)

q4_corrupt_listing_ids = sorted(list(corrupt_set))
print(f"\nQ4 (corrupt_listing_ids): {len(q4_corrupt_listing_ids)} listings")
for cat, lids in corrupt_by_cat.items():
    print(f"  {cat}: {len(lids)} listings")
print(f"Sorted corrupt IDs: {q4_corrupt_listing_ids}")

# ==============================================================================
# Q5: total_monthly_rent (assigned locality: Velachery)
# ==============================================================================
# Sum of monthly rent across all retrievable rental records in assigned locality
velachery_rentals = [r for r in rentals if (r.get("locality") or "").strip().lower() == "velachery"]
q5_total_monthly_rent = sum(r.get("price", 0) for r in velachery_rentals)
print(f"\nQ5 (total_monthly_rent): {q5_total_monthly_rent} across {len(velachery_rentals)} rentals in Velachery")

# ==============================================================================
# Q7: costliest_project
# ==============================================================================
def convert_proj_price(val):
    if val is None:
        return 0
    if val < 15:
        return int(round(val * 10000000))
    elif val < 1000:
        return int(round(val * 100000))
    else:
        return int(val)

proj_by_cost = []
for p in projects:
    inr = convert_proj_price(p.get("price_max"))
    proj_by_cost.append((inr, p["project_id"], p.get("price_max"), p))

proj_by_cost.sort(key=lambda x: x[0], reverse=True)
top_proj = proj_by_cost[0]
q7_costliest_project = {
    "project_id": top_proj[1],
    "price_max_inr": top_proj[0]
}
print(f"\nQ7 (costliest_project): {q7_costliest_project}")
print(f"Top 3 projects: {[(x[1], x[0], x[3]['apartment_name']) for x in proj_by_cost[:3]]}")

# ==============================================================================
# Q8: listings_last_7_days
# ==============================================================================
# [REFERENCE - 7 days, REFERENCE) in IST
# REFERENCE = 2026-09-10T00:00:00+05:30 (IST)
# Since timestamps are naive local IST timestamps:
q8_count = sum(1 for l in listings if "2026-09-03T00:00:00" <= (l.get("posted_at") or "") < "2026-09-10T00:00:00")
print(f"\nQ8 (listings_last_7_days): {q8_count}")

# ==============================================================================
# Q9: fake_listing_ids
# ==============================================================================
# Check for honeypot listings (impossibly low price to generate enquiries, rental price in sale)
# In Indian real estate search portals, brokers post apartments with rent price (e.g. 6470, 9430) to generate enquiries
fake_cheap = [l for l in listings if 0 < l.get("price", 0) < 100000]
print(f"\nQ9 (fake_listing_ids) Candidates:")
print(f"  Super cheap (price < 1 Lakh / enquiry bait): {len(fake_cheap)} listings")
for l in fake_cheap:
    print(f"    {l['listing_id']}: price={l['price']}, bhk={l['bedroom']}, loc={l['locality']}, apt={l['apartment_name']}")

# Check if there are any other fake enquiry generators in the 4,100 listings:
# Let's inspect listings between 100,000 and 1,000,000:
cheap_1m = [l for l in listings if 100000 <= l.get("price", 0) < 1000000]
print(f"  Listings with 100k <= price < 1M: {len(cheap_1m)}")

# Check duplicate descriptions across different apartments:
desc_to_l = defaultdict(list)
for l in listings:
    d = (l.get("description") or "").strip()
    if d:
        desc_to_l[d].append(l)

dup_desc_diff_apt = []
for d, lst in desc_to_l.items():
    apts = set(x.get("apartment_name") for x in lst)
    if len(apts) > 1:
        dup_desc_diff_apt.extend(lst)
print(f"  Listings with duplicate description across different apartments: {len(dup_desc_diff_apt)}")

# Check dummy phone numbers:
dummy_phone_lids = [l["listing_id"] for l in listings if l.get("posted_by_contact") == "+912000000676"]
print(f"  Listings with dummy phone (+912000000676): {len(dummy_phone_lids)}: {dummy_phone_lids}")

q9_fake_listing_ids = sorted([l["listing_id"] for l in fake_cheap])
print(f"\nFinal Q9 (fake_listing_ids): {len(q9_fake_listing_ids)} listings:")
print(q9_fake_listing_ids)

# ==============================================================================
# Q6: avg_price_per_sqft_2bhk
# ==============================================================================
# Across retrievable listing records where is_live is true and bedroom is 2,
# leaving out records in Q4 and Q9:
# mean of price divided by carpet area, in rupees per square foot, to 2 decimals.
clean_2bhk_live = [
    l for l in listings
    if l.get("bedroom") == 2
    and l.get("is_live") is True
    and l["listing_id"] not in corrupt_set
    and l["listing_id"] not in q9_fake_listing_ids
]

# Raw mean
raw_rates = [l["price"] / l["carpet_area"] for l in clean_2bhk_live]
q6_raw_mean = sum(raw_rates) / len(raw_rates)

# Converted sq meters (carpet_area < 250 in magichomes)
converted_rates = []
for l in clean_2bhk_live:
    ca = l["carpet_area"]
    if ca < 250:
        ca_sqft = ca * 10.76391
    else:
        ca_sqft = ca
    converted_rates.append(l["price"] / ca_sqft)

q6_converted_mean = sum(converted_rates) / len(converted_rates)

print(f"\nQ6 (avg_price_per_sqft_2bhk):")
print(f"  Count of clean 2BHK live listings: {len(clean_2bhk_live)}")
print(f"  Raw mean: {q6_raw_mean:.2f}")
print(f"  Converted sqft mean: {q6_converted_mean:.2f}")

# ==============================================================================
# Q2: unique_properties
# ==============================================================================
# Among the 4,100 records, genuine or not, how many distinct properties do they describe?
# Composite physical property signature: (apartment_name, locality, floor, carpet_area, bedroom, property_type)
prop_signatures = set()
for l in listings:
    apt = (l.get("apartment_name") or "").strip().lower()
    loc = (l.get("locality") or "").strip().lower()
    fl = l.get("floor")
    ca = l.get("carpet_area")
    bhk = l.get("bedroom")
    pt = (l.get("property_type") or "").strip().lower()
    prop_signatures.add((apt, loc, fl, ca, bhk, pt))

q2_unique_properties = len(prop_signatures)
print(f"\nQ2 (unique_properties): {q2_unique_properties}")

# ==============================================================================
# Q10: projects_with_wrong_listing_count
# ==============================================================================
# Count listings per project_id
count_by_proj_all = Counter(l.get("project_id") for l in listings if l.get("project_id"))
count_by_proj_live = Counter(l.get("project_id") for l in listings if l.get("project_id") and l.get("is_live") is True)

wrong_all = sum(1 for p in projects if p.get("total_listings", 0) != count_by_proj_all.get(p["project_id"], 0))
wrong_live = sum(1 for p in projects if p.get("total_listings", 0) != count_by_proj_live.get(p["project_id"], 0))

print(f"\nQ10 (projects_with_wrong_listing_count):")
print(f"  Comparing reported vs ALL listings referencing project: {wrong_all} / {len(projects)}")
print(f"  Comparing reported vs LIVE listings referencing project: {wrong_live} / {len(projects)}")
