import React, { useState } from 'react';
import { ViewMode } from '../types';
import { ASSETS } from '../mockData';

interface DriverViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const DriverView: React.FC<DriverViewProps> = ({ onNavigate, onShowToast }) => {
  const [headcount, setHeadcount] = useState(28);
  const [operationalStatus, setOperationalStatus] = useState('on-schedule');
  const [incidentMemo, setIncidentMemo] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [recenterPing, setRecenterPing] = useState(false);

  const handleTransmitUpdate = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      onShowToast(
        'Dispatch Transmit Confirmed',
        `Headcount: ${headcount} | Status: ${operationalStatus.toUpperCase()} sent to Central Console.`
      );
    }, 1000);
  };

  const handleConfirmSos = () => {
    setShowSosModal(false);
    onShowToast(
      'EMERGENCY SOS BROADCASTED',
      'Priority telemetry transmitted to Central Dispatch & Emergency First Responders (37.7749° N, -122.4194° W).'
    );
  };

  const triggerRecenter = () => {
    setRecenterPing(true);
    setZoomLevel(1);
    setTimeout(() => setRecenterPing(false), 1200);
    onShowToast('GPS Relocked', 'Vector canvas centered on Unit #104 at 10Hz.');
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Driver Shift Top Status Banner */}
      <section className="w-full bg-primary-container text-on-primary-container rounded-xl shadow-md p-space-lg mb-space-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="bg-surface-container-lowest/15 px-space-sm py-0.5 rounded-full font-telemetry-sm text-telemetry-sm uppercase tracking-wider text-on-primary">
                UNIT #104
              </span>
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-telemetry-sm text-telemetry-sm font-medium shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                ● On Duty — In Transit
              </span>
              <span className="text-surface-variant font-body-sm text-body-sm">
                Telemetry Ping: Active (0.8s)
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-primary font-semibold tracking-tight">
              Bus #104 — Route 07 Westside Campus
            </h1>
            <p className="font-body-md text-body-md text-surface-container-highest">
              Assigned Dispatch: Central Terminal Bay 4 • Service Window: 07:00 – 16:30
            </p>
          </div>

          <div className="flex items-center gap-space-lg bg-inverse-surface/30 px-space-lg py-space-sm rounded-lg backdrop-blur-md">
            <div className="flex items-center gap-space-md">
              <img
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed"
                src={ASSETS.driverMarcus}
                alt="Marcus Vance"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-surface-container-lowest font-medium">
                  Marcus Vance
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-primary-fixed">
                  Badge: MV-88204
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-surface-container-highest/20 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-surface-container-highest uppercase tracking-wider">
                Shift Started
              </span>
              <span className="font-telemetry-md text-telemetry-md text-on-primary font-medium">
                07:15 AM (UTC-7)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live RFID Scan Notification Streamer */}
      <aside
        aria-label="RFID Scan Stream"
        className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md mb-space-lg flex items-center justify-between flex-wrap gap-space-md border-l-4 border-l-secondary-container"
      >
        <div className="flex items-center gap-space-md">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">nfc</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-secondary font-semibold">
                Latest Tap • Verified Student Pass
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-outline">
                UID: 0x8F4E219A
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              <span className="font-semibold text-primary">Emma Watson</span> (Grade 10) checked in at{' '}
              <span className="font-medium">Oakridge Station</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-md self-end sm:self-center">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-telemetry-sm text-telemetry-sm text-on-surface font-medium">
              14:31:42
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-space-sm py-1 rounded-lg">
            Boarding OK
          </span>
        </div>
      </aside>

      {/* Full Width Live GPS Map Console */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg flex flex-col">
        <div className="p-space-md bg-surface-container-low flex items-center justify-between flex-wrap gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Live Vector GPS Map Tracking
            </span>
            <span className="font-telemetry-sm text-telemetry-sm bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded">
              STREAM L1/L5
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Zoom in"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface shadow-sm transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface shadow-sm transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              onClick={triggerRecenter}
              className={`h-8 px-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center gap-1 text-on-surface shadow-sm font-label-sm text-label-sm transition-colors ${
                recenterPing ? 'text-primary ring-2 ring-primary/40' : ''
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                my_location
              </span>
              Recenter
            </button>
          </div>
        </div>

        {/* Map Viewport */}
        <div className="relative w-full h-[400px] bg-surface-dim overflow-hidden select-none">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-300"
            style={{
              backgroundImage: `url(${ASSETS.mapSanFrancisco})`,
              transform: `scale(${zoomLevel})`,
            }}
          ></div>

          {/* Live Route Overlay SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#2170e4" stopOpacity="0.8"></stop>
                <stop offset="100%" stopColor="#0037b0" stopOpacity="0.95"></stop>
              </linearGradient>
              <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                <feDropShadow dx="0" dy="2" floodColor="#0037b0" floodOpacity="0.3" stdDeviation="3"></feDropShadow>
              </filter>
            </defs>
            {/* Projected Path Lines */}
            <path
              d="M 80,320 L 220,290 L 390,210 L 560,195 L 740,130 L 980,105 L 1200,90"
              fill="none"
              opacity="0.6"
              stroke="#b7c4ff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="8"
            ></path>
            <path
              d="M 80,320 L 220,290 L 390,210 L 560,195"
              fill="none"
              filter="url(#glow)"
              stroke="url(#routeGrad)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
            ></path>
            {/* Waypoint Nodes */}
            <circle cx="80" cy="320" fill="#ffffff" r="5" stroke="#0037b0" strokeWidth="3"></circle>
            <circle cx="220" cy="290" fill="#ffffff" r="5" stroke="#0037b0" strokeWidth="3"></circle>
            <circle cx="390" cy="210" fill="#ffffff" r="5" stroke="#0037b0" strokeWidth="3"></circle>
            <circle cx="740" cy="130" fill="#ffffff" r="5" stroke="#747686" strokeWidth="2"></circle>
            <circle cx="980" cy="105" fill="#ffffff" r="5" stroke="#747686" strokeWidth="2"></circle>
          </svg>

          {/* Active Bus Ping Marker on Canvas */}
          <div className="absolute left-[540px] top-[175px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group">
            <span className="bg-primary text-on-primary text-[10px] font-telemetry-sm px-2 py-0.5 rounded shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
              BUS #104 • 32.4 MPH
            </span>
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-primary/25 animate-ping"></span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform rotate-[184deg]">
                <span className="material-symbols-outlined text-[20px]">navigation</span>
              </div>
            </div>
          </div>

          {/* Next Turn Floating Card */}
          <div className="absolute top-space-md left-space-md bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-lg shadow-md max-w-xs flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">turn_slight_right</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-telemetry-sm text-telemetry-sm text-secondary font-semibold uppercase">
                In 450 Meters
              </span>
              <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                Turn right onto Elmhurst Blvd
              </span>
              <span className="font-body-sm text-body-sm text-outline truncate">
                Next: North Quad Concourse
              </span>
            </div>
          </div>

          {/* Map Layer Badges */}
          <div className="absolute bottom-space-md right-space-md flex items-center gap-space-xs">
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded font-telemetry-sm text-telemetry-sm text-on-surface shadow-sm">
              Traffic: Optimal
            </span>
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded font-telemetry-sm text-telemetry-sm text-primary font-medium shadow-sm">
              RTK Level: Fix
            </span>
          </div>
        </div>

        {/* Monospace Coordinates & Telemetry Strip */}
        <div className="bg-surface-container-low px-space-md py-space-sm flex items-center justify-between flex-wrap gap-y-space-xs gap-x-space-lg text-on-surface-variant font-telemetry-sm text-telemetry-sm">
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">LAT</span>
            <span className="text-on-surface font-medium">37.7749° N</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">LNG</span>
            <span className="text-on-surface font-medium">-122.4194° W</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">SPEED</span>
            <span className="text-secondary font-semibold">32.4 mph</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">ALTITUDE</span>
            <span className="text-on-surface font-medium">48.2 m</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">HEADING</span>
            <span className="text-on-surface font-medium">184° S (SSE)</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="text-outline uppercase">DILUTION</span>
            <span className="text-on-surface font-medium">0.8 PDOP</span>
          </div>
        </div>
      </section>

      {/* Side-by-Side Sensor & Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-lg">
        {/* GPS Fix & Quality Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  GPS Fix & Signal Quality
                </h2>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  Receiver: U-blox NEO-M9N Dual-Band
                </span>
              </div>
            </div>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container font-telemetry-sm text-telemetry-sm text-primary font-medium">
              3D High-Precision Fix
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md my-space-md">
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">Satellites</span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold mt-1">
                16 <span className="font-telemetry-sm text-telemetry-sm text-outline font-normal">/ 24</span>
              </span>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">HDOP Index</span>
              <span className="font-telemetry-lg text-telemetry-lg text-secondary font-semibold mt-1">
                0.80
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-secondary mt-2">
                Optimal Range
              </span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">Fix Type</span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold mt-1">
                3D DGPS
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-outline mt-2">
                RTCM v3.2
              </span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">Latency</span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold mt-1">
                120ms
              </span>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-secondary-container h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs text-outline font-telemetry-sm text-telemetry-sm">
            <span>Antenna Voltage: 3.32V (Nominal)</span>
            <span>Epoch: 1849202 • No Cycle Slips</span>
          </div>
        </div>

        {/* MPU-6050 6-Axis Motion Sensor Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">vibration</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  MPU-6050 Motion & Telemetry
                </h2>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  Inertial Measurement Unit (I2C Bus 0x68)
                </span>
              </div>
            </div>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container-low font-telemetry-sm text-telemetry-sm text-secondary font-medium">
              Normal Vibration
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md my-space-md">
            {/* Accelerometer */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Linear Accel (g-force)
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Filter: 21Hz</span>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">X (Lateral):</span>
                  <span className="text-on-surface font-medium">+0.04 g</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '52%' }}></div>
                </div>
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">Y (Longitudinal):</span>
                  <span className="text-on-surface font-medium">-0.12 g</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '44%' }}></div>
                </div>
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">Z (Vertical):</span>
                  <span className="text-on-surface font-medium">+0.98 g</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>

            {/* Gyroscope */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Gyro Angular Rate
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">DLPF: Enabled</span>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">Yaw Rate:</span>
                  <span className="text-on-surface font-medium">0.20 °/s</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '51%' }}></div>
                </div>
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">Pitch Angle:</span>
                  <span className="text-on-surface font-medium">-1.10 °</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
                <div className="flex items-center justify-between font-telemetry-sm text-telemetry-sm">
                  <span className="text-outline">Roll Angle:</span>
                  <span className="text-on-surface font-medium">+0.40 °</span>
                </div>
                <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '53%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs text-outline font-telemetry-sm text-telemetry-sm">
            <span>Temp: 34.6°C (Sensor Core)</span>
            <span>Impact Detection: Calibrated (0 Events)</span>
          </div>
        </div>
      </div>

      {/* Operational Section: Status Updater & Route Timeline Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
        {/* Status Updater Form (7 Cols) */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Driver Status & Dispatch Controls
                </h2>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm bg-surface-container px-space-xs py-0.5 rounded text-on-surface-variant">
                AUTO-SYNC ON
              </span>
            </div>

            <form className="space-y-space-md" onSubmit={(e) => e.preventDefault()}>
              {/* Status Dropdown */}
              <div className="flex flex-col gap-space-xs">
                <label
                  className="font-label-md text-label-md font-medium text-on-surface"
                  htmlFor="route-status"
                >
                  Transit Operational Status
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-md py-space-sm font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary"
                    id="route-status"
                    value={operationalStatus}
                    onChange={(e) => setOperationalStatus(e.target.value)}
                  >
                    <option value="on-schedule">On Schedule — Normal Traffic Flow</option>
                    <option value="minor-delay">Minor Traffic Delay (+5 to 10 mins)</option>
                    <option value="severe-delay">Severe Delay • Road Closure / Obstruction</option>
                    <option value="final-terminal">At Final Terminal — Deboarding Completed</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Passenger Headcount Interactive Counter */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between">
                  <span>Onboard Passenger Headcount</span>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Legal Max Capacity: 44 Seats
                  </span>
                </label>
                <div className="flex items-center gap-space-md bg-surface-container-low p-space-xs rounded-lg">
                  <button
                    className="w-10 h-10 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center font-headline-md text-headline-md shadow-sm transition-colors active:scale-95"
                    onClick={() => setHeadcount((c) => Math.max(0, c - 1))}
                    type="button"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center flex items-center justify-center gap-space-xs">
                    <span className="font-telemetry-lg text-telemetry-lg font-bold text-on-surface">
                      {headcount}
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">
                      passengers aboard
                    </span>
                  </div>
                  <button
                    className="w-10 h-10 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center font-headline-md text-headline-md shadow-sm transition-colors active:scale-95"
                    onClick={() => setHeadcount((c) => Math.min(44, c + 1))}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Driver Notes */}
              <div className="flex flex-col gap-space-xs">
                <label
                  className="font-label-md text-label-md font-medium text-on-surface"
                  htmlFor="driver-notes"
                >
                  Dispatch Logs / Transit Incident Memo
                </label>
                <textarea
                  className="w-full bg-surface-container-low text-on-surface rounded-lg p-space-md font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary"
                  id="driver-notes"
                  value={incidentMemo}
                  onChange={(e) => setIncidentMemo(e.target.value)}
                  placeholder="Input any traffic, weather, or student behavior observations for transit control..."
                  rows={3}
                ></textarea>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-lg">
            <button
              onClick={handleTransmitUpdate}
              disabled={isTransmitting}
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-space-sm px-space-lg rounded-lg shadow-sm flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isTransmitting ? 'animate-spin' : ''
                }`}
              >
                {isTransmitting ? 'sync' : 'publish'}
              </span>
              <span>{isTransmitting ? 'Transmitting...' : 'Transmit Update'}</span>
            </button>
            <button
              onClick={() => setShowSosModal(true)}
              className="bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md py-space-sm px-space-lg rounded-lg shadow-md flex items-center justify-center gap-space-xs transition-all active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] animate-pulse">
                sos
              </span>
              <span>Emergency SOS Alert</span>
            </button>
          </div>
        </section>

        {/* Route Timeline Stepper (5 Cols) */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">
                linear_scale
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Active Itinerary
              </h2>
            </div>
            <span className="font-telemetry-sm text-telemetry-sm text-secondary font-medium">
              Stop 3 of 6
            </span>
          </div>

          <div className="relative flex-1 flex flex-col justify-between py-space-xs pl-2 space-y-3">
            {/* Connecting Line */}
            <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-surface-container-high pointer-events-none"></div>

            {/* Stop 1: Completed */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary z-10 shrink-0">
                <span className="material-symbols-outlined text-[18px] font-bold">check</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-surface-container-low/50 p-space-xs px-space-sm rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-medium line-through opacity-75">
                    Central Terminal Bay 4
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline">
                    Dept: 07:18 AM • +12 onboard
                  </p>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">DONE</span>
              </div>
            </div>

            {/* Stop 2: Completed */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary z-10 shrink-0">
                <span className="material-symbols-outlined text-[18px] font-bold">check</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-surface-container-low/50 p-space-xs px-space-sm rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-medium line-through opacity-75">
                    Oakridge Station
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline">
                    Dept: 07:31 AM • +9 onboard
                  </p>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">DONE</span>
              </div>
            </div>

            {/* Stop 3: Current / Approaching */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center z-10 shrink-0 shadow-md">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-on-primary"></span>
                </span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-surface-container-high p-space-sm rounded-lg border border-primary/20">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <p className="font-label-md text-label-md text-on-surface font-bold">
                      North Quad Concourse
                    </p>
                    <span className="px-space-xs py-0.5 rounded text-[10px] bg-primary text-on-primary font-telemetry-sm">
                      CURRENT
                    </span>
                  </div>
                  <p className="font-telemetry-sm text-telemetry-sm text-secondary font-medium mt-0.5">
                    Arriving in approx 3 mins (0.8 mi)
                  </p>
                </div>
                <span className="font-telemetry-md text-telemetry-md text-secondary font-bold">
                  07:44
                </span>
              </div>
            </div>

            {/* Stop 4: Upcoming */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline z-10 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              </div>
              <div className="flex-1 flex items-center justify-between p-space-xs px-space-sm rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-medium">
                    Highland Arts District
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline">
                    ETA: 07:52 AM • Est. 5 drop-offs
                  </p>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  SCHEDULED
                </span>
              </div>
            </div>

            {/* Stop 5: Upcoming */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline z-10 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              </div>
              <div className="flex-1 flex items-center justify-between p-space-xs px-space-sm rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-medium">
                    STEM Complex South
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline">
                    ETA: 08:04 AM • Transfer hub
                  </p>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  SCHEDULED
                </span>
              </div>
            </div>

            {/* Stop 6: Final Terminal */}
            <div className="relative flex items-start gap-space-md group">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline z-10 shrink-0">
                <span className="material-symbols-outlined text-[16px]">flag</span>
              </div>
              <div className="flex-1 flex items-center justify-between p-space-xs px-space-sm rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-medium">
                    Westside Secondary Campus
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline">
                    ETA: 08:15 AM • Final Terminal
                  </p>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  DESTINATION
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Shift Trip Logs Table */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg overflow-hidden">
        <div className="flex items-center justify-between mb-space-md flex-wrap gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[22px]">
              history
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Today's Completed Shift Logs
            </h2>
          </div>
          <div className="flex items-center gap-space-xs text-outline font-telemetry-sm text-telemetry-sm">
            <span>Logged Trips: 4</span>
            <span>• Total Onboarders: 142</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-outline tracking-wider">
                <th className="py-space-sm px-space-md rounded-l-lg">Leg ID</th>
                <th className="py-space-sm px-space-md">Route Description</th>
                <th className="py-space-sm px-space-md">Departure</th>
                <th className="py-space-sm px-space-md">Arrival</th>
                <th className="py-space-sm px-space-md">Total Riders</th>
                <th className="py-space-sm px-space-md">Duration</th>
                <th className="py-space-sm px-space-md rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-container">
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm font-medium text-primary">
                  LEG-4021
                </td>
                <td className="py-space-sm px-space-md font-medium">
                  Depot South → East Metro Station
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  05:45 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  06:18 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  34 students
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  33 mins
                </td>
                <td className="py-space-sm px-space-md">
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-space-sm py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    On Time
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm font-medium text-primary">
                  LEG-4022
                </td>
                <td className="py-space-sm px-space-md font-medium">
                  East Metro → Crestview High North
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  06:25 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  06:58 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  42 students
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  33 mins
                </td>
                <td className="py-space-sm px-space-md">
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-space-sm py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    On Time
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm font-medium text-primary">
                  LEG-4023
                </td>
                <td className="py-space-sm px-space-md font-medium">
                  Crestview High → Central Terminal Bay 4
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  07:02 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  07:14 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  11 students
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm">
                  12 mins
                </td>
                <td className="py-space-sm px-space-md">
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                    +2m Transit
                  </span>
                </td>
              </tr>
              <tr className="bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm font-bold text-secondary">
                  LEG-4024
                </td>
                <td className="py-space-sm px-space-md font-medium text-on-surface">
                  Central Terminal → Westside Campus (Current)
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                  07:18 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-secondary font-medium">
                  Est. 08:15 AM
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm font-semibold">
                  {headcount} onboard
                </td>
                <td className="py-space-sm px-space-md font-telemetry-sm text-telemetry-sm text-secondary">
                  En Route
                </td>
                <td className="py-space-sm px-space-md">
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    Active Leg
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SOS Emergency Modal Confirmation */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 border-2 border-error">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-4xl animate-bounce">
                warning
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold">
                  CONFIRM PRIORITY SOS DISPATCH
                </h3>
                <p className="text-xs text-outline">
                  Direct cellular override to Municipal Central and 911 Emergency Services
                </p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface mb-6">
              This will trigger an instantaneous emergency alert to Fleet Central, transmit current telemetry, and contact regional emergency services for Unit #104 at 37.7749° N, -122.4194° W.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 text-sm rounded-lg hover:bg-surface-container text-on-surface"
                type="button"
              >
                Cancel / False Alarm
              </button>
              <button
                onClick={handleConfirmSos}
                className="px-5 py-2.5 rounded-lg bg-error text-white font-semibold shadow-lg hover:bg-on-error-container transition-all"
                type="button"
              >
                Confirm Priority SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
