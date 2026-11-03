import React, { useState } from 'react';
import { ViewMode } from '../types';
import { ASSETS } from '../mockData';

interface StudentViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ onNavigate, onShowToast }) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [transitLayerActive, setTransitLayerActive] = useState(true);

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
              Bus #104 In Transit
            </span>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-primary font-telemetry-sm text-telemetry-sm font-semibold shadow-sm">
              ETA 8 mins
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

            {/* Simulated Leaflet / Map Canvas with Interactive Pin Visuals */}
            <div className="relative w-full h-[360px] bg-surface-container-high overflow-hidden select-none">
              {/* Vector Street Grid Underlay */}
              <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern height="40" id="student-grid" patternUnits="userSpaceOnUse" width="40">
                    <path
                      className="text-outline-variant"
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    ></path>
                  </pattern>
                </defs>
                <rect fill="url(#student-grid)" height="100%" width="100%"></rect>
                {/* Transit Transit Path */}
                {transitLayerActive && (
                  <>
                    <path
                      className="animate-pulse"
                      d="M -20,280 C 140,260 220,180 340,190 S 520,120 680,100 S 860,60 1020,40"
                      fill="none"
                      stroke="#2170e4"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                      strokeWidth="6"
                    ></path>
                    <path
                      d="M -20,280 C 140,260 220,180 340,190 S 520,120 680,100 S 860,60 1020,40"
                      fill="none"
                      stroke="#b7c4ff"
                      strokeWidth="2"
                    ></path>
                  </>
                )}
              </svg>

              {/* Oakridge Station Boarding Stop Pin */}
              <div className="absolute top-[170px] left-[325px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20">
                <div className="bg-surface-container-lowest px-space-sm py-space-xs rounded shadow-md text-on-surface font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap mb-1">
                  <span className="material-symbols-outlined text-secondary text-[14px]">
                    departure_board
                  </span>
                  <span className="font-medium">Oakridge Station (Your Boarding Stop)</span>
                </div>
                <div className="h-4 w-4 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-surface-container-lowest"></span>
                </div>
                <div className="w-1 h-3 bg-secondary/50"></div>
              </div>

              {/* Pulsing Live Bus Pin #104 */}
              <div className="absolute top-[135px] left-[505px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-primary text-on-primary font-telemetry-sm text-telemetry-sm shadow-lg">
                  <span className="material-symbols-outlined text-[13px] text-primary-fixed">
                    directions_bus
                  </span>
                  <span>BUS #104</span>
                </div>
                <div className="relative mt-1 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-secondary-container opacity-60"></span>
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                    <span className="material-symbols-outlined text-[14px]">navigation</span>
                  </div>
                </div>
              </div>

              {/* School Final Station Pin */}
              <div className="absolute top-[48px] right-[70px] flex items-center gap-space-xs bg-surface-container-lowest/90 backdrop-blur px-space-sm py-1 rounded shadow-sm z-20">
                <span className="material-symbols-outlined text-primary text-[16px]">school</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Lincoln High School
                </span>
              </div>

              {/* Floating Map Mode Badges */}
              <div className="absolute top-space-md left-space-md flex flex-col gap-space-xs z-10">
                <button
                  onClick={() => setTransitLayerActive(!transitLayerActive)}
                  className="bg-surface-container-lowest/90 backdrop-blur hover:bg-surface-container text-on-surface px-space-sm py-space-xs rounded-lg shadow-sm text-label-sm font-label-sm flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    layers
                  </span>
                  <span>{transitLayerActive ? 'Hide Route Layer' : 'Show Route Layer'}</span>
                </button>
                <div className="bg-surface-container-lowest/90 backdrop-blur text-outline px-space-sm py-space-xs rounded-lg shadow-sm font-telemetry-sm text-telemetry-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    satellite_alt
                  </span>
                  <span>HD 60FPS Sync</span>
                </div>
              </div>
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
                      28
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      mph (Within 30 limit)
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
                      15
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      Satellites (0.4m precision)
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
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Cabin G-Force
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    airline_seat_recline_normal
                  </span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    0.08 g
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Smooth ride index
                  </span>
                </div>
              </div>

              {/* Metric 2: Turn Gyro Rate */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Yaw & Gyro Rate
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    screen_rotation_alt
                  </span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    0.4°/s
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Stable gentle curve
                  </span>
                </div>
              </div>

              {/* Metric 3: Interior Temp */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Cabin Climate
                  </span>
                  <span className="material-symbols-outlined text-[18px]">thermostat</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    71.4°F
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    HVAC optimal target
                  </span>
                </div>
              </div>

              {/* Metric 4: Speed Adherence */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Speed Limit Compliance
                  </span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    100%
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    0 infractions logged
                  </span>
                </div>
              </div>

              {/* Metric 5: Battery / Powertrain */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Bus Battery Health
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    battery_charging_full
                  </span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    98%
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Range: 164 miles left
                  </span>
                </div>
              </div>

              {/* Metric 6: Emergency Status */}
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">
                    Emergency Relays
                  </span>
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <div className="my-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg font-semibold text-on-surface">
                    All Normal
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Sensors verified clear
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
