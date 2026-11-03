import React, { lazy, Suspense, useState } from 'react';
import { ViewMode } from '../types';
import { useTelemetry } from '../hooks/useTelemetry';
import type { BusMarker } from '../components/LiveMap';

const LiveMap = lazy(() => import('../components/LiveMap'));

interface StudentViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ onNavigate, onShowToast }) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // ── Live telemetry ──────────────────────────────────────────────────────────
  const { data: telemetry, loading, error, lastUpdated } = useTelemetry();
  // Student sees Bus 12 (or the first available device)
  const live = telemetry.find(t => t.bus_id === 'Bus 12') ?? telemetry[0] ?? null;

  const speedKmh   = live?.speed_kmh   != null ? `${live.speed_kmh.toFixed(1)} km/h` : '28 mph';
  const satellites = live?.satellites  != null ? live.satellites : 15;
  const accelX     = live?.accel_x     != null ? live.accel_x.toFixed(3) : '0.080';
  const accelY     = live?.accel_y     != null ? live.accel_y.toFixed(3) : '0.020';
  const accelZ     = live?.accel_z     != null ? live.accel_z.toFixed(3) : '0.998';
  const gyroZ      = live?.gyro_z      != null ? live.gyro_z.toFixed(3)  : '0.400';
  const rfidName   = live?.rfid_name   ?? null;
  const rfidUid    = live?.rfid_uid    ?? null;
  const busId      = live?.bus_id      ?? 'Bus #104';
  const psgCount   = live?.passenger_count ?? '—';
  const busStatus  = live?.status      ?? 'Active';

  // Build Leaflet marker
  const studentMarkers: BusMarker[] = live?.latitude != null && live?.longitude != null
    ? [{
        lat:    Number(live.latitude),
        lng:    Number(live.longitude),
        label:  busId,
        detail: `${live.route ?? 'Route'} · ${speedKmh}`,
        status: (live.status ?? 'Active') as BusMarker['status'],
      }]
    : [];

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md py-space-lg mb-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-outline font-label-sm uppercase tracking-wider">
            <span>Commuter Pass #STU-8821</span>
            <span>•</span>
            <span className="text-secondary font-medium">Daily Route 07</span>
          </div>
          <div className="flex items-baseline gap-space-sm mt-space-xs">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Student Bus Tracker
            </h1>
            <span className="font-body-lg text-body-lg text-outline">
              Welcome back, Emma
            </span>
          </div>
        </div>

        {/* Live Status Banner & Quick Alerts */}
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="font-telemetry-md text-telemetry-md font-medium tracking-tight">
              {busId} {busStatus === 'Active' ? 'In Transit' : busStatus}
            </span>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-primary font-telemetry-sm text-telemetry-sm font-semibold shadow-sm">
              {loading ? '…' : error ? 'Offline' : 'Live'}
            </span>
          </div>

          <button
            onClick={() =>
              onShowToast('Notification Feed', 'Your bus is 4 stops away from Oakridge Station.')
            }
            className="relative p-space-sm bg-surface-container-lowest rounded-full text-on-surface shadow-sm hover:bg-surface-container transition-colors"
            title="View Notification History"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications_active
            </span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error"></span>
          </button>
        </div>
      </div>

      {/* Primary Asymmetric Workspace: 2/3 and 1/3 splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* LEFT 2/3 COLUMN (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* 1. Live Bus Tracker Map Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Map Header Controls */}
            <div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  explore
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Route 07 Live Spatial Radar
                </span>
                <span className="font-telemetry-sm text-telemetry-sm px-space-xs rounded bg-surface-container text-on-surface-variant">
                  GEO-TRACK ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm text-outline">
                  Target Destination:
                </span>
                <span className="font-label-sm text-label-sm font-medium text-on-surface">
                  Lincoln High North Gate
                </span>
              </div>
            </div>

            {/* Live Leaflet Map */}
            <div className="relative w-full h-[360px]">
              <Suspense fallback={
                <div className="w-full h-[360px] flex items-center justify-center bg-surface-container-high">
                  <div className="flex flex-col items-center gap-2 text-outline">
                    <span className="material-symbols-outlined text-[40px] animate-pulse">map</span>
                    <span className="font-telemetry-sm text-telemetry-sm">Loading map…</span>
                  </div>
                </div>
              }>
                <LiveMap markers={studentMarkers} height="h-[360px]" autoFit />
              </Suspense>

              {/* Live bus label — top-left above Leaflet tiles */}
              {live && (
                <div className="absolute top-3 left-3 z-[1000] bg-primary text-on-primary px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 font-telemetry-sm text-telemetry-sm pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
                  {busId} · {speedKmh}
                </div>
              )}

              {/* Satellites badge — top-right */}
              {live && (
                <div className="absolute top-3 right-3 z-[1000] pointer-events-none">
                  <span className="bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded font-telemetry-sm text-telemetry-sm text-on-surface shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">satellite_alt</span>
                    {satellites} sats
                  </span>
                </div>
              )}

              {/* No GPS warning */}
              {!live && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                  <div className="bg-surface-container-lowest/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-[20px]">signal_disconnected</span>
                    Waiting for GPS fix…
                  </div>
                </div>
              )}
            </div>

            {/* Telemetry Stats Strip Below Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-0 bg-surface-container-low/40 p-space-md gap-space-md">
              <div className="flex items-center gap-space-md px-space-sm">
                <div className="h-10 w-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">speed</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Cruising Velocity
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                      {speedKmh}
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      {live?.status === 'Alert' ? '⚠ Over speed limit' : 'Within limit'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-md px-space-sm">
                <div className="h-10 w-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]">satellite</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    GNSS Satellite Fix
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                      {satellites}
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      Satellites ({satellites >= 12 ? '0.4m precision' : 'poor fix'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-md px-space-sm">
                <div className="h-10 w-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Distance to Oakridge
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                      1.2 mi
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      • 4 stops remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Motion & Safety Telemetry Panel (6 Metric Tiles) */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  monitor_heart
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Live Vehicle Dynamics & Safety Stream
                </h2>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-outline">
                Latency: 12ms • Sensor Mesh Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-md">
              {/* Metric 1: Cabin Accel */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Accel X</span>
                  <span className="material-symbols-outlined text-[18px]">airline_seat_recline_normal</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">{accelX} g</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">MPU-6050 X axis</span>
                </div>
              </div>

              {/* Metric 2: Accel Y */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Accel Y</span>
                  <span className="material-symbols-outlined text-[18px]">screen_rotation_alt</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">{accelY} g</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">MPU-6050 Y axis</span>
                </div>
              </div>

              {/* Metric 3: Accel Z */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Accel Z</span>
                  <span className="material-symbols-outlined text-[18px]">thermostat</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">{accelZ} g</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">MPU-6050 Z axis</span>
                </div>
              </div>

              {/* Metric 4: Gyro Z */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Gyro Z</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">{gyroZ} °/s</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">Yaw rate</span>
                </div>
              </div>

              {/* Metric 5: Passengers */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Passengers</span>
                  <span className="material-symbols-outlined text-[18px]">battery_charging_full</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">{psgCount}</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">RFID verified today</span>
                </div>
              </div>

              {/* Metric 6: Bus Status */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Bus Status</span>
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <div className="my-space-xs">
                  <span className={`font-telemetry-lg text-telemetry-lg font-semibold ${busStatus === 'Alert' ? 'text-error' : busStatus === 'Warning' ? 'text-secondary-container' : 'text-on-surface'}`}>
                    {busStatus}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${busStatus === 'Alert' ? 'bg-error animate-ping' : 'bg-secondary'}`}></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    {busStatus === 'Alert' ? '⚠ Speed violation' : 'All systems nominal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Student Transit Safety Guidelines */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">
                health_and_safety
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Daily Commute & Safety Guidelines
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Guide Item 1 */}
              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">hail</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Boarding Protocol
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Please wait 5 feet back from the curb until Bus #104 has come to a complete halt and front doors swing open.
                  </p>
                </div>
              </div>

              {/* Guide Item 2 */}
              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">contactless</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    RFID Badge Tap Verification
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Tap your Student SmartPass against the terminal sensor beside driver console upon entry and departure.
                  </p>
                </div>
              </div>

              {/* Guide Item 3 */}
              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-fixed flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">chair</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Emergency Seat Safety
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Keep aisles totally clear of backpacks. Buckle two-point belts if seated in front row safety harnesses.
                  </p>
                </div>
              </div>

              {/* Guide Item 4 */}
              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">find_in_page</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Lost Item Reporting
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Left an item on the bus? Dispatch locks personal possessions in the route depot safety safe within 45 mins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 1/3 COLUMN (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-xl">
          {/* 1. Bus & Driver Info Card */}
          <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-space-lg shadow-md flex flex-col gap-space-lg relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-telemetry-sm text-telemetry-sm text-primary-fixed uppercase tracking-wider">
                  Transit Manifest
                </span>
                <h2 className="font-headline-lg text-headline-lg text-surface-container-lowest font-semibold mt-0.5">
                  Bus #104
                </h2>
              </div>
              <span className="px-space-sm py-1 rounded-full bg-surface-container-lowest/10 text-primary-fixed-dim font-telemetry-sm text-telemetry-sm">
                Westside Express
              </span>
            </div>

            {/* Driver Profile Slice */}
            <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-container-lowest/5">
              <img
                className="w-14 h-14 rounded-full object-cover shrink-0 shadow-sm"
                src={ASSETS.driverMarcus}
                alt="Marcus Vance"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-headline-sm text-surface-container-lowest truncate">
                    Marcus Vance
                  </span>
                  <span
                    className="material-symbols-outlined text-secondary text-[16px]"
                    title="Certified Senior Transit Pilot"
                  >
                    verified
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="material-symbols-outlined text-yellow-400 text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-telemetry-md text-telemetry-md text-surface-container-lowest font-semibold">
                    4.9
                  </span>
                  <span className="font-label-sm text-label-sm text-outline-variant">
                    (640+ Commutes)
                  </span>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-primary-fixed-dim mt-0.5">
                  Clean Record • 8 Yrs Fleet Service
                </span>
              </div>
            </div>

            {/* Commuter Schedule Timeline */}
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-outline-variant font-medium">
                Daily Transit Timeline
              </span>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-lowest/5">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary-fixed text-[18px]">
                      wb_sunny
                    </span>
                    <span className="font-body-md text-body-md text-surface-container-lowest">
                      Morning Pick-Up
                    </span>
                  </div>
                  <span className="font-telemetry-md text-telemetry-md text-primary-fixed font-semibold">
                    07:42 AM
                  </span>
                </div>
                <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-lowest/5">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-outline-variant text-[18px]">
                      bedtime
                    </span>
                    <span className="font-body-md text-body-md text-surface-container-lowest">
                      Afternoon Drop-Off
                    </span>
                  </div>
                  <span className="font-telemetry-md text-telemetry-md text-surface-container-lowest font-semibold">
                    03:25 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Student Photo Reference Card */}
            <div className="p-space-md rounded-lg bg-surface-container-lowest/5 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={ASSETS.studentEmma}
                  alt="Emma Jenkins"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-surface-container-lowest font-medium">
                    Emma Jenkins
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-primary-fixed">
                    Grade 10 • Seat #14B
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
            </div>

            {/* Dispatch Contact Action Button */}
            <button
              className="w-full py-space-sm px-space-md rounded-lg bg-primary hover:bg-secondary transition-all duration-200 text-on-primary font-body-md text-body-md font-medium flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
              onClick={() =>
                onShowToast(
                  'Dispatcher Hotline Connected',
                  'Central Dispatch Line 4 has been dialed. Operator on line.'
                )
              }
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
              <span>Direct Contact Fleet Dispatch</span>
            </button>
          </div>

          {/* 2. Notifications & Alerts Feed */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  dynamic_feed
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Transit Activity Feed
                </h2>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-outline">Real-time</span>
            </div>

            <div className="flex flex-col gap-space-md">
              {/* Success Alert */}
              <div className="p-space-md rounded-lg bg-emerald-50 text-emerald-950 flex flex-col gap-space-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-emerald-800">
                      Boarding Confirmed
                    </span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-emerald-700">
                    07:38 AM
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-emerald-900 leading-snug">
                  Emma checked in via RFID at Front Door tap terminal (Door #01).
                </p>
              </div>

              {/* Info Alert */}
              <div className="p-space-md rounded-lg bg-surface-container-high/60 text-on-surface flex flex-col gap-space-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                      Depot Dispatch
                    </span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    07:22 AM
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  Bus #104 departed Westlake Central Terminal right on schedule with clean system check.
                </p>
              </div>

              {/* Warning Alert */}
              <div className="p-space-md rounded-lg bg-amber-50 text-amber-950 flex flex-col gap-space-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-amber-800">
                      Advisory
                    </span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-amber-700">
                    07:15 AM
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-amber-900 leading-snug">
                  Route 07 experiencing 4 min slowdown due to light morning weather along Interstate interchange.
                </p>
              </div>
            </div>

            {/* Feed footer action link */}
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="mt-space-xs text-center font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
              type="button"
            >
              <span>View 30-Day Attendance Logs</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Emma Jenkins — Attendance History
                </h3>
                <p className="text-xs text-outline">30-Day RFID Cryptographic Boarding Record</p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <div>
                  <div className="font-semibold text-on-surface">Today (Morning Inbound)</div>
                  <div className="text-outline">Oakridge Station → Lincoln High</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">07:38 AM • On Time</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <div>
                  <div className="font-semibold text-on-surface">Yesterday (Afternoon Outbound)</div>
                  <div className="text-outline">Lincoln High → Oakridge Station</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">03:32 PM • On Time</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <div>
                  <div className="font-semibold text-on-surface">Yesterday (Morning Inbound)</div>
                  <div className="text-outline">Oakridge Station → Lincoln High</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">07:40 AM • On Time</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <div>
                  <div className="font-semibold text-on-surface">Oct 12 (Afternoon Outbound)</div>
                  <div className="text-outline">Lincoln High → Oakridge Station</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">03:28 PM • On Time</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-container mt-3">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 bg-surface-container text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-high"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
