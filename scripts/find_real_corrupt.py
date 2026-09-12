import json
import os

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

print("==================================================")
print("AUDITING EVERY POTENTIALLY IMPOSSIBLE ATTRIBUTE")
print("==================================================")

# 1. Negative prices
neg_price = [l for l in listings if l.get("price", 0) < 0]
print(f"\n1. Negative Price ({len(neg_price)}):")
for l in neg_price:
    print(f"  {l['listing_id']}: price={l['price']}, type={l['property_type']}")

# 2. Floor > Total floors
floor_gt_total = [l for l in listings if l.get("floor") is not None and l.get("total_floors") is not None and l["floor"] > l["total_floors"] and l.get("total_floors") > 0]
print(f"\n2. Floor > Total Floors ({len(floor_gt_total)}):")
for l in floor_gt_total:
    print(f"  {l['listing_id']}: floor={l['floor']}, total_floors={l['total_floors']}, type={l['property_type']}")

# 3. Carpet area > Super builtup area
carpet_gt_super = [l for l in listings if l.get("carpet_area") is not None and l.get("super_built_up_area") is not None and l["carpet_area"] > l["super_built_up_area"]]
print(f"\n3. Carpet Area > Super Builtup Area ({len(carpet_gt_super)}):")
for l in carpet_gt_super:
    print(f"  {l['listing_id']}: carpet={l['carpet_area']}, super={l['super_built_up_area']}, type={l['property_type']}, website={l['website']}")

# 4. Negative areas
neg_area = [l for l in listings if (l.get("carpet_area", 0) < 0 or l.get("super_built_up_area", 0) < 0)]
print(f"\n4. Negative Area ({len(neg_area)}):")
for l in neg_area:
    print(f"  {l['listing_id']}: carpet={l['carpet_area']}, super={l['super_built_up_area']}")

# 5. Negative floor
neg_floor = [l for l in listings if l.get("floor", 0) < 0]
print(f"\n5. Negative Floor ({len(neg_floor)}):")
for l in neg_floor:
    print(f"  {l['listing_id']}: floor={l['floor']}")

# 6. Negative or zero total floors for apartments/villas (excluding plots)
zero_floors_built = [l for l in listings if l.get("property_type") != "plot" and (l.get("total_floors") is None or l.get("total_floors") <= 0)]
print(f"\n6. Non-plot with total_floors <= 0 ({len(zero_floors_built)}):")
for l in zero_floors_built:
    print(f"  {l['listing_id']}: type={l['property_type']}, floor={l['floor']}, total_floors={l['total_floors']}, bhk={l['bedroom']}")

# 7. Non-plot with 0 bedrooms
zero_bhk_built = [l for l in listings if l.get("property_type") != "plot" and (l.get("bedroom") is None or l.get("bedroom") <= 0)]
print(f"\n7. Non-plot with bedroom <= 0 ({len(zero_bhk_built)}):")
for l in zero_bhk_built:
    print(f"  {l['listing_id']}: type={l['property_type']}, bhk={l['bedroom']}, bath={l['bathroom']}, desc={l['description'][:60]}")

# 8. Check coordinates (lat/long) for Chennai
# Chennai bounding box: lat ~ 12.8 to 13.3, lon ~ 80.0 to 80.4
out_of_bounds_geo = []
for l in listings:
    lat = l.get("latitude")
    lon = l.get("longitude")
    if lat and lon:
        if not (12.0 <= lat <= 14.0 and 79.5 <= lon <= 81.0):
            out_of_bounds_geo.append(l)
print(f"\n8. Out of bounds coordinates ({len(out_of_bounds_geo)}):")
for l in out_of_bounds_geo:
    print(f"  {l['listing_id']}: lat={l['latitude']}, lon={l['longitude']}, loc={l['locality']}")

# 9. Check bedrooms vs bathrooms ratio (e.g. 10 bathrooms for 1 bedroom or vice versa)
ratio_anomalies = []
for l in listings:
    bhk = l.get("bedroom")
    bath = l.get("bathroom")
    if bhk and bath and (bath > bhk * 3 or bhk > bath * 4):
        ratio_anomalies.append((l, bhk, bath))
print(f"\n9. Extreme bedroom/bathroom ratio ({len(ratio_anomalies)}):")
for l, bhk, bath in ratio_anomalies:
    print(f"  {l['listing_id']}: bhk={bhk}, bath={bath}, type={l['property_type']}")

# 10. Check balcony > bedroom * 2
balcony_anomalies = [l for l in listings if l.get("balcony") and l.get("bedroom") and l["balcony"] > l["bedroom"] + 3]
print(f"\n10. Balcony anomalies ({len(balcony_anomalies)}):")
for l in balcony_anomalies:
    print(f"  {l['listing_id']}: bhk={l['bedroom']}, balcony={l['balcony']}")

