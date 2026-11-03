import datetime

from django.db.models import Count, Max, Q
from django.utils import timezone

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Notification, Route, Station, TelemetryLog, User,
    DeviceConfig, RfidCard,
)
from .serializers import (
    NotificationSerializer,
    RouteSerializer,
    StationSerializer,
    TelemetryIngestSerializer,
    TelemetryLiveSerializer,
    UserSerializer,
    DeviceConfigSerializer,
    RfidCardSerializer,
)


# ── /api/auth/me/ ─────────────────────────────────────────────────────────────

class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the authenticated user's id, username, email, and role.
    Used by the frontend immediately after login to know which portal to show.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id":       u.id,
            "username": u.username,
            "email":    u.email,
            "role":     getattr(u, "role", "student"),
            "name":     u.get_full_name() or u.username,
        })


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_live_context(queryset):
    """
    Pre-fetch DeviceConfig and RfidCard lookups once for the whole queryset
    so TelemetryLiveSerializer never makes per-row DB calls.
    """
    device_ids = list(queryset.values_list("device_id", flat=True).distinct())
    rfid_uids  = list(
        queryset
        .exclude(rfid_uid__isnull=True)
        .exclude(rfid_uid__in=["None", "none", ""])
        .values_list("rfid_uid", flat=True)
        .distinct()
    )

    device_config_cache = {
        cfg.device_id: cfg
        for cfg in DeviceConfig.objects.filter(device_id__in=device_ids)
    }
    rfid_cache = {
        card.uid: card.name
        for card in RfidCard.objects.filter(uid__in=rfid_uids)
    }

    return {
        "_device_config_cache": device_config_cache,
        "_rfid_cache": rfid_cache,
    }


# ── User ViewSet ──────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["username", "date_joined", "role"]
    ordering = ["username"]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs


# ── TelemetryLog ViewSet ──────────────────────────────────────────────────────

