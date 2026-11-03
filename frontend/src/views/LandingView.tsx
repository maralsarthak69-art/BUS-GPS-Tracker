import React, { useState } from 'react';
import { ViewMode } from '../types';
import { ASSETS } from '../mockData';

interface LandingViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [selectedBus, setSelectedBus] = useState<string | null>('104');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full bg-surface min-h-screen">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 backdrop-blur-md shadow-sm border-b border-surface-container/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <img
              alt="BusTrack Logo"
              className="w-9 h-9 object-contain"
              src={ASSETS.logo}
            />
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface flex items-center gap-1.5">
              BusTrack
              <span className="font-telemetry-sm text-telemetry-sm px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-medium">
                IoT v4.2
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 font-label-md text-label-md text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#features">
              Features
            </a>
            <a className="hover:text-primary transition-colors flex items-center gap-1.5" href="#live-tracking">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Live Tracking
            </a>
            <a className="hover:text-primary transition-colors" href="#portals">
              Portals
            </a>
            <button 
              onClick={() => onNavigate('contact')}
              className="hover:text-primary transition-colors" 
              type="button"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex px-3.5 py-1.5 text-label-sm font-label-sm rounded bg-primary-container text-white hover:bg-secondary-container transition-all"
              type="button"
            >
              Live Ops
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-label-md font-label-md rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold transition-all shadow-sm"
              type="button"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full bg-[#0F172A] text-[#F8FAFC] pt-16 pb-28 overflow-hidden">
        {/* Ambient Tech Glows & Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        ></div>
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#1D4ED8] rounded-full blur-[130px] opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-[#0058BE] rounded-full blur-[150px] opacity-25 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* High-Precision Telemetry Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-telemetry-sm text-telemetry-sm text-surface-container tracking-wider uppercase font-medium">
              Telemetry Protocol Active • 99.998% Uptime
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-headline-xl text-headline-xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight max-w-4xl leading-tight">
            Know where every bus is.<br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Right now.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 font-body-lg text-body-lg text-slate-300 max-w-2xl text-center leading-relaxed font-normal">
            Sub-second IoT GPS telemetry, automated RFID student verification, and instant fleet safety analytics in one unified platform.
          </p>

          {/* CTA Action Group */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded bg-primary-container text-white font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all shadow-md group"
              type="button"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded bg-white/10 text-white font-label-md text-label-md font-semibold hover:bg-white/20 backdrop-blur-sm transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Live Floating Map Interactive Preview Card */}
          <div
            className="relative mt-16 w-full max-w-5xl rounded-xl bg-surface-container-lowest p-3 shadow-2xl text-on-surface text-left"
            id="live-tracking"
          >
            {/* Mock Map Container with SVG Grid Routes */}
            <div className="relative w-full h-[360px] md:h-[420px] rounded-lg bg-[#0B1528] overflow-hidden select-none">
              {/* Background SVG Vector Road Network Map */}
              <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="road-grid" patternUnits="userSpaceOnUse" width="60" height="60">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1E293B" strokeWidth="1.5"></path>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#road-grid)"></rect>
                {/* Transit Corridors */}
                <path
                  d="M-50,220 C180,240 240,110 520,130 C760,150 820,310 1100,280"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  strokeOpacity="0.7"
                ></path>
                <path
                  d="M120,-30 C160,160 380,260 480,440"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3"
                  strokeOpacity="0.5"
                ></path>
                <path
                  d="M600,-40 C650,200 840,250 940,460"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeOpacity="0.6"
                ></path>
              </svg>

              {/* Top Status Overlay Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white shadow-md pointer-events-auto backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-telemetry-sm text-telemetry-sm font-semibold tracking-wide text-emerald-400">
                    ● LIVE DISPATCH
                  </span>
                  <span className="text-slate-400 font-telemetry-sm text-telemetry-sm">
                    | 10 Hz Telemetry
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg text-slate-300 font-telemetry-sm text-telemetry-sm pointer-events-auto backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm text-sky-400">
                    satellite_alt
                  </span>
                  <span>Constellation GPS: Fixed (12 Sats)</span>
                </div>
              </div>

              {/* Pulsing Interactive Marker: Bus #104 */}
              <div
                className="absolute top-[28%] left-[24%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                onClick={() => setSelectedBus('104')}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-ping"></div>
                  <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-sm">directions_bus</span>
                  </div>
                </div>
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-slate-900 text-white font-telemetry-sm text-telemetry-sm whitespace-nowrap shadow-md">
                  <span className="font-semibold text-sky-300">Bus #104</span> • 26 mph
                </div>
              </div>

              {/* Pulsing Interactive Marker: Bus #208 */}
              <div
                className="absolute top-[52%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                onClick={() => setSelectedBus('208')}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute w-12 h-12 rounded-full bg-emerald-500/25 animate-ping"
                    style={{ animationDelay: '400ms' }}
                  ></div>
                  <div className="relative w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-sm">directions_bus</span>
                  </div>
                </div>
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-slate-900 text-white font-telemetry-sm text-telemetry-sm whitespace-nowrap shadow-md">
                  <span className="font-semibold text-emerald-300">Bus #208</span> • On Route 4B
                </div>
              </div>

              {/* Pulsing Interactive Marker: Bus #312 */}
              <div
                className="absolute top-[68%] left-[78%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                onClick={() => setSelectedBus('312')}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute w-12 h-12 rounded-full bg-amber-500/20 animate-ping"
                    style={{ animationDelay: '800ms' }}
                  ></div>
                  <div className="relative w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-sm">directions_bus</span>
                  </div>
                </div>
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-slate-900 text-white font-telemetry-sm text-telemetry-sm whitespace-nowrap shadow-md">
                  <span className="font-semibold text-amber-300">Bus #312</span> • Stop Approaching
                </div>
              </div>

              {/* Interactive Bus Details Floating Overlay on Selection */}
              {selectedBus && (
                <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg border border-slate-700/60 shadow-lg text-xs max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sky-400 font-telemetry-sm">
                      ACTIVE TELEMETRY: BUS #{selectedBus}
                    </span>
                    <button
                      onClick={() => setSelectedBus(null)}
                      className="text-slate-400 hover:text-white"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-slate-300">
                    {selectedBus === '104' && 'Route 07 Westside Campus • Lat: 37.7749° N, Lng: -122.4194° W'}
                    {selectedBus === '208' && 'Route 04 West Valley Loop • Lat: 37.7812° N, Lng: -122.4089° W'}
                    {selectedBus === '312' && 'Route 12 Northside Express • Lat: 37.7654° N, Lng: -122.4210° W'}
                  </p>
                  <button
                    onClick={() => onNavigate('driver-portal')}
                    className="mt-2 text-primary-fixed text-[11px] font-semibold hover:underline block"
                    type="button"
                  >
                    Launch Driver HUD for this Unit →
                  </button>
                </div>
              )}
            </div>

            {/* Real-Time Telemetry Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-2 bg-surface-container-low rounded-lg p-3">
              <div className="flex flex-col px-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Active Buses
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-telemetry-lg text-telemetry-lg font-bold text-on-surface">
                    42
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-emerald-700 font-medium">
                    98% Deployment
                  </span>
                </div>
              </div>
              <div className="flex flex-col px-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Students On Board
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-telemetry-lg text-telemetry-lg font-bold text-on-surface">
                    864
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-primary font-medium">
                    RFID Tagged
                  </span>
                </div>
              </div>
              <div className="flex flex-col px-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Avg Speed
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-telemetry-lg text-telemetry-lg font-bold text-on-surface">
                    28.4
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant font-medium">
                    mph
                  </span>
                </div>
              </div>
              <div className="flex flex-col px-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  GPS Constellation Fix
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-telemetry-lg text-telemetry-lg font-bold text-emerald-600">
                    100%
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-emerald-700 font-medium">
                    Optimal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-surface py-20" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <span className="font-telemetry-sm text-telemetry-sm text-primary uppercase tracking-wider font-semibold">
                Engineered Precision
              </span>
              <h2 className="mt-2 font-headline-lg text-headline-lg sm:text-4xl text-on-surface font-bold tracking-tight">
                Integrated Hardware & Cloud Infrastructure
              </h2>
            </div>
            <p className="mt-4 md:mt-0 font-body-md text-body-md text-on-surface-variant max-w-md">
              Zero-jitter IoT nodes communicate directly with local transit command centres, providing continuous audit trails for every transit mile.
            </p>
          </div>

          {/* 6-Card Grid (3-column layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">my_location</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                1. Real-Time GPS
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Sub-second interval tracking with multi-band RTK positioning. Coordinates stream at 10Hz to eliminate position lag in urban canyons.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>±0.8m accuracy</span>
                <span>•</span>
                <span>Instant sync</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">badge</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                2. RFID Check-In
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Contactless student boarding & offboarding alerts. Automated cryptographic verification confirms pupil presence before wheels rotate.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>Parent SMS Dispatch</span>
                <span>•</span>
                <span>NFC 13.56 MHz</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">notifications_active</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                3. Instant Alerts
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Geofence breaches, speeding thresholds, and delay notifications delivered with sub-second WebSocket triggers straight to school admins.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>&lt;200ms trigger</span>
                <span>•</span>
                <span>Multi-channel</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                4. Telemetry Reports
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Integrated MPU-6050 6-axis vibration analysis, velocity profiles, and idle duration audits. Maintain proactive predictive engine maintenance.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>OBD-II Stream</span>
                <span>•</span>
                <span>G-force spikes</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">health_and_safety</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                5. Safety Monitoring
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Emergency physical SOS beacons, automated route deviation warnings, and collision impact detectors linked with emergency service feeds.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>SOS Override</span>
                <span>•</span>
                <span>Failover cellular</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-5">
                <span className="material-symbols-outlined text-2xl">alt_route</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                6. Route Management
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                Dynamic AI scheduling and instant stop reordering. Automatically adjust pick-up sequences according to student absenteeism and gridlock.
              </p>
              <div className="flex items-center gap-2 font-telemetry-sm text-telemetry-sm text-primary font-medium">
                <span>Dynamic ETA</span>
                <span>•</span>
                <span>Traffic-aware</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Portals Directory Section */}
      <section className="w-full bg-surface-container-low py-16" id="portals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="font-telemetry-sm text-telemetry-sm text-primary uppercase font-semibold">
                Access Portals
              </span>
              <h3 className="mt-2 font-headline-lg text-headline-lg text-on-surface font-bold">
                Dedicated Command Stations
              </h3>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Seamless role-based interfaces designed explicitly for school dispatchers, transit drivers, and parents on the go.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <button
                onClick={() => onNavigate('admin-portal')}
                className="flex flex-col items-center justify-center p-4 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-1 group-hover:scale-110 transition-transform">
                  admin_panel_settings
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  District Admin
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  Full Control
                </span>
              </button>

              <button
                onClick={() => onNavigate('driver-portal')}
                className="flex flex-col items-center justify-center p-4 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-1 group-hover:scale-110 transition-transform">
                  airline_seat_recline_normal
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Driver HUD
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  Turn-by-turn
                </span>
              </button>

              <button
                onClick={() => onNavigate('student-portal')}
                className="flex flex-col items-center justify-center p-4 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-1 group-hover:scale-110 transition-transform">
                  family_restroom
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Parent App
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  Live Arrival
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0F172A] text-slate-300 pt-16 pb-12" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3-Column Footer Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-slate-800">
            {/* Col 1: Brand & Description */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  alt="BusTrack Logo"
                  className="w-8 h-8 object-contain"
                  src={ASSETS.logo}
                />
                <span className="font-headline-sm text-headline-sm text-white font-bold tracking-tight">
                  BusTrack
                </span>
              </div>
              <p className="font-body-md text-body-md text-slate-400 leading-relaxed pr-6">
                Pioneering the next horizon of student transit safety. Unified hardware telemetry, RFID verification, and automated municipal bus routing.
              </p>
              <div className="flex items-center space-x-4 pt-2 text-slate-400">
                <span className="font-telemetry-sm text-telemetry-sm text-slate-400">
                  SOC2 Type II Certified • ISO 27001
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="flex flex-col space-y-3">
              <span className="font-label-md text-label-md text-white font-semibold uppercase tracking-wider">
                Quick Navigation
              </span>
              <ul className="space-y-2.5 font-body-sm text-body-sm text-slate-400">
                <li>
                  <a className="hover:text-white transition-colors" href="#features">
                    IoT Telemetry Stack
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#live-tracking">
                    Live Simulation Canvas
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('contact')} 
                    className="hover:text-white transition-colors text-left"
                    type="button"
                  >
                    Safety Protocols & SOS
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('admin-portal')} 
                    className="hover:text-white transition-colors text-left"
                    type="button"
                  >
                    FERPA & Student Privacy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('dashboard')} 
                    className="hover:text-white transition-colors text-left"
                    type="button"
                  >
                    Developer API & Webhooks
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Portals Directory & Contact */}
            <div className="flex flex-col space-y-3">
              <span className="font-label-md text-label-md text-white font-semibold uppercase tracking-wider">
                Portals Directory
              </span>
              <div className="flex flex-col space-y-2 font-body-sm text-body-sm text-slate-400">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white flex items-center justify-between text-left"
                  type="button"
                >
                  <span>Municipal Fleet Dispatch</span>
                  <span className="font-telemetry-sm text-telemetry-sm text-sky-400">Console →</span>
                </button>
                <button
                  onClick={() => onNavigate('driver-portal')}
                  className="hover:text-white flex items-center justify-between text-left"
                  type="button"
                >
                  <span>On-Bus Driver Terminal</span>
                  <span className="font-telemetry-sm text-telemetry-sm text-sky-400">Login →</span>
                </button>
                <button
                  onClick={() => onNavigate('student-portal')}
                  className="hover:text-white flex items-center justify-between text-left"
                  type="button"
                >
                  <span>Parent Guardian Web</span>
                  <span className="font-telemetry-sm text-telemetry-sm text-sky-400">Open →</span>
                </button>
              </div>
              <div className="pt-4 flex flex-col space-y-1">
                <span className="font-label-sm text-label-sm text-slate-400 uppercase">
                  Emergency Dispatch Operations
                </span>
                <span className="font-telemetry-md text-telemetry-md text-white font-medium">
                  1-800-BUSTRACK (24/7)
                </span>
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-slate-400">
            <div>
              © 2026 BusTrack Transit Systems Inc. All rights reserved.
            </div>
            <div className="flex space-x-6 text-slate-400">
              <a className="hover:text-slate-300" href="#privacy">Privacy Policy</a>
              <a className="hover:text-slate-300" href="#terms">Terms of Service</a>
              <a className="hover:text-slate-300" href="#security">Security Architecture</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Watch Demo Simulation Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    BusTrack Live Hardware Simulator
                  </h3>
                  <span className="text-xs text-outline">Simulating dual-band RTK GPS telemetry at 10Hz</span>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-outline"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-telemetry-sm text-xs space-y-1 overflow-x-auto">
                <p className="text-emerald-400 font-semibold">[09:41:22.102] CONNECTED TO MQTT BROKER tls://grid09.bustrack.internal:8883</p>
                <p className="text-sky-300">[09:41:22.215] SUB &gt; /bus/104/telemetry: LAT 37.7749 LNG -122.4194 SPD 32.4mph</p>
                <p className="text-slate-300">[09:41:22.340] RFID TAP UID=0x8F4E219A PASS=VERIFIED STU=Emma Watson</p>
                <p className="text-emerald-400">[09:41:22.408] MPU6050 VIB=0.04g NORMAL • BATTERY=12.4V (AUX)</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    onNavigate('driver-portal');
                  }}
                  className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-2xl mb-1">directions_bus</span>
                  <div className="font-label-md text-label-md font-semibold text-on-surface">Driver HUD</div>
                  <div className="text-[11px] text-outline">Live turn-by-turn</div>
                </button>
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    onNavigate('student-portal');
                  }}
                  className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-secondary text-2xl mb-1">school</span>
                  <div className="font-label-md text-label-md font-semibold text-on-surface">Student Portal</div>
                  <div className="text-[11px] text-outline">Live arrival & pass</div>
                </button>
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    onNavigate('dashboard');
                  }}
                  className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary-container text-2xl mb-1">grid_view</span>
                  <div className="font-label-md text-label-md font-semibold text-on-surface">Fleet Dispatch</div>
                  <div className="text-[11px] text-outline">Command overview</div>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-container">
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                type="button"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
