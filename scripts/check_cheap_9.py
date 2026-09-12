import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

cheap_9 = ["DWE-4000745", "100-4001961", "SQU-4001342", "MAG-4000870", "100-4001484", "MAG-4001467", "MAG-4002092", "MAG-4000075", "ZER-4002683"]

print("=== 9 Super Cheap Listings ===")
for lid in cheap_9:
    l = [x for x in listings if x["listing_id"] == lid][0]
    print(f"{lid}: price={l['price']}, is_verified={l['is_verified']}, is_live={l['is_live']}, posted_by={l['posted_by']}, desc={l['description']}")

# Are any of the 9 in corrupt listings?
# Corrupt listings were negative prices, negative areas, floor > total_floors, etc.
# None of the 9 had negative prices, but did any have corrupt features?
# Let's check MAG-4000075: carpet_area=145, super_built=195 (or wait, was carpet area in sq meters?)
