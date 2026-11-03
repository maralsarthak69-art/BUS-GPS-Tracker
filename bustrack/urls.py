"""
URL configuration for the BusTrack project.

Auth endpoints
──────────────
  POST /api/auth/token/         — obtain access + refresh JWT pair
  POST /api/auth/token/refresh/ — rotate a refresh token
  GET  /api/auth/me/            — return the logged-in user's profile + role

API endpoints
─────────────
  /api/telemetry/       — TelemetryLog CRUD  (ESP32 POSTs here — AllowAny)
  /api/users/           — User management
  /api/routes/          — Route management
  /api/stations/        — Station management
  /api/notifications/   — Notification broadcast
  /api/overview/        — System dashboard snapshot
  /api/esp32-status/    — ESP32 connection health
  /admin/               — Django admin panel
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tracker.views import MeView

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── Auth ──────────────────────────────────────────────────────────────────
    path("api/auth/token/",         TokenObtainPairView.as_view(),  name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(),     name="token_refresh"),
    path("api/auth/me/",            MeView.as_view(),                name="auth_me"),

    # ── App API ───────────────────────────────────────────────────────────────
    path("api/", include("tracker.urls")),
]
