import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, FleetTask, RfidTapLog } from '../types';
import { INITIAL_RFID_LOGS, INITIAL_TASKS, INITIAL_BUSES } from '../mockData';
import { useTelemetry } from '../hooks/useTelemetry';

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<FleetTask[]>(INITIAL_TASKS);
  const [rfidLogs, setRfidLogs] = useState<RfidTapLog[]>(INITIAL_RFID_LOGS);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // ── Live telemetry ──────────────────────────────────────────────────────────
  const { data: telemetry, loading, error, lastUpdated } = useTelemetry();

  // Derive KPIs from live data; fall back to mock values when offline
  const activeBuses   = telemetry.length > 0 ? telemetry.filter(t => t.status !== 'Offline').length : 38;
  const totalBuses    = telemetry.length > 0 ? telemetry.length : 42;
  const totalPsg      = telemetry.length > 0 ? telemetry.reduce((s, t) => s + (t.passenger_count ?? 0), 0) : 1248;
  const avgSats       = telemetry.length > 0
    ? (telemetry.reduce((s, t) => s + (t.satellites ?? 0), 0) / telemetry.length).toFixed(1)
    : '14.2';
  const openAlerts    = telemetry.length > 0 ? telemetry.filter(t => t.status === 'Alert' || t.status === 'Warning').length : 3;

  // Map live records to the BusTelemetry shape the table expects, or fall back to mock
  const liveBusList = telemetry.length > 0
    ? telemetry.map(t => ({
        id: t.bus_id,
        route: t.route,
        driver: t.driver,
        driverPhoto: '',
        speed: t.speed_kmh != null ? `${t.speed_kmh.toFixed(1)} km/h` : '—',
        passengers: `${t.passenger_count} psg`,
        satellites: t.satellites ?? 0,
        status: (t.status === 'Alert' ? 'Delayed' : t.status === 'Offline' ? 'Idle Depot' : t.status === 'Warning' ? 'At Stop' : 'In Transit') as any,
        delayText: t.status === 'Alert' ? 'Speed!' : undefined,
      }))
    : INITIAL_BUSES;

  // When a new RFID scan arrives from live data, prepend it to the feed
  const prevRfidRef = useRef<string | null>(null);
  useEffect(() => {
    if (telemetry.length === 0) return;
    const latest = telemetry.find(t => t.rfid_uid && t.rfid_uid !== 'None');
    if (!latest || !latest.rfid_uid) return;
    const key = `${latest.bus_id}-${latest.rfid_uid}-${latest.timestamp}`;
    if (key === prevRfidRef.current) return;
    prevRfidRef.current = key;
    const newLog: RfidTapLog = {
      id: String(Date.now()),
      cardUid: latest.rfid_uid,
      studentName: latest.rfid_name ?? 'Unknown Passenger',
      studentId: '',
      station: latest.bus_id,
      timestamp: 'Just now',
      action: 'Boarded',
    };
    setRfidLogs(prev => [newLog, ...prev.slice(0, 5)]);
    onShowToast('RFID Scan — Live', `${newLog.studentName} boarded ${latest.bus_id}`);
  }, [telemetry]);

  // Filter fleet table
  const q = searchQuery.toLowerCase();
  const filteredBuses = liveBusList.filter(b =>
    b.id.toLowerCase().includes(q) ||
    b.route.toLowerCase().includes(q) ||
    b.driver.toLowerCase().includes(q)
  );

  // UTC clock
  const [utc, setUtc] = useState('');
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setUtc(`${String(n.getUTCHours()).padStart(2,'0')}:${String(n.getUTCMinutes()).padStart(2,'0')}:${String(n.getUTCSeconds()).padStart(2,'0')} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) onShowToast('Task Completed', `"${t.title}" marked as resolved.`);
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const task: FleetTask = {
      id: String(Date.now()),
      title: newTaskTitle,
      assignee: newTaskAssignee || 'Unassigned Field Technician',
      priority: newTaskPriority,
      dueTime: '17:00 UTC',
      completed: false,
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setIsTaskModalOpen(false);
    onShowToast('Fleet Task Queued', `Assigned to ${task.assignee}`);
  };

  const simulateNewRfidTap = () => {
    const names = [
      { name: 'Marcus Vance Jr.', id: '#88291', stop: 'Lincoln High North' },
      { name: 'Chloe Dubois', id: '#91044', stop: 'Oakridge Station' },
      { name: "Liam O'Connor", id: '#62910', stop: 'Metro Central Hub' },
    ];
    const pick = names[Math.floor(Math.random() * names.length)];
    const hex = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
    ).join(' ');
    const newLog: RfidTapLog = {
      id: String(Date.now()),
      cardUid: hex,
      studentName: pick.name,
      studentId: pick.id,
      station: pick.stop,
      timestamp: 'Just now',
      action: Math.random() > 0.3 ? 'Boarded' : 'Alighted',
    };
    setRfidLogs([newLog, ...rfidLogs.slice(0, 5)]);
    onShowToast('RFID Scan Verified', `${pick.name} ${newLog.action} at ${pick.stop}`);
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Operational Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md py-space-lg mb-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Operations Fleet Overview
            </h1>
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-sm py-0.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                {!error && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-error' : 'bg-secondary'}`}></span>
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant font-medium">
                {error ? '⚠ Backend Offline' : loading ? 'Connecting…' : `Live · ${utc}`}
              </span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time telemetry feeds, student ridership, and ESP32 gateway health monitor.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => onShowToast('Export Fleet CSV', 'Generated telemetry report for 42 deployed buses.')}
            className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-on-surface px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">
              file_download
            </span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow hover:bg-primary transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>+ New Fleet Task</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Accent Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
        {/* Active Buses */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
          <div className="flex items-center justify-between pl-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
              Active Buses
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">
              directions_bus
            </span>
          </div>
          <div className="pl-space-xs my-space-xs">
            <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              {loading ? '…' : activeBuses} <span className="font-headline-md text-headline-md text-outline">/ {totalBuses}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs pl-space-xs font-telemetry-sm text-telemetry-sm text-secondary">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+2 from yesterday</span>
          </div>
        </div>

        {/* Students On Board */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
          <div className="flex items-center justify-between pl-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
              Students On Board
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">
              badge
            </span>
          </div>
          <div className="pl-space-xs my-space-xs">
            <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              {loading ? '…' : totalPsg.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-space-xs pl-space-xs font-telemetry-sm text-telemetry-sm text-secondary">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>94% check-in rate</span>
          </div>
        </div>

        {/* Avg Satellites */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container"></div>
          <div className="flex items-center justify-between pl-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
              Avg Satellites
            </span>
            <span className="material-symbols-outlined text-secondary-container text-[20px]">
              satellite_alt
            </span>
          </div>
          <div className="pl-space-xs my-space-xs">
            <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              {loading ? '…' : avgSats}
            </div>
          </div>
          <div className="flex items-center gap-space-xs pl-space-xs font-telemetry-sm text-telemetry-sm text-primary">
            <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
            <span>Signal Strong (&gt;12 lock)</span>
          </div>
        </div>

        {/* Open Alerts */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
          <div className="flex items-center justify-between pl-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
              Open Alerts
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">
              warning
            </span>
          </div>
          <div className="pl-space-xs my-space-xs">
            <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              {loading ? '…' : openAlerts}
            </div>
          </div>
          <div className="flex items-center gap-space-xs pl-space-xs font-telemetry-sm text-telemetry-sm text-error">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
            <span>1 critical delay reported</span>
          </div>
        </div>
      </div>

      {/* Primary Split Grid: 2/3 and 1/3 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">
        {/* Left Column: Operations Feeds & Core Telemetry (2/3) */}
        <div className="xl:col-span-2 flex flex-col gap-space-lg">
          {/* Live Fleet Table Panel */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Control Toolbar */}
            <div className="p-space-md flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  commute
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Active Fleet Stream
                </span>
                <span className="font-telemetry-sm text-telemetry-sm bg-primary-fixed text-on-primary-fixed px-space-xs py-0.5 rounded-full font-medium">
                  {filteredBuses.length} Filtered
                </span>
              </div>
              <div className="flex items-center gap-space-sm flex-1 max-w-xs">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    className="w-full pl-8 pr-12 py-1.5 text-body-sm font-body-sm bg-surface-container-lowest rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                    placeholder="Search route, driver, bus..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute right-2 top-2 font-telemetry-sm text-telemetry-sm text-outline-variant bg-surface-container px-1 rounded">
                    ⌘K
                  </span>
                </div>
              </div>
            </div>

            {/* Density-Optimized Fleet Data Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-space-sm px-space-md font-semibold">Bus ID</th>
                    <th className="py-space-sm px-space-md font-semibold">Assigned Route</th>
                    <th className="py-space-sm px-space-md font-semibold">Operator</th>
                    <th className="py-space-sm px-space-md font-semibold">Telemetry Speed</th>
                    <th className="py-space-sm px-space-md font-semibold">Psg</th>
                    <th className="py-space-sm px-space-md font-semibold">GNSS Lock</th>
                    <th className="py-space-sm px-space-md font-semibold">Live State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm font-body-sm">
                  {filteredBuses.map((bus) => (
                    <tr
                      key={bus.id}
                      onClick={() => onNavigate('driver-portal')}
                      className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                      title="Click to view Driver HUD"
                    >
                      <td className="py-space-sm px-space-md flex items-center gap-space-xs font-telemetry-md text-telemetry-md font-medium text-on-surface">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            bus.status === 'Delayed'
                              ? 'text-error'
                              : bus.status === 'Idle Depot'
                              ? 'text-outline'
                              : 'text-primary'
                          }`}
                        >
                          directions_bus
                        </span>
                        {bus.id}
                      </td>
                      <td className="py-space-sm px-space-md text-on-surface font-medium">
                        {bus.route}
                      </td>
                      <td className="py-space-sm px-space-md">
                        <div className="flex items-center gap-space-xs">
                          {bus.driverPhoto ? (
                            <img
                              className="w-6 h-6 rounded-full object-cover"
                              src={bus.driverPhoto}
                              alt={bus.driver}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-outline text-[12px] font-medium">
                              --
                            </span>
                          )}
                          <span className={bus.driver === 'Unassigned' ? 'text-outline' : 'text-on-surface'}>
                            {bus.driver}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`py-space-sm px-space-md font-telemetry-md text-telemetry-md ${
                          bus.status === 'Delayed'
                            ? 'text-error font-medium'
                            : bus.status === 'Idle Depot'
                            ? 'text-outline'
                            : 'text-on-surface'
                        }`}
                      >
                        {bus.speed}
                      </td>
                      <td
                        className={`py-space-sm px-space-md font-telemetry-md text-telemetry-md ${
                          bus.status === 'Idle Depot' ? 'text-outline' : 'text-on-surface-variant'
                        }`}
                      >
                        {bus.passengers}
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span
                          className={`font-telemetry-sm text-telemetry-sm flex items-center gap-1 ${
                            bus.status === 'Delayed' || bus.status === 'Idle Depot'
                              ? 'text-on-surface-variant'
                              : 'text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            satellite
                          </span>
                          {bus.satellites} sats
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md">
                        {bus.status === 'In Transit' && (
                          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm bg-surface-container-high text-primary font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            In Transit
                          </span>
                        )}
                        {bus.status === 'At Stop' && (
                          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm bg-surface-container-highest text-secondary-container font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary-container"></span>
                            At Stop
                          </span>
                        )}
                        {bus.status === 'Delayed' && (
                          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm bg-error-container text-on-error-container font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse"></span>
                            Delayed ({bus.delayText})
                          </span>
                        )}
                        {bus.status === 'Idle Depot' && (
                          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm bg-surface-container text-on-surface-variant font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-outline"></span>
                            Idle Depot
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time RFID Scans Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between mb-space-sm flex-wrap gap-2">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  contactless
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Real-Time RFID Student Tap Feed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-telemetry-sm text-telemetry-sm text-outline uppercase tracking-wider">
                  Stream Active: 115200 bps
                </span>
                <button
                  onClick={simulateNewRfidTap}
                  className="px-2 py-0.5 bg-surface-container-high hover:bg-surface-container text-primary rounded font-telemetry-sm text-xs font-semibold"
                  type="button"
                  title="Simulate NFC badge tap at boarding gate"
                >
                  + Simulate Tap
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider bg-surface-container-low/50">
                    <th className="py-space-xs px-space-sm">Card UID</th>
                    <th className="py-space-xs px-space-sm">Student Passenger</th>
                    <th className="py-space-xs px-space-sm">Station / Stop</th>
                    <th className="py-space-xs px-space-sm">Latency</th>
                    <th className="py-space-xs px-space-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm font-body-sm font-normal">
                  {rfidLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-space-xs px-space-sm font-telemetry-sm text-telemetry-sm text-on-surface">
                        {log.cardUid}
                      </td>
                      <td className="py-space-xs px-space-sm font-medium text-on-surface">
                        {log.studentName} ({log.studentId})
                      </td>
                      <td className="py-space-xs px-space-sm text-on-surface-variant">
                        {log.station}
                      </td>
                      <td className="py-space-xs px-space-sm font-telemetry-sm text-telemetry-sm text-primary font-medium">
                        {log.timestamp}
                      </td>
                      <td className="py-space-xs px-space-sm">
                        <span
                          className={`inline-flex items-center px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm font-medium ${
                            log.action === 'Boarded'
                              ? 'bg-surface-container-highest text-primary'
                              : 'bg-surface-container-high text-secondary-container'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Task Queue */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  assignment_turned_in
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Operational Task Queue
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-outline font-medium">
                {tasks.filter((t) => !t.completed).length} Pending Dispatch Tasks
              </span>
            </div>

            <div className="flex flex-col gap-space-xs">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors ${
                    task.completed ? 'opacity-60 bg-surface-container-low/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <input
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-body-md text-body-md font-medium text-on-surface ${
                          task.completed ? 'line-through text-outline' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Assigned to: {task.assignee}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <span
                      className={`px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm font-medium ${
                        task.priority === 'HIGH'
                          ? 'bg-error-container text-on-error-container'
                          : task.priority === 'MEDIUM'
                          ? 'bg-surface-container-highest text-secondary-container'
                          : 'bg-surface-container text-primary'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline hidden sm:inline">
                      Due {task.dueTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Telemetry & Critical Alert Feed (1/3) */}
        <div className="flex flex-col gap-space-lg">
          {/* ESP32 Hardware Status Deck — Live */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">ESP32 Hardware Units</span>
              </div>
              {lastUpdated && (
                <span className="font-telemetry-sm text-telemetry-sm text-outline">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-error-container/30 px-space-sm py-space-xs text-error font-body-sm text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">wifi_off</span>
                Backend offline — {error}
              </div>
            )}

            {!error && loading && (
              <div className="flex flex-col gap-space-sm animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="bg-surface-container-low rounded-lg p-space-sm h-20" />
                ))}
              </div>
            )}

            {!error && !loading && telemetry.length === 0 && (
              <p className="font-body-sm text-body-sm text-outline text-center py-4">
                No devices registered. Add one via /admin/tracker/deviceconfig/
              </p>
            )}

            <div className="flex flex-col gap-space-sm">
              {telemetry.map(t => {
                const isOnline = true; // if we got data, the device just posted
                return (
                  <div key={t.bus_id} className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-telemetry-md text-telemetry-md font-semibold text-on-surface">
                          {t.bus_id}
                        </span>
                        <span className="text-outline font-label-sm text-label-sm">({t.route})</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full font-telemetry-sm text-telemetry-sm font-medium ${
                        t.status === 'Alert'
                          ? 'bg-error-container text-on-error-container'
                          : t.status === 'Warning'
                          ? 'bg-surface-container-highest text-secondary-container'
                          : 'bg-surface-container-high text-primary'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'Alert' ? 'bg-error animate-ping' : t.status === 'Warning' ? 'bg-secondary-container' : 'bg-primary animate-ping'}`}></span>
                        {t.status === 'Alert' ? 'ALERT' : t.status === 'Warning' ? 'WARNING' : 'ONLINE'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">Speed</span>
                        <span className={`font-telemetry-sm text-telemetry-sm font-medium ${t.status === 'Alert' ? 'text-error' : 'text-on-surface'}`}>
                          {t.speed_kmh != null ? `${t.speed_kmh.toFixed(1)} km/h` : '—'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">Satellites</span>
                        <span className="font-telemetry-sm text-telemetry-sm font-medium text-secondary">
                          {t.satellites ?? '—'} sats
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">Driver</span>
                        <span className="font-telemetry-sm text-telemetry-sm font-medium text-on-surface truncate">
                          {t.driver || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications & System Alerts Deck */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[20px]">
                  notifications_active
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Priority System Alerts
                </span>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-error bg-error-container text-on-error-container px-space-xs py-0.5 rounded-full font-medium">
                3 Actions Required
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {/* Alert 1: Critical */}
              <div className="bg-error-container/20 rounded-lg p-space-sm flex flex-col gap-space-xs border border-error/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-xs text-error font-medium">
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                    <span className="font-label-md text-label-md">Critical Speed Violation</span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">1m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Bus #204 logged 54.2 mph inside a 30 mph school zone on Route 4.
                </p>
                <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                  <button
                    onClick={() =>
                      onShowToast(
                        'Radio Channel 04 Activated',
                        'Voice link established to Operator C. Reyes on Bus #204.'
                      )
                    }
                    className="px-space-xs py-1 rounded bg-error text-on-error font-label-sm text-label-sm hover:opacity-90 transition-opacity"
                    type="button"
                  >
                    Radio Driver
                  </button>
                </div>
              </div>

              {/* Alert 2: Geofence Warning */}
              <div className="bg-surface-container-highest/60 rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-xs text-secondary-container font-medium">
                    <span className="material-symbols-outlined text-[16px]">
                      wrong_location
                    </span>
                    <span className="font-label-md text-label-md">Geofence Deviation</span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">9m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Bus #108 deviated 400m from scheduled corridor due to localized roadworks.
                </p>
                <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                  <button
                    onClick={() =>
                      onShowToast('Deviation Acknowledged', 'Logged in dispatch manifest #DEV-108.')
                    }
                    className="px-space-xs py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"
                    type="button"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>

              {/* Alert 3: Routine Maintenance */}
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-xs text-on-surface font-medium">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      build
                    </span>
                    <span className="font-label-md text-label-md">
                      Preventative Maintenance Due
                    </span>
                  </div>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    28m ago
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bus #091 is 150 miles past primary transmission fluid inspection interval.
                </p>
                <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                  <button
                    onClick={() =>
                      onShowToast(
                        'Work Order Created',
                        'Bus #091 scheduled at Depot South Maintenance Bay 2.'
                      )
                    }
                    className="px-space-xs py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"
                    type="button"
                  >
                    Schedule Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Map Snippet */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  map
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Active Zone Radar
                </span>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-outline font-medium">
                37.7749° N, 122.4194° W
              </span>
            </div>
            <div
              className="w-full h-44 rounded-lg bg-cover bg-center overflow-hidden relative shadow-sm"
              style={{ backgroundImage: `url(${ASSETS.mapSanFrancisco})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-sm">
                <span className="font-body-sm text-body-sm text-inverse-on-surface font-medium">
                  Metro Corridor East / Sector 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for + New Fleet Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Queue Fleet Maintenance Task
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-outline uppercase mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect tire pressure sensor on Bus #108"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-outline uppercase mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Soto (Hardware Tech)"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-outline uppercase mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')
                  }
                  className="w-full h-9 px-3 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="HIGH">HIGH (Immediate)</option>
                  <option value="MEDIUM">MEDIUM (Standard)</option>
                  <option value="LOW">LOW (Deferred)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-sm text-on-surface hover:bg-surface-container rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium shadow hover:bg-primary-container"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
