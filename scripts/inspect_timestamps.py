import json
import os
from datetime import datetime, timezone, timedelta

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

sept_listings = []
for l in listings:
    ts = l.get("posted_at")
    if ts and "2026-09" in ts:
        sept_listings.append((ts, l["listing_id"], l))

sept_listings.sort(key=lambda x: x[0])
print(f"Total listings posted in September 2026: {len(sept_listings)}")
for ts, lid, l in sept_listings:
    print(f"  {lid}: posted_at={ts}")

# Check boundary timestamps:
# Reference: 2026-09-10T00:00:00+05:30 (IST) = 2026-09-09T18:30:00Z (UTC)
# Start: 2026-09-03T00:00:00+05:30 (IST) = 2026-09-02T18:30:00Z (UTC)

# Case 1: If string is treated as IST directly (local time string in IST):
# Window: "2026-09-03T00:00:00" <= ts < "2026-09-10T00:00:00"
in_ist = [ts for ts, lid, l in sept_listings if "2026-09-03T00:00:00" <= ts < "2026-09-10T00:00:00"]
print(f"\nCase 1 (Timestamp string is IST): {len(in_ist)} listings")

# Case 2: If string is UTC without Z (meaning ts is UTC, and we convert to IST):
# An IST time between 2026-09-03T00:00:00+05:30 and 2026-09-10T00:00:00+05:30
# corresponds to UTC time between 2026-09-02T18:30:00 and 2026-09-09T18:30:00
in_utc_converted = [ts for ts, lid, l in sept_listings if "2026-09-02T18:30:00" <= ts < "2026-09-09T18:30:00"]
print(f"Case 2 (Timestamp string is UTC, converted to IST): {len(in_utc_converted)} listings")

# Let's inspect the exact timestamps around 2026-09-02 18:30, 2026-09-03 00:00, 2026-09-09 18:30, 2026-09-10 00:00
print("\nTimestamps near the boundary dates (Sep 2, 3, 9, 10):")
for ts, lid, l in sept_listings:
    if any(ts.startswith(f"2026-09-0{d}") for d in [2, 3]) or any(ts.startswith(f"2026-09-{d}") for d in ["09", "10"]):
        print(f"  {lid}: {ts}")
