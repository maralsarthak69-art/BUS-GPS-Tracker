from django.db.models import Count, Max
from django.utils import timezone

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, Route, Station, TelemetryLog, User
from .serializers import (
    NotificationSerializer,
    RouteSerializer,
    StationSerializer,
    TelemetryLogSerializer,
    TelemetryLogSummarySerializer,
    UserSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers / permission shortcuts
# ─────────────────────────────────────────────────────────────────────────────

def _is_admin(user):
    return user.is_authenticated and (user.is_staff or getattr(user, "role", None) == "admin")


# ─────────────────────────────────────────────────────────────────────────────
# User ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for User accounts.

    - List / retrieve: authenticated users only.
    - Create / update / delete: admin only.

    Supports filtering by role via ?role=driver|student|admin.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "phone_number"]
    ordering_fields = ["username", "date_joined", "role"]
    ordering = ["username"]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return super().get_permissions()


# ─────────────────────────────────────────────────────────────────────────────
# TelemetryLog ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class TelemetryViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for TelemetryLog.

    Query parameters
    ────────────────
    ?latest=true          — Return only the single most-recent log per device_id.
    ?device_id=<id>       — Filter logs to a specific hardware unit.
    ?ordering=timestamp   — Default ordering is newest-first (-timestamp).

    Extra actions
    ─────────────
    GET /telemetry/<pk>/latest_for_device/
        Shortcut that returns the most recent log for the same device_id as
        the requested record.
    """

    serializer_class = TelemetryLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["timestamp", "speed_kmph", "satellites", "device_id"]
    ordering = ["-timestamp"]
    search_fields = ["device_id", "rfid_uid"]

    def get_queryset(self):
        qs = TelemetryLog.objects.all()

        device_id = self.request.query_params.get("device_id")
        if device_id:
            qs = qs.filter(device_id=device_id)

        latest = self.request.query_params.get("latest", "").lower()
        if latest == "true":
            # Find the most recent timestamp per device and return those rows.
            latest_timestamps = (
                TelemetryLog.objects
                .values("device_id")
                .annotate(max_ts=Max("timestamp"))
            )
            # Build a set of (device_id, timestamp) pairs for the filter.
            filters_q = None
            from django.db.models import Q
            for entry in latest_timestamps:
                q = Q(device_id=entry["device_id"], timestamp=entry["max_ts"])
                filters_q = q if filters_q is None else filters_q | q
            if filters_q:
                qs = TelemetryLog.objects.filter(filters_q)
            else:
                qs = TelemetryLog.objects.none()

        return qs

    @action(detail=True, methods=["get"], url_path="latest_for_device")
    def latest_for_device(self, request, pk=None):
        """
        GET /api/telemetry/<pk>/latest_for_device/

        Returns the single most-recent TelemetryLog for the same device_id
        as the record identified by <pk>.
        """
        log = self.get_object()
        latest = (
            TelemetryLog.objects
            .filter(device_id=log.device_id)
            .order_by("-timestamp")
            .first()
        )
        if latest is None:
            return Response(
                {"detail": "No telemetry found for this device."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(latest)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
# Route ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class RouteViewSet(viewsets.ModelViewSet):
    """
    CRUD for Route.

    Query parameters
    ────────────────
    ?is_active=true|false  — Filter by active status.
    ?driver_id=<id>        — Filter routes assigned to a specific driver.

    Nested extra action
    ───────────────────
    GET /routes/<pk>/stations/
        Returns the ordered list of stations for this route.
    """

    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["route_name", "start_location", "destination"]
    ordering_fields = ["route_name", "is_active"]
    ordering = ["route_name"]

    def get_queryset(self):
        qs = Route.objects.select_related("assigned_driver").prefetch_related("stations")

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")

        driver_id = self.request.query_params.get("driver_id")
        if driver_id:
            qs = qs.filter(assigned_driver_id=driver_id)

        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["get"], url_path="stations")
    def stations(self, request, pk=None):
        """
        GET /api/routes/<pk>/stations/

        Convenience endpoint returning all stations for the route
        ordered by sequence_order.
        """
        route = self.get_object()
        stations_qs = Station.objects.filter(route=route).order_by("sequence_order")
        serializer = StationSerializer(stations_qs, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        url_path="toggle_active",
        permission_classes=[IsAdminUser],
    )
    def toggle_active(self, request, pk=None):
        """
        PATCH /api/routes/<pk>/toggle_active/

        Flips the is_active flag on the route. Admin only.
        """
        route = self.get_object()
        route.is_active = not route.is_active
        route.save(update_fields=["is_active"])
        return Response(
            {"id": route.id, "route_name": route.route_name, "is_active": route.is_active}
        )


# ─────────────────────────────────────────────────────────────────────────────
# Station ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class StationViewSet(viewsets.ModelViewSet):
    """
    CRUD for Station.

    Query parameters
    ────────────────
    ?route_id=<id>  — Filter stations belonging to a specific route.
    """

    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["station_name"]
    ordering_fields = ["sequence_order", "station_name"]
    ordering = ["route", "sequence_order"]

    def get_queryset(self):
        qs = Station.objects.select_related("route")
        route_id = self.request.query_params.get("route_id")
        if route_id:
            qs = qs.filter(route_id=route_id)
        return qs


# ─────────────────────────────────────────────────────────────────────────────
# Notification ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    """
    CRUD for Notification.

    Query parameters
    ────────────────
    ?target_role=all|admin|driver|student  — Filter by audience.
    ?is_urgent=true|false                  — Filter urgent-only notifications.

    Mutation (create / update / delete) is restricted to admins.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "message"]
    ordering_fields = ["created_at", "is_urgent", "target_role"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Notification.objects.all()

        target_role = self.request.query_params.get("target_role")
        if target_role:
            qs = qs.filter(target_role=target_role)

        is_urgent = self.request.query_params.get("is_urgent")
        if is_urgent is not None:
            qs = qs.filter(is_urgent=is_urgent.lower() == "true")

        return qs

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return super().get_permissions()


# ─────────────────────────────────────────────────────────────────────────────
# System Overview — custom APIView
# ─────────────────────────────────────────────────────────────────────────────

class SystemOverviewView(APIView):
    """
    GET /api/overview/

    Returns a high-level dashboard snapshot of the system.

    Response shape
    ──────────────
    {
        "generated_at": "<ISO-8601 UTC>",
        "telemetry": {
            "total_packets":    <int>,
            "unique_devices":   <int>,
            "latest_timestamp": "<ISO-8601 UTC> | null"
        },
        "routes": {
            "total":   <int>,
            "active":  <int>,
            "inactive": <int>
        },
        "users": {
            "total":    <int>,
            "admins":   <int>,
            "drivers":  <int>,
            "students": <int>
        },
        "notifications": {
            "total":  <int>,
            "urgent": <int>
        },
        "hardware_status": [
            {
                "id":         <int>,
                "device_id":  "<str>",
                "timestamp":  "<ISO-8601>",
                "latitude":   "<decimal> | null",
                "longitude":  "<decimal> | null",
                "speed_kmph": <float> | null,
                "satellites": <int>   | null,
                "acc_x":      <float> | null,
                "acc_y":      <float> | null,
                "acc_z":      <float> | null
            },
            ...   ← one entry per known device_id
        ]
    }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ── Telemetry stats ───────────────────────────────────────────────────
        telemetry_qs = TelemetryLog.objects.all()
        total_packets = telemetry_qs.count()
        unique_devices = telemetry_qs.values("device_id").distinct().count()
        latest_ts = telemetry_qs.aggregate(latest=Max("timestamp"))["latest"]

        # ── Route stats ───────────────────────────────────────────────────────
        route_stats = Route.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=__import__("django.db.models", fromlist=["Q"]).Q(is_active=True)),
            inactive=Count("id", filter=__import__("django.db.models", fromlist=["Q"]).Q(is_active=False)),
        )

        # ── User stats ────────────────────────────────────────────────────────
        user_counts = (
            User.objects
            .values("role")
            .annotate(count=Count("id"))
        )
        user_stats = {"total": User.objects.count(), "admins": 0, "drivers": 0, "students": 0}
        for row in user_counts:
            key = f"{row['role']}s"  # "admin" → "admins", etc.
            user_stats[key] = row["count"]

        # ── Notification stats ────────────────────────────────────────────────
        notification_stats = Notification.objects.aggregate(
            total=Count("id"),
            urgent=Count("id", filter=__import__("django.db.models", fromlist=["Q"]).Q(is_urgent=True)),
        )

        # ── Per-device latest hardware status ─────────────────────────────────
        # Retrieve the most recent log for each known device efficiently.
        from django.db.models import Q

        latest_per_device_rows = (
            TelemetryLog.objects
            .values("device_id")
            .annotate(max_ts=Max("timestamp"))
        )

        hardware_filter = Q()
        for row in latest_per_device_rows:
            hardware_filter |= Q(device_id=row["device_id"], timestamp=row["max_ts"])

        if hardware_filter:
            latest_logs = TelemetryLog.objects.filter(hardware_filter).order_by("device_id")
        else:
            latest_logs = TelemetryLog.objects.none()

        hardware_status = TelemetryLogSummarySerializer(latest_logs, many=True).data

        # ── Assemble response ─────────────────────────────────────────────────
        return Response(
            {
                "generated_at": timezone.now().isoformat(),
                "telemetry": {
                    "total_packets": total_packets,
                    "unique_devices": unique_devices,
                    "latest_timestamp": latest_ts.isoformat() if latest_ts else None,
                },
                "routes": {
                    "total": route_stats["total"],
                    "active": route_stats["active"],
                    "inactive": route_stats["inactive"],
                },
                "users": user_stats,
                "notifications": {
                    "total": notification_stats["total"],
                    "urgent": notification_stats["urgent"],
                },
                "hardware_status": hardware_status,
            },
            status=status.HTTP_200_OK,
        )
