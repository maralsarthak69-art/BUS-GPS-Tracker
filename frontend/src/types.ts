export type ViewMode = 
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'admin-portal'
  | 'driver-portal'
  | 'student-portal'
  | 'contact';

export type UserRole = 'Administrator' | 'Driver' | 'Student/Parent';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Driver' | 'Guardian';
  status: 'Active' | 'Pending' | 'Suspended';
  rfid: string;
  provisionedDate: string;
  avatarColor: string;
  initials: string;
  verified?: boolean;
}

export interface BusTelemetry {
  id: string;
  route: string;
  driver: string;
  driverPhoto: string;
  speed: string;
  passengers: string;
  satellites: number;
  status: 'In Transit' | 'At Stop' | 'Delayed' | 'Idle Depot';
  delayText?: string;
}

export interface RfidTapLog {
  id: string;
  cardUid: string;
  studentName: string;
  studentId: string;
  station: string;
  timestamp: string;
  action: 'Boarded' | 'Alighted';
}

export interface FleetTask {
  id: string;
  title: string;
  assignee: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueTime: string;
  completed: boolean;
}

export interface SystemAlert {
  id: string;
  type: 'speed' | 'geofence' | 'maintenance' | 'sos';
  title: string;
  message: string;
  timeAgo: string;
  severity: 'critical' | 'warning' | 'info';
  actionLabel: string;
}
