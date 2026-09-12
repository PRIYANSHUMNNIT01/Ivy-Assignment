import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

corrupt_categories = {
    "negative_price": [],
    "floor_gt_total": [],
    "carpet_gt_super": [],
    "zero_bhk_non_plot": [],
    "swapped_coordinates": []
}

for l in listings:
    lid = l["listing_id"]
    if l.get("price", 0) < 0:
        corrupt_categories["negative_price"].append(lid)
    if l.get("floor") is not None and l.get("total_floors") is not None and l["floor"] > l["total_floors"] and l["total_floors"] > 0:
        corrupt_categories["floor_gt_total"].append(lid)
    if l.get("carpet_area") is not None and l.get("super_built_up_area") is not None and l["carpet_area"] > l["super_built_up_area"]:
        corrupt_categories["carpet_gt_super"].append(lid)
    if l.get("property_type") != "plot" and (l.get("bedroom") is None or l.get("bedroom") <= 0):
        corrupt_categories["zero_bhk_non_plot"].append(lid)
    if l.get("latitude") and l.get("latitude") > 70:
        corrupt_categories["swapped_coordinates"].append(lid)

all_corrupt = set()
for cat, lids in corrupt_categories.items():
    print(f"Category {cat}: {len(lids)} listings: {sorted(lids)}")
    all_corrupt.update(lids)

print(f"\nTotal unique corrupt listing IDs across all 5 categories: {len(all_corrupt)}")
print(f"Sorted IDs: {sorted(all_corrupt)}")
