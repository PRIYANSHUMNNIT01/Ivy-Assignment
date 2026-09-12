import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

target_ids = ["SQU-4002615", "SQU-4002451", "100-4000817", "ZER-4000306", "SQU-4003872"]
for lid in target_ids:
    l = [x for x in listings if x["listing_id"] == lid][0]
    print(l)
