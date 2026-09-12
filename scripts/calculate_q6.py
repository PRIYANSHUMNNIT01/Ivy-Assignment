import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

corrupt_ids = set([
    '100-4000397', '100-4000449', '100-4000457', '100-4000491', '100-4000738', '100-4001530', '100-4001703',
    '100-4002832', '100-4002961', 'DWE-4000412', 'DWE-4000824', 'DWE-4000891', 'DWE-4001368', 'DWE-4001424',
    'DWE-4001442', 'DWE-4002045', 'DWE-4002247', 'DWE-4002374', 'DWE-4002712', 'DWE-4002806', 'DWE-4003067',
    'MAG-4000145', 'MAG-4000283', 'MAG-4000883', 'MAG-4001981', 'MAG-4002491', 'MAG-4002776', 'MAG-4003100',
    'SQU-4000224', 'SQU-4000308', 'SQU-4000459', 'SQU-4000583', 'SQU-4001225', 'SQU-4001601', 'SQU-4002483',
    'ZER-4000021', 'ZER-4000995', 'ZER-4001161', 'ZER-4001287', 'ZER-4001669', 'ZER-4001726', 'ZER-4001844',
    'ZER-4002352'
])

fake_candidates_9 = set([
    "DWE-4000745", "100-4001961", "SQU-4001342", "MAG-4000870", "100-4001484",
    "MAG-4001467", "MAG-4002092", "MAG-4000075", "ZER-4002683"
])

# Also check Magichomes sq meters vs sq ft!
# Remember: In magichomes, carpet area for some listings was in sq meters (e.g. 70-150 sq meters instead of 800-1500 sq ft)!
# Wait! Does Q6 say to convert or take raw price / carpet_area?
# Let's read Q6 carefully:
# "Across retrievable listing records where is_live is true and bedroom is 2, leaving out the records in your answers to 4 and 9: the mean of price divided by carpet area, in rupees per square foot, to 2 decimals."

bhk2_live = [l for l in listings if l.get("bedroom") == 2 and l.get("is_live") is True]
print(f"Total 2BHK live listings: {len(bhk2_live)}")

# In bhk2_live, how many are in corrupt_ids?
bhk2_corrupt = [l for l in bhk2_live if l["listing_id"] in corrupt_ids]
print(f"2BHK live corrupt: {len(bhk2_corrupt)}: {[l['listing_id'] for l in bhk2_corrupt]}")

# In bhk2_live, how many are in fake_candidates_9?
bhk2_fake9 = [l for l in bhk2_live if l["listing_id"] in fake_candidates_9]
print(f"2BHK live fake 9: {len(bhk2_fake9)}: {[l['listing_id'] for l in bhk2_fake9]}")

# Let's inspect carpet areas in bhk2_live (excluding corrupt and fake9)
clean_2bhk = [l for l in bhk2_live if l["listing_id"] not in corrupt_ids and l["listing_id"] not in fake_candidates_9]
print(f"Clean 2BHK live count: {len(clean_2bhk)}")

# Check carpet area distribution in clean_2bhk:
ca_vals = sorted(l["carpet_area"] for l in clean_2bhk)
print(f"Carpet area min={ca_vals[0]}, median={ca_vals[len(ca_vals)//2]}, max={ca_vals[-1]}")
small_ca = [l for l in clean_2bhk if l["carpet_area"] < 250]
print(f"Listings with carpet_area < 250 ({len(small_ca)}):")
for l in small_ca[:5]:
    print(f"  {l['listing_id']}: price={l['price']}, carpet={l['carpet_area']}, website={l['website']}")

# Calculate mean of price / carpet_area
rates_raw = [l["price"] / l["carpet_area"] for l in clean_2bhk]
mean_raw = sum(rates_raw) / len(rates_raw)
print(f"\nMean of raw price/carpet_area: {mean_raw:.4f} (rounded: {mean_raw:.2f})")

# What if carpet_area < 250 is converted from sq m to sq ft (multiplied by 10.7639)?
rates_adjusted = []
for l in clean_2bhk:
    ca = l["carpet_area"]
    if ca < 250: # sq meters
        ca_sqft = ca * 10.7639
    else:
        ca_sqft = ca
    rates_adjusted.append(l["price"] / ca_sqft)

mean_adjusted = sum(rates_adjusted) / len(rates_adjusted)
print(f"Mean with sq-meter adjustment: {mean_adjusted:.4f} (rounded: {mean_adjusted:.2f})")

# What did Q6 specify?
# "the mean of price divided by carpet area, in rupees per square foot, to 2 decimals."
# Notice: "in rupees per square foot".
# But if carpet_area in API was in sq meters for some, is that a documented discrepancy in `findings` (units)
# while the calculation in Q6 asks for the literal mean of price / carpet_area or converted?
# Notice statement.md: "Questions 2, 6 and 7 allow ±1%."
# Wait, let's check how much difference small_ca makes:
print(f"Difference between raw and adjusted: {abs(mean_raw - mean_adjusted) / mean_raw * 100:.2f}%")
