from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Route, Station, TelemetryLog, Notification, DeviceConfig, RfidCard


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "role", "phone_number", "is_active", "date_joined"]
    list_filter = ["role", "is_active"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("BusTrack", {"fields": ("role", "phone_number")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("BusTrack", {"fields": ("role", "phone_number")}),
    )


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ["route_name", "start_location", "destination", "assigned_driver", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["route_name", "start_location", "destination"]


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ["station_name", "route", "sequence_order", "latitude", "longitude"]
    list_filter = ["route"]
    ordering = ["route", "sequence_order"]


@admin.register(TelemetryLog)
class TelemetryLogAdmin(admin.ModelAdmin):
    list_display = ["device_id", "timestamp", "latitude", "longitude",
                    "speed_kmph", "satellites", "rfid_uid"]
    list_filter = ["device_id"]
    search_fields = ["device_id", "rfid_uid"]
    ordering = ["-timestamp"]
    readonly_fields = ["timestamp"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "target_role", "is_urgent", "created_at"]
    list_filter = ["target_role", "is_urgent"]
    search_fields = ["title", "message"]


@admin.register(DeviceConfig)
class DeviceConfigAdmin(admin.ModelAdmin):
    list_display = ["device_id", "bus_id", "route_name", "driver_name", "last_seen", "is_online"]
    search_fields = ["device_id", "bus_id", "route_name"]
    readonly_fields = ["last_seen"]


@admin.register(RfidCard)
class RfidCardAdmin(admin.ModelAdmin):
    list_display = ["uid", "name"]
    search_fields = ["uid", "name"]
