from django.utils import timezone as tz
from rest_framework import serializers
from .models import User, TelemetryLog, Route, Station, Notification, DeviceConfig, RfidCard

import datetime


# ── User ──────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "phone_number", "is_active", "date_joined", "password"]
        read_only_fields = ["id", "date_joined"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# ── Station ───────────────────────────────────────────────────────────────────

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ["id", "route", "station_name", "sequence_order", "latitude", "longitude"]
        read_only_fields = ["id"]


class NestedStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ["id", "station_name", "sequence_order", "latitude", "longitude"]
        read_only_fields = fields


# ── Route ─────────────────────────────────────────────────────────────────────

class RouteSerializer(serializers.ModelSerializer):
    stations = NestedStationSerializer(many=True, read_only=True)
    assigned_driver_name = serializers.SerializerMethodField()
    assigned_driver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="driver"),
        allow_null=True, required=False,
    )

    class Meta:
        model = Route
        fields = ["id", "route_name", "start_location", "destination",
                  "assigned_driver", "assigned_driver_name", "is_active", "stations"]
        read_only_fields = ["id", "assigned_driver_name", "stations"]

    def get_assigned_driver_name(self, obj):
        if obj.assigned_driver:
            return obj.assigned_driver.get_full_name() or obj.assigned_driver.username
        return None


# ── DeviceConfig ──────────────────────────────────────────────────────────────

class DeviceConfigSerializer(serializers.ModelSerializer):
    is_online = serializers.ReadOnlyField()

    class Meta:
        model = DeviceConfig
        fields = ["id", "device_id", "bus_id", "route_name", "driver_name",
                  "last_seen", "is_online"]
        read_only_fields = ["id", "last_seen", "is_online"]


# ── RfidCard ──────────────────────────────────────────────────────────────────

class RfidCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RfidCard
        fields = ["id", "uid", "name"]
        read_only_fields = ["id"]


# ── TelemetryLog — raw ingest serializer (used for ESP32 POST) ───────────────

class TelemetryIngestSerializer(serializers.ModelSerializer):
    """
    Accepts the raw JSON payload from the ESP32.
    Field names match exactly what the Arduino sketch sends.
    """
    class Meta:
        model = TelemetryLog
        fields = [
            "device_id",
            "acc_x", "acc_y", "acc_z", "gyro_z",
            "latitude", "longitude", "satellites",
            "speed_kmph", "altitude", "hdop",
            "rfid_uid",
        ]

    def validate_speed_kmph(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Speed cannot be negative.")
        return value

    def validate_rfid_uid(self, value):
        # ESP32 sends the string "None" when no card has been scanned
        if value in (None, "None", "none", ""):
            return None
        return value


# ── TelemetryLog — enriched response serializer (used for frontend GET) ──────

class TelemetryLiveSerializer(serializers.ModelSerializer):
    """
    Returns the enriched shape the Next.js frontend expects.

    Renames:
      device_id   → bus_id        (looked up via DeviceConfig)
      speed_kmph  → speed_kmh
      altitude    → altitude_m
      acc_x/y/z   → accel_x/y/z

    Adds computed / enriched fields:
      route, driver, status, passenger_count, rfid_name, gyro_x, gyro_y
    """

    # ── Renamed fields ──────────────────────────────────────────────────────
    bus_id          = serializers.SerializerMethodField()
    route           = serializers.SerializerMethodField()
    driver          = serializers.SerializerMethodField()
    speed_kmh       = serializers.FloatField(source="speed_kmph")
    altitude_m      = serializers.FloatField(source="altitude")
    accel_x         = serializers.FloatField(source="acc_x")
    accel_y         = serializers.FloatField(source="acc_y")
    accel_z         = serializers.FloatField(source="acc_z")

    # ── Fields only in MPU-6050 Z axis (X/Y not wired on hardware) ─────────
    gyro_x          = serializers.SerializerMethodField()
    gyro_y          = serializers.SerializerMethodField()

    # ── Computed / enriched ─────────────────────────────────────────────────
    status          = serializers.SerializerMethodField()
    passenger_count = serializers.SerializerMethodField()
    rfid_name       = serializers.SerializerMethodField()

    class Meta:
        model = TelemetryLog
        fields = [
            "id", "bus_id", "route", "driver", "timestamp",
            "latitude", "longitude", "speed_kmh", "altitude_m", "satellites",
            "accel_x", "accel_y", "accel_z",
            "gyro_x", "gyro_y", "gyro_z",
            "rfid_uid", "rfid_name", "passenger_count",
            "status",
        ]

    # ── Cache DeviceConfig per serializer instance to avoid N+1 queries ────
    def _get_device_config(self, obj):
        cache = self.context.get("_device_config_cache")
        if cache is None:
            return None
        return cache.get(obj.device_id)

    def get_bus_id(self, obj):
        cfg = self._get_device_config(obj)
        return cfg.bus_id if cfg else obj.device_id

    def get_route(self, obj):
        cfg = self._get_device_config(obj)
        return cfg.route_name if cfg else "Unknown"

    def get_driver(self, obj):
        cfg = self._get_device_config(obj)
        return cfg.driver_name if cfg else "Unknown"

    def get_gyro_x(self, obj):
        return 0.0   # MPU-6050 gyro X not wired on hardware

    def get_gyro_y(self, obj):
        return 0.0   # MPU-6050 gyro Y not wired on hardware

    def get_status(self, obj):
        """
        Alert  → speed > 80 km/h
        Offline → no GPS fix (lat/lng both null)
        Warning → satellites < 4 (poor fix)
        Active  → everything nominal
        """
        if obj.speed_kmph is not None and obj.speed_kmph > 80:
            return "Alert"
        if obj.latitude is None or obj.longitude is None:
            return "Offline"
        if obj.satellites is not None and obj.satellites < 4:
            return "Warning"
        return "Active"

    def get_passenger_count(self, obj):
        """
        Count distinct RFID scans for this device_id today.
        Falls back to 0 if no scans recorded.
        """
        from django.utils import timezone
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        count = (
            TelemetryLog.objects
            .filter(
                device_id=obj.device_id,
                timestamp__gte=today_start,
                rfid_uid__isnull=False,
            )
            .exclude(rfid_uid="None")
            .values("rfid_uid")
            .distinct()
            .count()
        )
        return count

    def get_rfid_name(self, obj):
        if not obj.rfid_uid or obj.rfid_uid in ("None", "none"):
            return None
        cache = self.context.get("_rfid_cache")
        if cache is not None:
            return cache.get(obj.rfid_uid)
        # Fallback: single lookup (avoid if using bulk serialization)
        try:
            return RfidCard.objects.get(uid=obj.rfid_uid).name
        except RfidCard.DoesNotExist:
            return None


# ── Notification ──────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "target_role", "created_at", "is_urgent"]
        read_only_fields = ["id", "created_at"]
