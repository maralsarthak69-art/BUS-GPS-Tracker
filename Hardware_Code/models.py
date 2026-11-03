from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
    """
    Represents a bus route with an assigned driver and active status.
    """

    route_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique name or identifier for the route (e.g. 'Route 4A').",
    )
    start_location = models.CharField(
        max_length=200,
        help_text="Name or address of the route's starting point.",
    )
    destination = models.CharField(
        max_length=200,
        help_text="Name or address of the route's final destination.",
    )
    assigned_driver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_routes",
        limit_choices_to={"role": "driver"},
        help_text="Driver responsible for this route. Must have the 'driver' role.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this route is currently operational.",
    )

    class Meta:
        verbose_name = "Route"
        verbose_name_plural = "Routes"
        ordering = ["route_name"]

    def __str__(self):
        return f"{self.route_name}: {self.start_location} → {self.destination}"


class Station(models.Model):
    """
    A stop/station along a Route, ordered by sequence_order.
    Stores the GPS coordinates of the station for map display.
    """

    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name="stations",
        help_text="The route this station belongs to.",
    )
    station_name = models.CharField(
        max_length=150,
        help_text="Name of the bus stop or station.",
    )
    sequence_order = models.PositiveIntegerField(
        help_text="Order of this station along the route (1 = first stop).",
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Latitude of the station in decimal degrees (e.g. 18.516726).",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text="Longitude of the station in decimal degrees (e.g. 73.856255).",
    )

    class Meta:
        verbose_name = "Station"
        verbose_name_plural = "Stations"
        ordering = ["route", "sequence_order"]
        unique_together = [("route", "sequence_order")]

    def __str__(self):
        return f"{self.station_name} (Stop {self.sequence_order} on {self.route.route_name})"


class TelemetryLog(models.Model):
    """
    Raw telemetry data streamed from the hardware unit on the bus.

    Hardware sensors:
      - MPU6050  — 6-axis IMU (accelerometer + gyroscope)
      - NEO-6M   — GPS module
      - RC522    — RFID reader for passenger check-in
    """

    # ── Identity ──────────────────────────────────────────────────────────────
    device_id = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Unique identifier of the hardware unit (e.g. MAC address or serial number).",
    )
    timestamp = models.DateTimeField(
        help_text="UTC timestamp when the data was recorded by the hardware.",
    )

    # ── MPU6050 — Accelerometer (g-force) ────────────────────────────────────
    acc_x = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration along the X-axis in g (MPU6050).",
    )
    acc_y = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration along the Y-axis in g (MPU6050).",
    )
    acc_z = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration along the Z-axis in g (MPU6050).",
    )

    # ── MPU6050 — Gyroscope (yaw rate) ───────────────────────────────────────
    gyro_z = models.FloatField(
        null=True,
        blank=True,
        help_text="Angular velocity around the Z-axis in °/s (MPU6050, yaw rate).",
    )

    # ── NEO-6M — GPS ─────────────────────────────────────────────────────────
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="GPS latitude in decimal degrees (NEO-6M).",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="GPS longitude in decimal degrees (NEO-6M).",
    )
    satellites = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Number of GPS satellites in view (NEO-6M).",
    )
    speed_kmph = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0)],
        help_text="Ground speed in km/h derived from GPS (NEO-6M).",
    )
    altitude = models.FloatField(
        null=True,
        blank=True,
        help_text="Altitude above mean sea level in metres (NEO-6M).",
    )
    hdop = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0)],
        help_text="Horizontal Dilution of Precision — lower is better (NEO-6M).",
    )

    # ── RC522 — RFID ──────────────────────────────────────────────────────────
    rfid_uid = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="UID of the RFID tag scanned during this telemetry window (RC522).",
    )

    class Meta:
        verbose_name = "Telemetry Log"
        verbose_name_plural = "Telemetry Logs"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["device_id", "-timestamp"]),
        ]

    def __str__(self):
        return f"[{self.device_id}] {self.timestamp} | GPS ({self.latitude}, {self.longitude})"


class Notification(models.Model):
    """
    Broadcast notifications sent to users based on their role.
    Urgent notifications can trigger push alerts on the client side.
    """

    TARGET_ROLE_CHOICES = [
        ("all", "All Users"),
        ("admin", "Admins"),
        ("driver", "Drivers"),
        ("student", "Students"),
    ]

    title = models.CharField(
        max_length=200,
        help_text="Short, descriptive title of the notification.",
    )
    message = models.TextField(
        help_text="Full body text of the notification.",
    )
    target_role = models.CharField(
        max_length=10,
        choices=TARGET_ROLE_CHOICES,
        default="all",
        help_text="Which user group should receive this notification.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the notification was created (set automatically).",
    )
    is_urgent = models.BooleanField(
        default=False,
        help_text="Mark as urgent to trigger high-priority alerts on the client.",
    )

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        urgency = "🚨 URGENT" if self.is_urgent else "ℹ️"
        return f"{urgency} [{self.get_target_role_display()}] {self.title}"
