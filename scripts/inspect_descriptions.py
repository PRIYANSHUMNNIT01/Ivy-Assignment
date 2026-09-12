import json
import os
import re
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

# Categorize descriptions by opening phrase:
openings = []
for l in listings:
    d = l.get("description", "").strip()
    # first sentence or first 5 words
    first_sent = d.split(".")[0] if "." in d else d
    openings.append(first_sent)

opening_counts = Counter(openings)
print("Top 20 description opening sentences:")
for sent, count in opening_counts.most_common(20):
    print(f"  ({count:3d}) {sent[:80]}")

# Check any description starting with unusual prefixes
prefixes = [d.split()[0] for d in openings if d]
print(f"\nTop 15 first words in descriptions: {Counter(prefixes).most_common(15)}")

# Are there any other prefixes like "Owner moving abroad"?
for word, count in Counter(prefixes).items():
    if count < 50:
        sample = [l for l in listings if l.get("description", "").startswith(word)][0]
        print(f"  Word '{word}' ({count}): {sample['listing_id']} -> {sample['description'][:80]}")
