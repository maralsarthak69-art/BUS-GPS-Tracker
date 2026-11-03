from rest_framework import serializers
from .models import User, TelemetryLog, Route, Station, Notification


# ─────────────────────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """
    Read / list serializer for User.
    Password is write-only and hashed via set_password so it is never
    returned in responses.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        help_text="Raw password — stored hashed, never returned.",
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "is_active",
            "date_joined",
            "password",
        ]
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


class DriverSummarySerializer(serializers.ModelSerializer):
    """
    Minimal read-only snapshot of a driver — embedded inside RouteSerializer
    so callers get a human-readable name without a separate request.
    """

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "phone_number"]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ─────────────────────────────────────────────────────────────────────────────
# Station
# ─────────────────────────────────────────────────────────────────────────────

class StationSerializer(serializers.ModelSerializer):
    """
    Full CRUD serializer for Station.
    When used standalone (StationViewSet) the `route` FK is writable.
    When embedded inside RouteSerializer it is read-only (nested context).
    """

    class Meta:
        model = Station
        fields = [
            "id",
            "route",
            "station_name",
            "sequence_order",
            "latitude",
            "longitude",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        # Prevent duplicate sequence_order on the same route during create/update.
        route = attrs.get("route", getattr(self.instance, "route", None))
        seq = attrs.get("sequence_order", getattr(self.instance, "sequence_order", None))
        qs = Station.objects.filter(route=route, sequence_order=seq)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {"sequence_order": "A station with this sequence order already exists on this route."}
            )
        return attrs


class NestedStationSerializer(serializers.ModelSerializer):
    """
    Read-only, route-free snapshot used when stations are embedded in a Route response.
    Omits the `route` FK to avoid redundancy.
    """

    class Meta:
        model = Station
        fields = ["id", "station_name", "sequence_order", "latitude", "longitude"]
        read_only_fields = fields


# ─────────────────────────────────────────────────────────────────────────────
# Route
# ─────────────────────────────────────────────────────────────────────────────

class RouteSerializer(serializers.ModelSerializer):
    """
    Route with:
      - `stations`             — ordered list of stops (read-only, nested)
      - `assigned_driver_name` — human-readable driver name (read-only)
      - `assigned_driver`      — writable FK (driver id)
    """

    stations = NestedStationSerializer(many=True, read_only=True)
    assigned_driver_name = serializers.SerializerMethodField(
        help_text="Full name of the assigned driver (read-only convenience field)."
    )
    assigned_driver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="driver"),
        allow_null=True,
        required=False,
        help_text="ID of the driver to assign. Must have role='driver'.",
    )

    class Meta:
        model = Route
        fields = [
            "id",
            "route_name",
            "start_location",
            "destination",
            "assigned_driver",
            "assigned_driver_name",
            "is_active",
            "stations",
        ]
        read_only_fields = ["id", "assigned_driver_name", "stations"]

    def get_assigned_driver_name(self, obj):
        if obj.assigned_driver:
            return obj.assigned_driver.get_full_name() or obj.assigned_driver.username
        return None


# ─────────────────────────────────────────────────────────────────────────────
# TelemetryLog
# ─────────────────────────────────────────────────────────────────────────────

class TelemetryLogSerializer(serializers.ModelSerializer):
    """
    Serializer for raw hardware telemetry packets.

    Groups are represented as flat fields matching the hardware JSON payload:
      device_id / timestamp
      acc_x, acc_y, acc_z, gyro_z        (MPU6050)
      latitude, longitude, satellites,
      speed_kmph, altitude, hdop          (NEO-6M GPS)
      rfid_uid                            (RC522)
    """

    class Meta:
        model = TelemetryLog
        fields = [
            "id",
            # Identity
            "device_id",
            "timestamp",
            # MPU6050
            "acc_x",
            "acc_y",
            "acc_z",
            "gyro_z",
            # NEO-6M GPS
            "latitude",
            "longitude",
            "satellites",
            "speed_kmph",
            "altitude",
            "hdop",
            # RC522 RFID
            "rfid_uid",
        ]
        read_only_fields = ["id"]

    def validate_speed_kmph(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Speed cannot be negative.")
        return value

    def validate_hdop(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("HDOP cannot be negative.")
        return value

    def validate_satellites(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Satellite count cannot be negative.")
        return value


class TelemetryLogSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight read-only snapshot used in the SystemOverviewView.
    Returns the most recent GPS fix + motion data for a device without
    the full field list.
    """

    class Meta:
        model = TelemetryLog
        fields = [
            "id",
            "device_id",
            "timestamp",
            "latitude",
            "longitude",
            "speed_kmph",
            "satellites",
            "acc_x",
            "acc_y",
            "acc_z",
        ]
        read_only_fields = fields


# ─────────────────────────────────────────────────────────────────────────────
# Notification
# ─────────────────────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    """
    Notification broadcast serializer.
    `created_at` is auto-set on save and therefore read-only.
    """

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "target_role",
            "created_at",
            "is_urgent",
        ]
        read_only_fields = ["id", "created_at"]
