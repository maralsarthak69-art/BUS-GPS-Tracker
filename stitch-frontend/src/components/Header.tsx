import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onNavigate: (view: ViewMode) => void;
  activeRoute: string;
  onSelectRoute: (route: string) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate,
  activeRoute,
  onSelectRoute,
  unreadCount = 3,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const routeOptions = [
    'Metro Route #402 - East Line',
    'Route 07 Westside Campus',
    'Route 14 Express - Highland Hub',
    'Route 108 Oakridge North Loop',
    'Route 204 Downtown Feeder',
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-xl">
      {/* Left Area */}
      <div className="flex items-center gap-space-sm sm:gap-space-lg">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container lg:hidden flex items-center justify-center"
          type="button"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* GPS Sync Status Pill */}
        <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant font-medium">
            GPS SYNC: 18ms
          </span>
          <span className="font-telemetry-sm text-telemetry-sm text-outline-variant hidden sm:inline">
            | 142 Active Units
          </span>
        </div>

        {/* Route Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRouteOpen(!isRouteOpen)}
            className="flex items-center bg-surface-container-low px-space-md py-space-xs rounded-lg hover:bg-surface-container transition-colors text-left"
            type="button"
          >
            <span className="material-symbols-outlined text-outline text-[18px] mr-space-xs">
              alt_route
            </span>
            <span className="font-label-md text-label-md text-on-surface mr-space-sm truncate max-w-[150px] sm:max-w-[220px]">
              {activeRoute}
            </span>
            <span className="material-symbols-outlined text-outline text-[18px]">
              expand_more
            </span>
          </button>

          {isRouteOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-outline uppercase tracking-wider">
                Select Active Corridor
              </div>
              {routeOptions.map((route) => (
                <button
                  key={route}
                  onClick={() => {
                    onSelectRoute(route);
                    setIsRouteOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    activeRoute === route
                      ? 'bg-surface-container text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                  type="button"
                >
                  <span className="truncate">{route}</span>
                  {activeRoute === route && (
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Landing Link, Notification Bell, UTC Clock */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Quick Link to Landing Page */}
        <button
          onClick={() => onNavigate('landing')}
          className="hidden md:inline-flex items-center gap-1 px-3 py-1 text-label-sm font-label-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          type="button"
          title="Return to Public Landing Page"
        >
          <span className="material-symbols-outlined text-[16px]">public</span>
          <span>Public Portal</span>
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center"
            type="button"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error ring-2 ring-surface"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container mb-2">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Live Dispatch Alerts
                </span>
                <span className="text-[11px] font-telemetry-sm bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} priority
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-error-container/20 rounded-lg text-xs">
                  <div className="font-semibold text-error flex items-center justify-between">
                    <span>Critical Speed Violation</span>
                    <span className="text-outline font-telemetry-sm">1m ago</span>
                  </div>
                  <p className="text-on-surface mt-0.5">
                    Bus #204 logged 54.2 mph inside 30 mph school zone.
                  </p>
                </div>
                <div className="p-2 bg-surface-container rounded-lg text-xs">
                  <div className="font-semibold text-secondary flex items-center justify-between">
                    <span>Geofence Deviation</span>
                    <span className="text-outline font-telemetry-sm">9m ago</span>
                  </div>
                  <p className="text-on-surface mt-0.5">
                    Bus #108 deviated 400m from scheduled corridor.
                  </p>
                </div>
                <div className="p-2 bg-surface-container-low rounded-lg text-xs">
                  <div className="font-semibold text-on-surface flex items-center justify-between">
                    <span>New RFID Verification</span>
                    <span className="text-outline font-telemetry-sm">2s ago</span>
                  </div>
                  <p className="text-on-surface mt-0.5">
                    Emma Lin (#89201) boarded at Oakridge High.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNotificationsOpen(false);
                  onNavigate('dashboard');
                }}
                className="w-full text-center text-xs text-primary font-medium mt-2 pt-2 border-t border-surface-container hover:underline"
                type="button"
              >
                View all in Fleet Overview →
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-outline-variant"></div>

        {/* Live UTC Clock */}
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            schedule
          </span>
          <span className="font-telemetry-md text-telemetry-md text-on-surface font-medium whitespace-nowrap">
            {utcTime || '09:41:22 UTC'}
          </span>
        </div>
      </div>
    </header>
  );
};
