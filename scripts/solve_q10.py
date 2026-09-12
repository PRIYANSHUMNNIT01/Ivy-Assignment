import json
import os
from collections import Counter

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]
with open(os.path.join(DATA_DIR, "projects.json"), "r") as f:
    projects = json.load(f)["results"]

print(f"Total projects in dataset: {len(projects)}")

# Count listings per project_id
count_all = Counter(l.get("project_id") for l in listings if l.get("project_id"))
count_live = Counter(l.get("project_id") for l in listings if l.get("project_id") and l.get("is_live") is True)

# Corrupt listings from Q4:
corrupt_ids = set([
    '100-4000397', '100-4000449', '100-4000457', '100-4000491', '100-4000738', '100-4001530', '100-4001703',
    '100-4002832', '100-4002961', 'DWE-4000412', 'DWE-4000824', 'DWE-4000891', 'DWE-4001368', 'DWE-4001424',
    'DWE-4001442', 'DWE-4002045', 'DWE-4002247', 'DWE-4002374', 'DWE-4002712', 'DWE-4002806', 'DWE-4003067',
    'MAG-4000145', 'MAG-4000283', 'MAG-4000883', 'MAG-4001981', 'MAG-4002491', 'MAG-4002776', 'MAG-4003100',
    'SQU-4000224', 'SQU-4000308', 'SQU-4000459', 'SQU-4000583', 'SQU-4001225', 'SQU-4001601', 'SQU-4002483',
    'ZER-4000021', 'ZER-4000995', 'ZER-4001161', 'ZER-4001287', 'ZER-4001669', 'ZER-4001726', 'ZER-4001844',
    'ZER-4002352'
])
count_clean = Counter(l.get("project_id") for l in listings if l.get("project_id") and l["listing_id"] not in corrupt_ids)
count_clean_live = Counter(l.get("project_id") for l in listings if l.get("project_id") and l["listing_id"] not in corrupt_ids and l.get("is_live") is True)

wrong_all = 0
wrong_live = 0
wrong_clean = 0
wrong_clean_live = 0

diffs = []
for p in projects:
    pid = p["project_id"]
    reported = p.get("total_listings", 0)
    c_all = count_all.get(pid, 0)
    c_live = count_live.get(pid, 0)
    c_cln = count_clean.get(pid, 0)
    c_cln_live = count_clean_live.get(pid, 0)
    
    if reported != c_all:
        wrong_all += 1
    if reported != c_live:
        wrong_live += 1
    if reported != c_cln:
        wrong_clean += 1
    if reported != c_cln_live:
        wrong_clean_live += 1
    diffs.append((pid, reported, c_all, c_live))

print(f"Projects count: {len(projects)}")
print(f"Case A (Reported vs ALL listings): wrong = {wrong_all}")
print(f"Case B (Reported vs LIVE listings): wrong = {wrong_live}")
print(f"Case C (Reported vs CLEAN listings): wrong = {wrong_clean}")
print(f"Case D (Reported vs CLEAN LIVE listings): wrong = {wrong_clean_live}")

# Let's inspect projects where reported == c_live vs reported == c_all
match_live_not_all = [d for d in diffs if d[1] == d[3] and d[1] != d[2]]
match_all_not_live = [d for d in diffs if d[1] == d[2] and d[1] != d[3]]
match_neither = [d for d in diffs if d[1] != d[2] and d[1] != d[3]]
match_both = [d for d in diffs if d[1] == d[2] and d[1] == d[3]]

print(f"\nProjects where reported matches LIVE listings (but not all): {len(match_live_not_all)}")
print(f"Projects where reported matches ALL listings (but not live): {len(match_all_not_live)}")
print(f"Projects where reported matches BOTH (all == live): {len(match_both)}")
print(f"Projects where reported matches NEITHER: {len(match_neither)}")

print("\nSample projects where reported matches LIVE listings:")
for d in match_live_not_all[:5]:
    print(f"  {d[0]}: reported={d[1]}, all={d[2]}, live={d[3]}")

print("\nSample projects where reported matches NEITHER:")
for d in match_neither[:5]:
    print(f"  {d[0]}: reported={d[1]}, all={d[2]}, live={d[3]}")
