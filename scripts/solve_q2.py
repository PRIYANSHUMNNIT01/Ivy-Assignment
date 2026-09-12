import json
import os
from collections import defaultdict, Counter

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

print(f"Total listings: {len(listings)}")

# Check duplicate listing_ids
id_counts = Counter(l["listing_id"] for l in listings)
print(f"Distinct listing_ids: {len(id_counts)}")

# Let's inspect properties that appear across multiple records
# What attributes uniquely identify a physical property?
# An apartment unit is in an apartment_name, on a floor, with a carpet_area, bedroom count.
# Notice: Can two different properties have the exact same (apartment_name, floor, carpet_area, bedroom)?
# Usually yes, if there are multiple identical units on the same floor (e.g. Unit 401 and 402).
# BUT what if they are cross-posted across different websites?
# Let's check the records that share (apartment_name, floor, carpet_area, bedroom):
prop_map = defaultdict(list)
for l in listings:
    # normalize apt
    apt = (l.get("apartment_name") or "").strip().lower()
    fl = l.get("floor")
    ca = l.get("carpet_area")
    bhk = l.get("bedroom")
    loc = (l.get("locality") or "").strip().lower()
    pt = (l.get("property_type") or "").strip().lower()
    
    prop_map[(apt, loc, fl, ca, bhk, pt)].append(l)

multis = {k: v for k, v in prop_map.items() if len(v) > 1}
print(f"Number of property signatures with >1 record: {len(multis)}")
total_records_in_multis = sum(len(v) for v in multis.values())
print(f"Total records participating in duplicates: {total_records_in_multis}")
print(f"Distinct properties under this definition: {len(prop_map)}")

for sig, recs in list(multis.items())[:15]:
    websites = [r["website"] for r in recs]
    ids = [r["listing_id"] for r in recs]
    prices = [r["price"] for r in recs]
    coords = [(round(r["latitude"], 3), round(r["longitude"], 3)) for r in recs if r.get("latitude")]
    print(f"\nProperty: {sig}")
    print(f"  Websites: {websites}")
    print(f"  Listing IDs: {ids}")
    print(f"  Prices: {prices}")
    print(f"  Coords: {coords}")

# What if coordinate rounding is used?
# Let's check distance between properties with same apt, floor, carpet
dist_same = []
for sig, recs in multis.items():
    if len(recs) == 2:
        r1, r2 = recs[0], recs[1]
        lat1, lon1 = r1.get("latitude", 0), r1.get("longitude", 0)
        lat2, lon2 = r2.get("latitude", 0), r2.get("longitude", 0)
        d = ((lat1 - lat2)**2 + (lon1 - lon2)**2)**0.5
        dist_same.append((d, r1["website"], r2["website"]))

print(f"\nCoordinate differences between duplicates: {[d[0] for d in dist_same[:10]]}")

# Notice: All of them have websites from different portals (e.g. 100acres and zerobroker, or dwelling and magichomes)!
# That is exactly the same physical property listed by different brokers or on different portals!
