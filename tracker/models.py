from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator


class User(AbstractUser):
    """
    Extended user model with role-based access for the bus tracking system.
    Roles: admin (system managers), driver (bus operators), student (passengers).
    """

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("driver", "Driver"),
        ("student", "Student"),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="student",
        help_text="Determines the user's access level and permissions.",
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Contact number in international format (e.g. +91XXXXXXXXXX).",
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Route(models.Model):
    """Represents a bus route with an assigned driver and active status."""

    route_name = models.CharField(max_length=100, unique=True)
    start_location = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    assigned_driver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_routes",
        limit_choices_to={"role": "driver"},
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Route"
        verbose_name_plural = "Routes"
        ordering = ["route_name"]

    def __str__(self):
        return f"{self.route_name}: {self.start_location} → {self.destination}"


class Station(models.Model):
    """A stop/station along a Route, ordered by sequence_order."""

    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stations")
    station_name = models.CharField(max_length=150)
    sequence_order = models.PositiveIntegerField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        verbose_name = "Station"
        verbose_name_plural = "Stations"
        ordering = ["route", "sequence_order"]
        unique_together = [("route", "sequence_order")]

    def __str__(self):
        return f"{self.station_name} (Stop {self.sequence_order} on {self.route.route_name})"


class TelemetryLog(models.Model):
    """
    Raw telemetry data streamed from the ESP32 hardware unit.

    Sensors:
      MPU6050  — accelerometer + gyroscope
      NEO-6M   — GPS module
      RC522    — RFID reader
    """

    # Identity
    device_id = models.CharField(max_length=50, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    # MPU6050 — Accelerometer
    acc_x = models.FloatField(null=True, blank=True)
    acc_y = models.FloatField(null=True, blank=True)
    acc_z = models.FloatField(null=True, blank=True)

    # MPU6050 — Gyroscope
    gyro_z = models.FloatField(null=True, blank=True)

    # NEO-6M — GPS
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    satellites = models.PositiveSmallIntegerField(null=True, blank=True)
    speed_kmph = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0.0)])
    altitude = models.FloatField(null=True, blank=True)
    hdop = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0.0)])

    # RC522 — RFID
    rfid_uid = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = "Telemetry Log"
        verbose_name_plural = "Telemetry Logs"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["device_id", "-timestamp"]),
        ]

    def __str__(self):
        return f"[{self.device_id}] {self.timestamp} | GPS ({self.latitude}, {self.longitude})"


class DeviceConfig(models.Model):
    """
    Maps a hardware device_id (from ESP32) to a human-readable bus identity.
    Also acts as the connection-status tracker — last_seen is updated on every POST.
    """
    device_id  = models.CharField(max_length=50, unique=True, db_index=True,
                                  help_text="Matches device_id sent in the ESP32 JSON payload.")
    bus_id     = models.CharField(max_length=30, help_text="e.g. Bus 12")
    route_name = models.CharField(max_length=100, help_text="e.g. Route A")
    driver_name= models.CharField(max_length=150, blank=True, default="")
    last_seen  = models.DateTimeField(null=True, blank=True,
                                      help_text="Set automatically on every telemetry POST.")

    class Meta:
        verbose_name = "Device Configuration"
        verbose_name_plural = "Device Configurations"

    def __str__(self):
        return f"{self.device_id} → {self.bus_id} ({self.route_name})"

    @property
    def is_online(self):
        """True if a telemetry packet arrived within the last 30 seconds."""
        from django.utils import timezone
        import datetime
        if not self.last_seen:
            return False
        return (timezone.now() - self.last_seen) < datetime.timedelta(seconds=30)


class RfidCard(models.Model):
    """Maps an RFID UID to a student/passenger name for display purposes."""
    uid  = models.CharField(max_length=50, unique=True,
                            help_text="Uppercase hex UID, e.g. 'A3 B1 C2 D4'")
    name = models.CharField(max_length=150, help_text="Passenger / student display name")

    class Meta:
        verbose_name = "RFID Card"
        verbose_name_plural = "RFID Cards"

    def __str__(self):
        return f"{self.uid} → {self.name}"


class Notification(models.Model):
    """Broadcast notifications sent to users based on their role."""

    TARGET_ROLE_CHOICES = [
        ("all", "All Users"),
        ("admin", "Admins"),
        ("driver", "Drivers"),
        ("student", "Students"),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    target_role = models.CharField(max_length=10, choices=TARGET_ROLE_CHOICES, default="all")
    created_at = models.DateTimeField(auto_now_add=True)
    is_urgent = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        urgency = "🚨 URGENT" if self.is_urgent else "ℹ️"
        return f"{urgency} [{self.get_target_role_display()}] {self.title}"
