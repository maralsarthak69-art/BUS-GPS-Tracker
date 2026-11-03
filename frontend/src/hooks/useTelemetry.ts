import { useEffect, useRef, useState } from 'react';
import { authHeaders } from './useAuth';

/** Shape of one enriched telemetry record from GET /api/telemetry/?latest=true */
export interface TelemetryRecord {
  id: number;
  bus_id: string;
  route: string;
  driver: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  speed_kmh: number | null;
  altitude_m: number | null;
  satellites: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number | null;
  rfid_uid: string | null;
  rfid_name: string | null;
  passenger_count: number;
  status: 'Active' | 'Alert' | 'Warning' | 'Offline';
}

interface UseTelemetryResult {
  data: TelemetryRecord[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';
const POLL_MS = 2000;

export function useTelemetry(): UseTelemetryResult {
  const [data, setData]             = useState<TelemetryRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchTelemetry() {
    try {
      const res = await fetch(`${API_URL}/api/telemetry/?latest=true`, {
        cache:   'no-store',
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // DRF returns paginated { results: [...] } or a plain array
      setData(Array.isArray(json) ? json : json.results ?? []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTelemetry();
    intervalRef.current = setInterval(fetchTelemetry, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { data, loading, error, lastUpdated };
}
