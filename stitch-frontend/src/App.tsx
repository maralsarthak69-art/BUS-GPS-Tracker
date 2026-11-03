import React, { useState } from 'react';
import { ViewMode, UserRole } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { DriverView } from './views/DriverView';
import { AdminView } from './views/AdminView';
import { StudentView } from './views/StudentView';
import { ContactView } from './views/ContactView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('Metro Route #402 - East Line');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('Administrator');
  const [userEmail, setUserEmail] = useState('dispatch04@bustrack.ops');

  const addToast = (title: string, description: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (role: UserRole, email: string) => {
    setUserRole(role);
    setUserEmail(email);
    addToast('Authentication Verified', `Logged in as ${role} (${email})`);
  };

  const isFullPageLayout = currentView === 'landing' || currentView === 'login';

  const screensList: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Fleet Overview', icon: 'grid_view' },
    { id: 'driver-portal', label: 'Driver HUD', icon: 'directions_bus' },
    { id: 'admin-portal', label: 'Admin Portal', icon: 'admin_panel_settings' },
    { id: 'student-portal', label: 'Student Tracker', icon: 'school' },
    { id: 'contact', label: 'Dispatch Support', icon: 'support_agent' },
    { id: 'landing', label: 'Landing & Live Map', icon: 'public' },
    { id: 'login', label: 'Auth & Login', icon: 'lock' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Toast Notification Stream */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Floating Quick Screen Switcher Bar for instant access to all 7 screens */}
      <aside aria-label="Screen Switcher" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface px-3 py-1.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-1.5 max-w-[95vw] overflow-x-auto">
        <span className="text-[11px] font-telemetry-sm text-outline-variant uppercase px-2 shrink-0 hidden sm:inline">
          Screens:
        </span>
        {screensList.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setCurrentView(screen.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              currentView === screen.id
                ? 'bg-primary text-white shadow-md'
                : 'text-outline-variant hover:text-white hover:bg-white/10'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">
              {screen.icon}
            </span>
            <span>{screen.label}</span>
          </button>
        ))}
      </aside>

      {/* Conditional Layout: Full Page for Landing / Auth, else Left Sidebar + Top Bar */}
      {isFullPageLayout ? (
        <main className="w-full min-h-screen">
          {currentView === 'landing' && <LandingView onNavigate={setCurrentView} />}
          {currentView === 'login' && (
            <AuthView
              onNavigate={setCurrentView}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </main>
      ) : (
        <div className="flex w-full min-h-screen bg-surface">
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Workspace Frame */}
          <div className="flex-1 w-full lg:pl-64 flex flex-col min-h-screen">
            {/* Top Fixed Header */}
            <Header
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onNavigate={setCurrentView}
              activeRoute={activeRoute}
              onSelectRoute={setActiveRoute}
              unreadCount={3}
            />

            {/* View Content Portals */}
            <main className="w-full pt-20 px-space-md sm:px-space-lg lg:px-space-xl flex-1 max-w-[1600px] mx-auto">
              {currentView === 'dashboard' && (
                <DashboardView
                  onNavigate={setCurrentView}
                  onShowToast={addToast}
                />
              )}
              {currentView === 'driver-portal' && (
                <DriverView
                  onNavigate={setCurrentView}
                  onShowToast={addToast}
                />
              )}
              {currentView === 'admin-portal' && (
                <AdminView
                  onNavigate={setCurrentView}
                  onShowToast={addToast}
                />
              )}
              {currentView === 'student-portal' && (
                <StudentView
                  onNavigate={setCurrentView}
                  onShowToast={addToast}
                />
              )}
              {currentView === 'contact' && (
                <ContactView
                  onNavigate={setCurrentView}
                  onShowToast={addToast}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
