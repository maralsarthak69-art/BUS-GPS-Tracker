"""
Run this once after migrations to register the ESP32 device and sample RFID cards:

    python seed_device.py

This creates:
  - DeviceConfig: esp32_quad_01 → Bus 12, Route A, Amara Nwosu
  - Sample RfidCard entries for testing
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bustrack.settings")
django.setup()

from tracker.models import DeviceConfig, RfidCard

# ── Register the ESP32 hardware unit ──────────────────────────────────────────
device, created = DeviceConfig.objects.get_or_create(
    device_id="esp32_quad_01",
    defaults={
        "bus_id":      "Bus 12",
        "route_name":  "Route A",
        "driver_name": "Amara Nwosu",
    },
)
print(f"{'Created' if created else 'Already exists'}: DeviceConfig → {device}")

# ── Register sample RFID cards (for testing) ──────────────────────────────────
cards = [
    ("A3 B1 C2 D4", "Ravi Sharma"),
    ("F1 E2 D3 C4", "Sofia Martínez"),
    ("11 22 33 44", "James O'Brien"),
    ("AA BB CC DD", "Test Student"),
]

for uid, name in cards:
    card, created = RfidCard.objects.get_or_create(uid=uid, defaults={"name": name})
    print(f"{'Created' if created else 'Already exists'}: RfidCard {uid} → {name}")

print("\n✅ Seed complete. You can add more devices/cards via /admin/")
