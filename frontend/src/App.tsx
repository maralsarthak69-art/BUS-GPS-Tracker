import React, { useState, useEffect } from 'react';
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
import { restoreSession, logout, type AuthUser } from './hooks/useAuth';

// Portal views that require a valid JWT
const PROTECTED_VIEWS: ViewMode[] = [
  'dashboard', 'admin-portal', 'driver-portal', 'student-portal',
];

export default function App() {
  const [currentView, setCurrentView]             = useState<ViewMode>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute]             = useState('Metro Route #402 - East Line');
  const [toasts, setToasts]                       = useState<ToastMessage[]>([]);
  const [userRole, setUserRole]                   = useState<UserRole>('Administrator');
  const [userEmail, setUserEmail]                 = useState('dispatch04@bustrack.ops');
  const [authUser, setAuthUser]                   = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading]             = useState(true);

  // ── Restore session on first load ──────────────────────────────────────────
  useEffect(() => {
    restoreSession().then(user => {
      if (user) {
        setAuthUser(user);
        setUserEmail(user.email);
        // Map Django role → Stitch UserRole
        const roleMap: Record<string, UserRole> = {
          admin:   'Administrator',
          driver:  'Driver',
          student: 'Student/Parent',
        };
        setUserRole(roleMap[user.role] ?? 'Student/Parent');
        // Land on the right portal automatically
        const portalMap: Record<string, ViewMode> = {
          admin:   'admin-portal',
          driver:  'driver-portal',
          student: 'student-portal',
        };
        setCurrentView(portalMap[user.role] ?? 'dashboard');
      }
      setAuthLoading(false);
    });
  }, []);

  // ── Navigation guard — redirect to login if not authenticated ──────────────
  const navigateTo = (view: ViewMode) => {
    if (PROTECTED_VIEWS.includes(view) && !authUser) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const addToast = (title: string, description: string) => {
    const id = String(Date.now());
    setToasts(prev => [...prev, { id, title, description }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLoginSuccess = (role: UserRole, email: string, user?: AuthUser) => {
    setUserRole(role);
    setUserEmail(email);
    if (user) setAuthUser(user);
    addToast('Authentication Verified', `Logged in as ${role} (${email})`);
  };

  const handleLogout = () => {
    logout();
    setAuthUser(null);
    setCurrentView('landing');
    addToast('Signed Out', 'Your session has been cleared.');
  };

  const isFullPageLayout = currentView === 'landing' || currentView === 'login';

  const screensList: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'dashboard',    label: 'Fleet Overview',     icon: 'grid_view' },
    { id: 'driver-portal',label: 'Driver HUD',         icon: 'directions_bus' },
    { id: 'admin-portal', label: 'Admin Portal',       icon: 'admin_panel_settings' },
    { id: 'student-portal',label: 'Student Tracker',   icon: 'school' },
    { id: 'contact',      label: 'Dispatch Support',   icon: 'support_agent' },
    { id: 'landing',      label: 'Landing & Live Map', icon: 'public' },
    { id: 'login',        label: 'Auth & Login',       icon: 'lock' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] animate-spin text-primary">
            sync
          </span>
          <span className="font-telemetry-md text-telemetry-md">Restoring session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Floating Quick Screen Switcher */}
      <aside
        aria-label="Screen Switcher"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface px-3 py-1.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-1.5 max-w-[95vw] overflow-x-auto"
      >
        <span className="text-[11px] font-telemetry-sm text-outline-variant uppercase px-2 shrink-0 hidden sm:inline">
          Screens:
        </span>
        {screensList.map(screen => (
          <button
            key={screen.id}
            onClick={() => navigateTo(screen.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              currentView === screen.id
                ? 'bg-primary text-white shadow-md'
                : 'text-outline-variant hover:text-white hover:bg-white/10'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">{screen.icon}</span>
            <span>{screen.label}</span>
          </button>
        ))}
      </aside>

      {isFullPageLayout ? (
        <main className="w-full min-h-screen">
          {currentView === 'landing' && <LandingView onNavigate={navigateTo} />}
          {currentView === 'login' && (
            <AuthView
              onNavigate={navigateTo}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </main>
      ) : (
        <div className="flex w-full min-h-screen bg-surface">
          <Sidebar
            currentView={currentView}
            onNavigate={navigateTo}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onLogout={handleLogout}
            userName={authUser?.name ?? userEmail}
          />

          <div className="flex-1 w-full lg:pl-64 flex flex-col min-h-screen">
            <Header
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onNavigate={navigateTo}
              activeRoute={activeRoute}
              onSelectRoute={setActiveRoute}
              unreadCount={3}
            />

            <main className="w-full pt-20 px-space-md sm:px-space-lg lg:px-space-xl flex-1 max-w-[1600px] mx-auto">
              {currentView === 'dashboard'     && <DashboardView  onNavigate={navigateTo} onShowToast={addToast} />}
              {currentView === 'driver-portal' && <DriverView     onNavigate={navigateTo} onShowToast={addToast} />}
              {currentView === 'admin-portal'  && <AdminView      onNavigate={navigateTo} onShowToast={addToast} />}
              {currentView === 'student-portal'&& <StudentView    onNavigate={navigateTo} onShowToast={addToast} />}
              {currentView === 'contact'       && <ContactView    onNavigate={navigateTo} onShowToast={addToast} />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
