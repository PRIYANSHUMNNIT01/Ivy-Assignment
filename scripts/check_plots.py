import json
import os
from collections import Counter

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

zero_bhk = [l for l in listings if l.get("bedroom") == 0]
print(f"Total listings with bedroom == 0: {len(zero_bhk)}")
pt_counts = Counter(l.get("property_type") for l in zero_bhk)
print(f"Property types for bedroom == 0: {pt_counts}")

sample_plot = zero_bhk[0]
print(f"Sample zero bedroom listing: {sample_plot['listing_id']}, type={sample_plot['property_type']}, floor={sample_plot['floor']}, total_floors={sample_plot['total_floors']}, carpet={sample_plot['carpet_area']}, super={sample_plot['super_built_up_area']}")
