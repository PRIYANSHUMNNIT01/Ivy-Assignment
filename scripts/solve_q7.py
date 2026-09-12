import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
    projects = json.load(f)["results"]

print("==================================================")
print("PROJECTS PRICE ANALYSIS (Q7)")
print("==================================================")

# Let's inspect projects with highest price_max
# If raw_max < 15, it's in Crores (multiply by 10,000,000)
# If raw_max >= 15 and raw_max < 1000, it's in Lakhs (multiply by 100,000)
# What if raw_max > 1000? Let's check if any exist:
for p in projects:
    mx = p.get("price_max")
    mn = p.get("price_min")
    if mx is not None and mx > 1000:
        print(f"Project with mx > 1000: {p['project_id']}, mx={mx}")

# List all projects with converted price_max in INR
converted = []
for p in projects:
    mx = p.get("price_max")
    if mx is None:
        continue
    if mx < 15:
        inr = int(round(mx * 10000000))
    elif mx < 1000:
        inr = int(round(mx * 100000))
    else:
        inr = int(mx)
    converted.append((inr, mx, p))

converted.sort(key=lambda x: x[0], reverse=True)

print("Top 15 costliest projects in INR:")
for inr, raw, p in converted[:15]:
    print(f"  {p['project_id']} ({p['apartment_name']}, {p['developer_name']}, {p['locality']}): raw={raw} -> INR {inr:,}, area={p.get('min_area_sqft')}-{p.get('max_area_sqft')} sqft, listings={p.get('total_listings')}")

# What if raw price_max is taken literally?
by_raw = sorted(projects, key=lambda x: x.get("price_max", 0), reverse=True)
print("\nTop 5 projects by literal raw price_max:")
for p in by_raw[:5]:
    print(f"  {p['project_id']} ({p['apartment_name']}): raw={p.get('price_max')}")
