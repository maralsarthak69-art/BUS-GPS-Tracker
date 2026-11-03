/**
 * LiveMap — a react-leaflet map that renders live bus markers.
 *
 * Fixes Leaflet's broken webpack default icon paths by pointing at CDN copies.
 * Marker colour is driven by the bus status:
 *   Active  → blue (primary)
 *   Alert   → red
 *   Warning → orange
 *   Offline → grey
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Icon factory ─────────────────────────────────────────────────────────────
const ICON_BASE =
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-';

const SHADOW =
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const COLOR_MAP: Record<string, string> = {
  Active:  'blue',
  Alert:   'red',
  Warning: 'orange',
  Offline: 'grey',
};

function makeIcon(status: string) {
  const colour = COLOR_MAP[status] ?? 'blue';
  return L.icon({
    iconUrl:       `${ICON_BASE}${colour}.png`,
    shadowUrl:     SHADOW,
    iconSize:      [25, 41],
    iconAnchor:    [12, 41],
    popupAnchor:   [1, -34],
    shadowSize:    [41, 41],
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BusMarker {
  lat:     number;
  lng:     number;
  label:   string;           // e.g. "Bus 12"
  detail?: string;           // e.g. "Route A · 34.2 km/h"
  status:  'Active' | 'Alert' | 'Warning' | 'Offline';
}

interface LiveMapProps {
  markers:   BusMarker[];
  /** CSS height class — default "h-[400px]" */
  height?:   string;
  /** Pan/zoom to fit all markers whenever they update */
  autoFit?:  boolean;
}

// ── Inner controller — re-centres map on marker changes ───────────────────────
function MapController({ markers, autoFit }: { markers: BusMarker[]; autoFit: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!autoFit || markers.length === 0) return;

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], map.getZoom() || 15);
      return;
    }

    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, autoFit]);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
const LiveMap: React.FC<LiveMapProps> = ({
  markers,
  height  = 'h-[400px]',
  autoFit = true,
}) => {
  // Default centre: Cape Town / generic location when no GPS fix yet
  const centre: [number, number] =
    markers.length > 0 && markers[0].lat !== 0
      ? [markers[0].lat, markers[0].lng]
      : [-33.9249, 18.4241];

  return (
    <MapContainer
      center={centre}
      zoom={14}
      scrollWheelZoom={false}
      className={`w-full ${height} z-0`}
      // Leaflet needs a numeric pixel height; the className provides it via Tailwind
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(m => (
        <Marker
          key={m.label}
          position={[m.lat, m.lng]}
          icon={makeIcon(m.status)}
        >
          <Popup>
            <strong>{m.label}</strong>
            {m.detail && (
              <>
                <br />
                <span style={{ fontSize: 12, color: '#555' }}>{m.detail}</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}

      <MapController markers={markers} autoFit={autoFit} />
    </MapContainer>
  );
};

export default LiveMap;
