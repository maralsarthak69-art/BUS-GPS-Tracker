import React from 'react';
import { ViewMode } from '../types';
import { ASSETS } from '../mockData';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { path: ViewMode; label: string; icon: string }[] = [
    { path: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { path: 'admin-portal', label: 'Admin Portal', icon: 'admin_panel_settings' },
    { path: 'driver-portal', label: 'Driver Portal', icon: 'directions_bus' },
    { path: 'student-portal', label: 'Student Portal', icon: 'school' },
    { path: 'contact', label: 'Contact', icon: 'support_agent' },
  ];

  const handleNavClick = (path: ViewMode) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between p-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-space-xl">
          {/* Logo & Brand Header */}
          <div 
            className="flex items-center gap-space-md px-space-xs cursor-pointer select-none"
            onClick={() => handleNavClick('landing')}
            title="Go to BusTrack Landing Page"
          >
            <img
              alt="BusTrack Logo"
              className="h-8 w-auto object-contain"
              src={ASSETS.logo}
              onError={(e) => {
                // Fallback if network blocked
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-surface-container-lowest">
                BusTrack
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-outline-variant uppercase tracking-wider">
                Fleet Ops v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-space-xs">
            <span className="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-outline-variant font-semibold">
              Operations
            </span>
            <nav className="flex flex-col gap-space-xs">
              {navItems.map((item) => {
                const isActive = currentView === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    type="button"
                    className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-left w-full ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-medium shadow-sm'
                        : 'text-outline-variant hover:bg-surface-variant/20 hover:text-surface-container-lowest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="font-body-md text-body-md">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Telemetry Health & Profile */}
        <div className="flex flex-col gap-space-md pt-space-md">
          {/* Telemetry Core Status Pill */}
          <div className="bg-surface-variant/10 rounded-lg p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-outline-variant">
                Telemetry Core
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary-fixed font-semibold">
              ONLINE
            </span>
          </div>

          {/* Active Operator Badge */}
          <div className="flex items-center justify-between p-space-xs">
            <div className="flex items-center gap-space-sm">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-outline/30"
                src={ASSETS.profileDispatch}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-surface-container-lowest font-medium leading-none">
                  Dispatch 04
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-outline-variant leading-none mt-1">
                  Shift Active
                </span>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('login')}
              className="p-space-xs rounded-lg text-outline-variant hover:text-error hover:bg-error-container/20 transition-colors"
              title="Sign Out / Switch User"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
