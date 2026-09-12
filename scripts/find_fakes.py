import json
import os
import re
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

print("==================================================")
print("ANALYSIS OF POTENTIAL FAKE LISTINGS")
print("==================================================")

# 1. Price anomalies:
# Let's look at price distribution of all listings
prices = sorted([l.get("price", 0) for l in listings])
print("Price percentiles:")
for p in [0, 0.1, 0.5, 1, 2, 5, 10, 50, 90, 99, 100]:
    idx = int(p / 100 * (len(prices) - 1))
    print(f"  {p}%: {prices[idx]}")

# 2. Let's inspect all listings with price < 1,000,000:
under_1m = [l for l in listings if 0 < l.get("price", 0) < 1000000]
print(f"\nListings with 0 < price < 1M ({len(under_1m)}):")
for l in under_1m:
    print(f"  {l['listing_id']}: price={l['price']}, bhk={l['bedroom']}, area={l['carpet_area']}, loc={l['locality']}, apt={l['apartment_name']}, agent={l['posted_by_name']}, phone={l['posted_by_contact']}")

# Are there any other price anomalies?
# What about price / carpet_area?
rates = []
for l in listings:
    p = l.get("price")
    ca = l.get("carpet_area")
    if p and ca and p > 0 and ca > 0:
        rates.append((p / ca, l))
rates.sort(key=lambda x: x[0])

print("\nListings with lowest price/sqft (rate < 1000 INR/sqft):")
low_rate = [x for x in rates if x[0] < 1000]
print(f"Count: {len(low_rate)}")
for r, l in low_rate:
    print(f"  {l['listing_id']}: rate={r:.2f}, price={l['price']}, area={l['carpet_area']}, desc={l['description'][:60]}")

# 3. Let's check descriptions:
# Are there exact duplicate descriptions across different listings?
desc_map = defaultdict(list)
for l in listings:
    d = l.get("description", "").strip()
    if d:
        desc_map[d].append(l)

dup_descs = {k: v for k, v in desc_map.items() if len(v) > 1}
print(f"\nDuplicate descriptions count: {len(dup_descs)}")
for d, lst in list(dup_descs.items())[:10]:
    # Are these the same property or different properties?
    apts = set(x.get("apartment_name") for x in lst)
    locs = set(x.get("locality") for x in lst)
    ids = [x["listing_id"] for x in lst]
    print(f"  Desc ({len(lst)} times) across apts={apts}, locs={locs}: {ids}")

# 4. Let's check descriptions with "Owner moving abroad, priced to sell":
moving_abroad = [l for l in listings if "owner moving abroad" in (l.get("description") or "").lower()]
print(f"\n'Owner moving abroad' listings count: {len(moving_abroad)}")
for l in moving_abroad:
    print(f"  {l['listing_id']}: price={l['price']}, bhk={l['bedroom']}, ca={l['carpet_area']}, loc={l['locality']}, phone={l['posted_by_contact']}, agent={l['posted_by_name']}")

# 5. Let's check phone numbers that appear across many listings:
# Let's inspect the phone numbers with highest frequency:
phone_map = defaultdict(list)
for l in listings:
    p = l.get("posted_by_contact")
    if p:
        phone_map[p].append(l)

# Are there phone numbers associated with fake agents?
# What about phone numbers that have unreachable patterns or strange prefixes?
phone_prefixes = Counter(p[:5] for p in phone_map.keys())
print(f"\nPhone prefixes: {phone_prefixes}")

# All phone numbers start with +91200...
# Let's check the rest of the digits:
# In India, real numbers start with 6, 7, 8, 9, not 200 (200 is a dummy exchange prefix used in test data)
# But let's check if ALL numbers in this API start with +91200:
all_plus_91200 = all(p.startswith("+91200") for p in phone_map.keys())
print(f"Do all phone numbers start with +91200? {all_plus_91200}")

# 6. Check if any listings have duplicate descriptions with DIFFERENT properties
cross_property_desc_listings = set()
for d, lst in dup_descs.items():
    apts = set(x.get("apartment_name") for x in lst)
    if len(apts) > 1:
        for x in lst:
            cross_property_desc_listings.add(x["listing_id"])

print(f"\nListings sharing exact description across DIFFERENT apartments: {len(cross_property_desc_listings)}")
for lid in sorted(cross_property_desc_listings):
    l = [x for x in listings if x["listing_id"] == lid][0]
    print(f"  {lid}: apt={l.get('apartment_name')}, loc={l.get('locality')}, price={l.get('price')}")

# 7. Check if any listings have the exact same contact across totally different seller names:
inconsistent_agent_listings = set()
for p, lst in phone_map.items():
    names = set(x.get("posted_by_name") for x in lst)
    # If a phone number has both "owner" and "agent" or multiple completely different names
    roles = set(x.get("posted_by") for x in lst)
    if len(names) >= 4:
        # Heavily shared number
        pass

# 8. Check rental vs sale overlap:
# Look at the 9 listings with price < 100,000:
# DWE-4000745 (price 9430), 100-4001961 (7240), SQU-4001342 (15310), MAG-4000870 (16320),
# 100-4001484 (14140), MAG-4001467 (15530), MAG-4002092 (12260), MAG-4000075 (10950), ZER-4002683 (6470)
# Notice: are these rental prices?
# Let's check if their listing_id or apt/price exists in rentals!
with open(os.path.join(DATA_DIR, "rentals.json"), "r") as f:
    rentals = json.load(f)["results"]

rental_prices = set(r.get("price") for r in rentals)
print(f"\nAre the prices of those 9 listings in rentals dataset?")
for l in under_1m:
    in_rentals = l["price"] in rental_prices
    print(f"  {l['listing_id']}: price={l['price']}, in rentals prices? {in_rentals}")
