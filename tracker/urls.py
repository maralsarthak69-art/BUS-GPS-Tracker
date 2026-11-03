from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    TelemetryViewSet,
    RouteViewSet,
    StationViewSet,
    NotificationViewSet,
    DeviceConfigViewSet,
    RfidCardViewSet,
    SystemOverviewView,
    esp32_connection_status,
)

router = DefaultRouter()
router.register(r"users",         UserViewSet,         basename="user")
router.register(r"telemetry",     TelemetryViewSet,    basename="telemetry")
router.register(r"routes",        RouteViewSet,         basename="route")
router.register(r"stations",      StationViewSet,       basename="station")
router.register(r"notifications", NotificationViewSet,  basename="notification")
router.register(r"devices",       DeviceConfigViewSet,  basename="device")
router.register(r"rfid-cards",    RfidCardViewSet,      basename="rfid-card")

urlpatterns = [
    path("", include(router.urls)),
    path("overview/",     SystemOverviewView.as_view(),  name="system-overview"),
    path("esp32-status/", esp32_connection_status,       name="esp32-status"),
]
