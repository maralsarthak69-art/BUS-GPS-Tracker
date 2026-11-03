import React, { useState } from 'react';
import { ViewMode, SystemUser } from '../types';
import { ASSETS, INITIAL_USERS } from '../mockData';

interface AdminViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate, onShowToast }) => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [activeFilterRole, setActiveFilterRole] = useState<'all' | 'Driver' | 'Administrator' | 'Guardian'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add user modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Administrator' | 'Driver' | 'Guardian'>('Driver');
  const [newUserRfid, setNewUserRfid] = useState('');

  // System config settings
  const [gpsInterval, setGpsInterval] = useState('2');
  const [rfidTimeout, setRfidTimeout] = useState('500');
  const [speedThreshold, setSpeedThreshold] = useState('45');
  const [geofenceRadius, setGeofenceRadius] = useState('250');
  const [voltageWarning, setVoltageWarning] = useState('11.8');
  const [mqttKeepAlive, setMqttKeepAlive] = useState('30');

  // Audit log modal
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesRole = activeFilterRole === 'all' || u.role === activeFilterRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Revoke credentials and remove ${name} from transit fleet access?`)) {
      setUsers(users.filter((u) => u.id !== id));
      onShowToast('User Deprovisioned', `${name} revoked from directory.`);
    }
  };

  const handleResetCredentials = (name: string) => {
    onShowToast('Security Key Rotated', `Sent encrypted token reset instructions to ${name}.`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const initials = newUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    let avatarColor = 'bg-blue-100 text-blue-700';
    if (newUserRole === 'Administrator') {
      avatarColor = 'bg-purple-100 text-purple-700';
    } else if (newUserRole === 'Guardian') {
      avatarColor = 'bg-slate-200 text-slate-700';
    }

    const rfidVal = newUserRfid.trim() || '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    const newUser: SystemUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}-${newUserRole.substring(0, 3).toUpperCase()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active',
      rfid: rfidVal,
      provisionedDate: 'Just now',
      avatarColor,
      initials: initials || 'OP',
    };

    setUsers([newUser, ...users]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRfid('');
    setIsAddUserModalOpen(false);
    onShowToast('User Provisioned', `${newUser.name} provisioned with RFID ${rfidVal}.`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(
      'Gateway Parameters Applied',
      `Synchronized 6 updated thresholds via MQTT topic /fleet/config across 46 ESP32 units.`
    );
  };

  const handleResetDefaults = () => {
    setGpsInterval('2');
    setRfidTimeout('500');
    setSpeedThreshold('45');
    setGeofenceRadius('250');
    setVoltageWarning('11.8');
    setMqttKeepAlive('30');
    onShowToast('Restored Defaults', 'Standard factory telemetry profile loaded. Click Save to push.');
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Level Admin Breadcrumb & Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-outline font-telemetry-sm text-telemetry-sm uppercase tracking-wider">
            <span>System Operations</span>
            <span>/</span>
            <span className="text-primary font-medium">Control Plane v2.4</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            System Administration & Fleet Access
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Manage transit user roles, driver telemetry assignments, and calibrate real-time IoT gateway parameters across active transit corridors.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-shrink-0">
          <button
            onClick={() => setIsAuditLogsModalOpen(true)}
            className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-low text-on-surface rounded-lg shadow-sm hover:bg-surface-container transition-colors font-label-md text-label-md"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-space-xs px-space-lg py-space-sm bg-primary text-on-primary rounded-lg shadow-md hover:bg-primary-container transition-all font-label-md text-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* KPI Report Stat Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mt-space-sm">
        {/* Stat 1 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Total System Users
            </span>
            <div className="p-space-xs rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              148
            </span>
            <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12% mo
            </span>
          </div>
          <div className="flex items-center justify-between text-outline text-telemetry-sm font-telemetry-sm pt-space-xs">
            <span>Active sessions</span>
            <span className="text-on-surface font-medium">92 online</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Active RFID Badges
            </span>
            <div className="p-space-xs rounded-lg bg-surface-container text-secondary">
              <span className="material-symbols-outlined text-[20px]">contactless</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              1,120
            </span>
            <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              98.4% assigned
            </span>
          </div>
          <div className="flex items-center justify-between text-outline text-telemetry-sm font-telemetry-sm pt-space-xs">
            <span>Hardware cards</span>
            <span className="text-on-surface font-medium">18 unmapped</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              ESP32 Hub Nodes
            </span>
            <div className="p-space-xs rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">router</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              46
            </span>
            <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All sync normal
            </span>
          </div>
          <div className="flex items-center justify-between text-outline text-telemetry-sm font-telemetry-sm pt-space-xs">
            <span>Average ping</span>
            <span className="text-on-surface font-medium">24ms UDP</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Geofence Alerts
            </span>
            <div className="p-space-xs rounded-lg bg-surface-container text-error">
              <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              14
            </span>
            <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              -18% vs last wk
            </span>
          </div>
          <div className="flex items-center justify-between text-outline text-telemetry-sm font-telemetry-sm pt-space-xs">
            <span>Open deviations</span>
            <span className="text-error font-medium">1 investigating</span>
          </div>
        </div>
      </div>

      {/* Operational Context Banner with Visual Micro-Telemetry */}
      <div className="mt-space-lg bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-md w-full lg:w-auto">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Mesh Network Orchestrator
              </span>
              <span className="font-telemetry-sm text-telemetry-sm px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full font-semibold">
                NODE-CLUSTER EAST-01
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time MQTT ingestion broker handling 240 packets/sec over TLS port 8883. Zero packet drops in past 48 hours.
            </p>
          </div>
        </div>

        {/* Inline Vector Chart: Telemetry Heartbeat Stream */}
        <div className="flex items-center gap-space-lg w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Sync Stability
            </span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface font-medium">
              99.982% uptime
            </span>
          </div>
          <div className="h-10 w-44 bg-surface-container rounded-lg p-1 flex items-center">
            <svg className="w-full h-8 text-primary overflow-visible" fill="none" viewBox="0 0 160 30">
              <path
                d="M0 15 L20 15 L30 6 L40 24 L50 15 L70 15 L80 9 L90 20 L100 15 L120 15 L130 4 L140 26 L150 15 L160 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
              <circle className="fill-primary animate-ping" cx="160" cy="15" r="3"></circle>
              <circle className="fill-primary" cx="160" cy="15" r="2.5"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Section: User Management */}
      <section className="mt-space-xl flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Identity & Role Management
            </h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Configure operator credentials, hardware keycards, and portal permissions
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() =>
                onShowToast(
                  'User Roster Exported',
                  `A secure CSV download with ${users.length} user credentials has been generated.`
                )
              }
              className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export List</span>
            </button>
          </div>
        </div>

        {/* User Filter Bar */}
        <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center bg-surface-container-low rounded-lg px-space-md py-space-xs text-on-surface">
            <span className="material-symbols-outlined text-outline text-[20px] mr-space-xs">
              search
            </span>
            <input
              className="w-full bg-transparent border-none outline-none font-body-md text-body-md placeholder:text-outline text-on-surface focus:ring-0"
              placeholder="Search users by name, email, role, or ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="hidden sm:inline-block font-telemetry-sm text-telemetry-sm px-1.5 py-0.5 bg-surface-container rounded text-outline border-none">
              ⌘K
            </kbd>
          </div>

          {/* Segmented Role Tabs */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveFilterRole('all')}
              className={`filter-tab px-space-md py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${
                activeFilterRole === 'all'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              All Users{' '}
              <span className="ml-1 text-outline font-telemetry-sm">{users.length}</span>
            </button>
            <button
              onClick={() => setActiveFilterRole('Driver')}
              className={`filter-tab px-space-md py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${
                activeFilterRole === 'Driver'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Drivers{' '}
              <span className="ml-1 text-outline font-telemetry-sm">
                {users.filter((u) => u.role === 'Driver').length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilterRole('Administrator')}
              className={`filter-tab px-space-md py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${
                activeFilterRole === 'Administrator'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Admins{' '}
              <span className="ml-1 text-outline font-telemetry-sm">
                {users.filter((u) => u.role === 'Administrator').length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilterRole('Guardian')}
              className={`filter-tab px-space-md py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${
                activeFilterRole === 'Guardian'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Guardians{' '}
              <span className="ml-1 text-outline font-telemetry-sm">
                {users.filter((u) => u.role === 'Guardian').length}
              </span>
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="text-outline uppercase font-label-sm text-label-sm">
                  <th className="py-space-md px-space-lg" scope="col">User / Account</th>
                  <th className="py-space-md px-space-md" scope="col">Email Address</th>
                  <th className="py-space-md px-space-md" scope="col">Role</th>
                  <th className="py-space-md px-space-md" scope="col">Status</th>
                  <th className="py-space-md px-space-md" scope="col">RFID Identifier</th>
                  <th className="py-space-md px-space-md" scope="col">Provisioned</th>
                  <th className="py-space-md px-space-lg text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-space-md px-space-lg">
                      <div className="flex items-center gap-space-md">
                        <div
                          className={`w-9 h-9 rounded-full ${user.avatarColor} flex items-center justify-center font-semibold font-telemetry-md flex-shrink-0`}
                        >
                          {user.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface flex items-center gap-1.5">
                            {user.name}
                            {user.verified && (
                              <span
                                className="material-symbols-outlined text-[16px] text-purple-600"
                                title="System Root Superadmin"
                              >
                                verified_user
                              </span>
                            )}
                          </span>
                          <span className="font-telemetry-sm text-telemetry-sm text-outline">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md font-telemetry-md text-telemetry-md text-on-surface-variant">
                      {user.email}
                    </td>

                    <td className="py-space-md px-space-md">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-telemetry-sm ${
                          user.role === 'Administrator'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'Driver'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {user.role === 'Guardian' ? 'Student/Parent' : user.role}
                      </span>
                    </td>

                    <td className="py-space-md px-space-md">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-telemetry-sm ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : user.status === 'Suspended'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-emerald-500'
                              : user.status === 'Suspended'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-space-md px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                      {user.rfid}
                    </td>

                    <td className="py-space-md px-space-md font-telemetry-sm text-telemetry-sm text-outline">
                      {user.provisionedDate}
                    </td>

                    <td className="py-space-md px-space-lg text-right">
                      <div className="flex items-center justify-end gap-space-xs">
                        <button
                          onClick={() =>
                            onShowToast('Permissions Dialog', `Loaded permissions matrix for ${user.name}.`)
                          }
                          className="action-btn p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                          title="Edit Permissions"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleResetCredentials(user.name)}
                          className="action-btn p-1.5 rounded-lg text-outline hover:text-secondary hover:bg-surface-container transition-colors"
                          title="Reset Credentials"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">key</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="action-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                          title="Remove User"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Metadata */}
          <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between text-outline font-telemetry-sm text-telemetry-sm">
            <span>Showing {filteredUsers.length} of {users.length} registered users</span>
            <div className="flex items-center gap-space-sm">
              <button
                className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm disabled:opacity-40"
                disabled
              >
                Previous
              </button>
              <span className="text-on-surface font-medium">Page 1 of 1</span>
              <button
                className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface shadow-sm disabled:opacity-40"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Fleet Hardware Node Banner with Image Card */}
      <div className="mt-space-xl grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
        {/* Image Card 1: IoT Gateway Field Deploy */}
        <div className="lg:col-span-1 rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest flex flex-col">
          <div className="relative h-48 w-full overflow-hidden bg-surface-container">
            <img
              className="w-full h-full object-cover"
              src={ASSETS.gatewayHardware}
              alt="Industrial ESP32 IoT Gateway"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-inverse-surface/80 text-inverse-on-surface font-telemetry-sm text-telemetry-sm backdrop-blur-md">
              GATEWAY REV 3.2-CAN
            </div>
          </div>
          <div className="p-space-lg flex flex-col justify-between flex-1">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase font-semibold">
                Edge Hardware Hub
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                OTA Microcode Distribution
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Dual-core ESP32 controllers running FreeRTOS with active hardware watchdog. Firmware image v4.11 staged for rolling deployment across 46 active units.
              </p>
            </div>
            <div className="pt-space-md flex items-center justify-between font-telemetry-sm text-telemetry-sm text-outline">
              <span>Staged Payload: 1.4 MB</span>
              <button
                onClick={() =>
                  onShowToast(
                    'OTA Broadcast Staged',
                    'Firmware v4.11 broadcast prepared for overnight maintenance window.'
                  )
                }
                className="text-secondary font-medium hover:underline"
                type="button"
              >
                Flash Ready →
              </button>
            </div>
          </div>
        </div>

        {/* Image Card 2: Dispatch Monitoring Hub */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest flex flex-col justify-between p-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  security
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Hardware Token Integrity & Security Shield
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Real-time validation against MITRE vehicular telematics security matrices. RFID cloning protection enforced by AES-128 SAM modules.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-telemetry-sm text-telemetry-sm flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Zero Vulnerabilities Reported</span>
            </div>
          </div>

          {/* Visual Metric Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md my-space-lg">
            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-outline">
                Mifare DESFire Deserializer
              </span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
                100% Strict
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-emerald-600">
                No replay flags
              </span>
            </div>
            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-outline">
                CANBus Read Busload
              </span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
                31.4% Capacity
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-primary">
                Normal jitter limit
              </span>
            </div>
            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-outline">
                Cellular Fallback Mesh
              </span>
              <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
                LTE-M / NB-IoT
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-secondary">
                Carrier auto-switch
              </span>
            </div>
          </div>

          {/* Quick Action Mini Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t-0 bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <div className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
              <span>Cryptographic keys rotated 4 days ago</span>
            </div>
            <button
              onClick={() =>
                onShowToast(
                  'Hardware Key Chain',
                  'Root CA: BusTrack District PKI 2026. Hardware SAM: Enforced.'
                )
              }
              className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold transition-colors"
              type="button"
            >
              View Hardware Certificate Chain →
            </button>
          </div>
        </div>
      </div>

      {/* Section: System Configuration */}
      <section className="mt-space-xl flex flex-col gap-space-md">
        <div className="flex flex-col">
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            System Configuration & Telemetry Gateways
          </h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Calibrate real-time telemetry threshold timers, GPS sensor rates, and MQTT bus parameters
          </span>
        </div>

        <form
          className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-xl"
          onSubmit={handleSaveConfig}
        >
          {/* 2-Column Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
            {/* Field 1: GPS Polling Interval */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="gpsInterval"
              >
                <span className="font-medium">GPS Polling Interval</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Target: 1s – 30s</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="gpsInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={gpsInterval}
                  onChange={(e) => setGpsInterval(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  seconds
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Frequency at which each vehicle coordinates are broadcast to live dispatch sockets.
              </p>
            </div>

            {/* Field 2: RFID Scan Timeout */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="rfidTimeout"
              >
                <span className="font-medium">RFID Scan Timeout</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Debounce Window</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="rfidTimeout"
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={rfidTimeout}
                  onChange={(e) => setRfidTimeout(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  ms
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Prevents duplicate scans when student passes tap badge repeatedly against front boarding turnstile.
              </p>
            </div>

            {/* Field 3: Speed Alert Threshold */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="speedThreshold"
              >
                <span className="font-medium">Speed Alert Threshold</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Safety Enforced</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="speedThreshold"
                  type="number"
                  min="15"
                  max="85"
                  value={speedThreshold}
                  onChange={(e) => setSpeedThreshold(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  mph
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Triggers immediate high-priority audit ping to dispatch console if continuous velocity exceeds value.
              </p>
            </div>

            {/* Field 4: Geofence Safety Radius */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="geofenceRadius"
              >
                <span className="font-medium">Geofence Safety Radius</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Corridor Deviation</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="geofenceRadius"
                  type="number"
                  min="50"
                  max="2000"
                  step="25"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  meters
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Maximum off-route buffer permitted before auto-routing generates a transit deviation exception.
              </p>
            </div>

            {/* Field 5: Low Voltage Warning */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="voltageWarning"
              >
                <span className="font-medium">Low Voltage Warning</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Alternator / Lead-Acid</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="voltageWarning"
                  type="number"
                  min="9.0"
                  max="14.0"
                  step="0.1"
                  value={voltageWarning}
                  onChange={(e) => setVoltageWarning(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  V
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Triggers fleet maintenance work order if battery primary terminal stays sub-threshold during idle.
              </p>
            </div>

            {/* Field 6: MQTT Keep-Alive Window */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="mqttKeepAlive"
              >
                <span className="font-medium">MQTT Keep-Alive Window</span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline">Heartbeat Timeout</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-telemetry-md text-telemetry-md text-on-surface border-none focus:outline-none focus:bg-surface-container-highest transition-colors"
                  id="mqttKeepAlive"
                  type="number"
                  min="5"
                  max="180"
                  value={mqttKeepAlive}
                  onChange={(e) => setMqttKeepAlive(e.target.value)}
                />
                <span className="absolute right-3 font-telemetry-sm text-telemetry-sm text-outline">
                  seconds
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Time after which an unacknowledged hub node socket is designated offline and re-routed.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-low/60 -mx-space-xl -mb-space-xl p-space-lg rounded-b-xl">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-telemetry-sm text-telemetry-sm">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">
                check_circle
              </span>
              <span>Last modified by Elena Rostova (Admin) • Synchronized to 46 gateways</span>
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <button
                onClick={handleResetDefaults}
                className="px-space-md py-space-sm bg-surface-container-lowest text-on-surface rounded-lg shadow-sm hover:bg-surface-container font-label-md text-label-md transition-colors"
                type="button"
              >
                Reset to Defaults
              </button>
              <button
                className="flex items-center gap-space-xs px-space-lg py-space-sm bg-primary text-on-primary rounded-lg shadow-md hover:bg-primary-container font-label-md text-label-md transition-all cursor-pointer"
                type="submit"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                <span>Save System Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Add User Modal Dialog */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg p-space-xl flex flex-col gap-space-lg border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="p-2 rounded-lg bg-primary-fixed text-primary">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Provision System User
                  </h3>
                  <span className="font-body-sm text-body-sm text-outline">
                    Assign role capabilities and hardware RFID keycards
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Full Name
                </label>
                <input
                  required
                  className="bg-surface-container-low px-space-md py-2 rounded-lg font-body-md text-body-md border-none outline-none focus:bg-surface-container-high transition-colors"
                  placeholder="e.g. Jordan Miller"
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Email Address
                </label>
                <input
                  required
                  className="bg-surface-container-low px-space-md py-2 rounded-lg font-body-md text-body-md border-none outline-none focus:bg-surface-container-high transition-colors"
                  placeholder="j.miller@transit.local"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Assigned Role
                  </label>
                  <select
                    className="bg-surface-container-low px-space-md py-2 rounded-lg font-body-md text-body-md border-none outline-none focus:bg-surface-container-high transition-colors"
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value as 'Administrator' | 'Driver' | 'Guardian')
                    }
                  >
                    <option value="Driver">Driver</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Guardian">Student/Parent</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    RFID Key Hex
                  </label>
                  <input
                    className="bg-surface-container-low px-space-md py-2 rounded-lg font-telemetry-md text-telemetry-md border-none outline-none focus:bg-surface-container-high transition-colors"
                    placeholder="0x4B21AA9"
                    type="text"
                    value={newUserRfid}
                    onChange={(e) => setNewUserRfid(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm">
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-space-md py-space-sm bg-surface-container text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-space-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-md hover:bg-primary-container transition-all cursor-pointer"
                  type="submit"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {isAuditLogsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl p-space-xl flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  System Audit Trail & Log Stream
                </h3>
              </div>
              <button
                onClick={() => setIsAuditLogsModalOpen(false)}
                className="text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-telemetry-sm max-h-72 overflow-y-auto p-2 bg-surface-container-low rounded-lg">
              <div className="p-2 bg-surface-container-lowest rounded shadow-xs">
                <span className="text-secondary font-semibold">[09:40:11 UTC]</span> Elena Rostova (Admin) updated Geofence radius to 250m.
              </div>
              <div className="p-2 bg-surface-container-lowest rounded shadow-xs">
                <span className="text-secondary font-semibold">[09:35:44 UTC]</span> Driver Marcus Vance logged onto Bus #104 MDT Tablet.
              </div>
              <div className="p-2 bg-surface-container-lowest rounded shadow-xs">
                <span className="text-secondary font-semibold">[09:12:02 UTC]</span> Automated SAM verification completed: 46/46 keys active.
              </div>
              <div className="p-2 bg-surface-container-lowest rounded shadow-xs">
                <span className="text-secondary font-semibold">[08:48:19 UTC]</span> Speed alert logged for Bus #204 (54.2 mph in 30 mph zone).
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAuditLogsModalOpen(false)}
                className="px-4 py-2 bg-surface-container rounded-lg text-sm font-medium hover:bg-surface-container-high"
                type="button"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