class TelemetryViewSet(viewsets.ModelViewSet):
    """
    POST /api/telemetry/
        ESP32 sends raw sensor data here every 5 seconds.
        Uses TelemetryIngestSerializer (matches Arduino field names exactly).
        Also bumps DeviceConfig.last_seen for connection-status tracking.

    GET /api/telemetry/
        Returns raw records. Supports ?device_id=X and ?ordering=timestamp.

    GET /api/telemetry/?latest=true
        Returns ONE enriched record per device_id using TelemetryLiveSerializer.
        This is what the Next.js frontend polls every 2 seconds.
    """
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["timestamp", "speed_kmph", "satellites", "device_id"]
    ordering = ["-timestamp"]
    search_fields = ["device_id", "rfid_uid"]

    def get_serializer_class(self):
        # Ingest serializer for writes, live serializer for the ?latest query
        if self.request.method in ("POST", "PUT", "PATCH"):
            return TelemetryIngestSerializer
        if self.request.query_params.get("latest", "").lower() == "true":
            return TelemetryLiveSerializer
        return TelemetryIngestSerializer

    def get_queryset(self):
        qs = TelemetryLog.objects.all()

        device_id = self.request.query_params.get("device_id")
        if device_id:
            qs = qs.filter(device_id=device_id)

        if self.request.query_params.get("latest", "").lower() == "true":
            latest_rows = (
                TelemetryLog.objects
                .values("device_id")
                .annotate(max_ts=Max("timestamp"))
            )
            filt = Q()
            for row in latest_rows:
                filt |= Q(device_id=row["device_id"], timestamp=row["max_ts"])
            qs = TelemetryLog.objects.filter(filt) if filt else TelemetryLog.objects.none()

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Use the enriched serializer with pre-fetched caches for ?latest=true
        if request.query_params.get("latest", "").lower() == "true":
            context = self.get_serializer_context()
            context.update(_build_live_context(queryset))
            serializer = TelemetryLiveSerializer(queryset, many=True, context=context)
            return Response(serializer.data)

        # Default paginated list for other GET requests
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Accept raw ESP32 payload, save it, and bump DeviceConfig.last_seen.
        Returns 201 on success with the saved record id and timestamp.
        """
        serializer = TelemetryIngestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = serializer.save()

        # Update last_seen for the connection-status dashboard
        DeviceConfig.objects.filter(device_id=log.device_id).update(
            last_seen=timezone.now()
        )

        return Response(
            {"id": log.id, "device_id": log.device_id, "timestamp": log.timestamp},
            status=status.HTTP_201_CREATED,
        )


# ── DeviceConfig ViewSet ──────────────────────────────────────────────────────

class DeviceConfigViewSet(viewsets.ModelViewSet):
    """
    CRUD for the device_id → bus_id / route / driver mapping.
    Create one entry per ESP32 unit via the Django admin or this API.
    """
    queryset = DeviceConfig.objects.all()
    serializer_class = DeviceConfigSerializer
    permission_classes = [AllowAny]


# ── RfidCard ViewSet ──────────────────────────────────────────────────────────

class RfidCardViewSet(viewsets.ModelViewSet):
    """CRUD for RFID UID → student name lookup table."""
    queryset = RfidCard.objects.all()
    serializer_class = RfidCardSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["uid", "name"]


# ── ESP32 Connection Status ───────────────────────────────────────────────────

@api_view(["GET"])
def esp32_connection_status(request):
    """
    GET /api/esp32-status/

    Returns connection health for every registered device.
    A device is considered ONLINE if a telemetry packet arrived in the last 30 s.

    Response shape:
    {
      "checked_at": "2026-10-14T08:00:00Z",
      "devices": [
        {
          "device_id":   "esp32_quad_01",
          "bus_id":      "Bus 12",
          "route":       "Route A",
          "driver":      "Amara Nwosu",
          "last_seen":   "2026-10-14T07:59:55Z",
          "status":      "ONLINE",       // or "OFFLINE" or "NEVER_SEEN"
          "seconds_ago": 5
        }
      ]
    }
    """
    now = timezone.now()
    devices = DeviceConfig.objects.all()

    result = []
    for dev in devices:
        if dev.last_seen is None:
            status_str = "NEVER_SEEN"
            seconds_ago = None
        else:
            delta = (now - dev.last_seen).total_seconds()
            seconds_ago = int(delta)
            status_str = "ONLINE" if delta <= 30 else "OFFLINE"

        result.append({
            "device_id":   dev.device_id,
            "bus_id":      dev.bus_id,
            "route":       dev.route_name,
            "driver":      dev.driver_name,
            "last_seen":   dev.last_seen.isoformat() if dev.last_seen else None,
            "status":      status_str,
            "seconds_ago": seconds_ago,
        })

    return Response({
        "checked_at": now.isoformat(),
        "devices": result,
    })


# ── Route ViewSet ─────────────────────────────────────────────────────────────

class RouteViewSet(viewsets.ModelViewSet):
    serializer_class = RouteSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["route_name", "start_location", "destination"]
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

    @action(detail=True, methods=["get"], url_path="stations")
    def stations(self, request, pk=None):
        route = self.get_object()
        qs = Station.objects.filter(route=route).order_by("sequence_order")
        return Response(StationSerializer(qs, many=True).data)


# ── Station ViewSet ───────────────────────────────────────────────────────────

class StationViewSet(viewsets.ModelViewSet):
    serializer_class = StationSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["station_name"]
    ordering = ["route", "sequence_order"]

    def get_queryset(self):
        qs = Station.objects.select_related("route")
        route_id = self.request.query_params.get("route_id")
        if route_id:
            qs = qs.filter(route_id=route_id)
        return qs


# ── Notification ViewSet ──────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "message"]
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


# ── System Overview ───────────────────────────────────────────────────────────

class SystemOverviewView(APIView):
    """GET /api/overview/ — high-level dashboard snapshot."""
    permission_classes = [AllowAny]

    def get(self, request):
        telemetry_qs = TelemetryLog.objects.all()
        latest_ts = telemetry_qs.aggregate(latest=Max("timestamp"))["latest"]

        route_stats = Route.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True)),
            inactive=Count("id", filter=Q(is_active=False)),
        )

        user_counts = User.objects.values("role").annotate(count=Count("id"))
        user_stats = {"total": User.objects.count(), "admins": 0, "drivers": 0, "students": 0}
        for row in user_counts:
            user_stats[f"{row['role']}s"] = row["count"]

        notif_stats = Notification.objects.aggregate(
            total=Count("id"),
            urgent=Count("id", filter=Q(is_urgent=True)),
        )

        # Online devices
        cutoff = timezone.now() - datetime.timedelta(seconds=30)
        online_count  = DeviceConfig.objects.filter(last_seen__gte=cutoff).count()
        offline_count = DeviceConfig.objects.filter(
            Q(last_seen__lt=cutoff) | Q(last_seen__isnull=True)
        ).count()

        return Response({
            "generated_at": timezone.now().isoformat(),
            "telemetry": {
                "total_packets": telemetry_qs.count(),
                "unique_devices": telemetry_qs.values("device_id").distinct().count(),
                "latest_timestamp": latest_ts.isoformat() if latest_ts else None,
            },
            "routes": route_stats,
            "users": user_stats,
            "notifications": notif_stats,
            "devices": {
                "online": online_count,
                "offline": offline_count,
                "total": online_count + offline_count,
            },
        })
