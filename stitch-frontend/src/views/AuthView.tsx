import React, { useState } from 'react';
import { ViewMode, UserRole } from '../types';
import { ASSETS } from '../mockData';

interface AuthViewProps {
  onNavigate: (view: ViewMode) => void;
  onLoginSuccess: (role: UserRole, email: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student/Parent');
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showParentAccordion, setShowParentAccordion] = useState(false);

  // Form states
  const [email, setEmail] = useState('parent@district.org');
  const [password, setPassword] = useState('••••••••••••');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regGrade, setRegGrade] = useState('9');
  const [regRoute, setRegRoute] = useState('12');
  const [regStop, setRegStop] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'Administrator') {
      setEmail('e.rostova@bustrack.ops');
    } else if (role === 'Driver') {
      setEmail('m.vance@transit.local');
    } else {
      setEmail('parent@district.org');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback('Authenticating credentials over TLS 1.3...');
    setTimeout(() => {
      onLoginSuccess(selectedRole, email);
      if (selectedRole === 'Administrator') {
        onNavigate('admin-portal');
      } else if (selectedRole === 'Driver') {
        onNavigate('driver-portal');
      } else {
        onNavigate('student-portal');
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass !== regPass2) {
      setFormFeedback('Passwords do not match. Please verify.');
      return;
    }
    setFormFeedback('Registering Student ID & provisioning RFID pass...');
    setTimeout(() => {
      onLoginSuccess('Student/Parent', regEmail || 'parent@district.org');
      onNavigate('student-portal');
    }, 800);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Top back to landing link */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-medium bg-surface-container-low px-3 py-1.5 rounded-lg shadow-sm"
        type="button"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to BusTrack Homepage</span>
      </button>

      <main className="w-full max-w-md mx-auto my-auto p-space-sm sm:p-space-lg">
        <div className="flex flex-col w-full items-center justify-center py-space-sm sm:py-space-md">
          {/* Subtle ambient decorative glow behind card */}
          <div className="relative w-full max-w-[440px]">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-primary-fixed-dim/25 via-secondary-fixed/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            {/* Main Auth Card */}
            <div className="relative w-full bg-surface-container-lowest rounded-xl shadow-xl p-space-md sm:p-space-lg border border-surface-container/50">
              {/* Card Header: Brand Logo & Typography */}
              <div className="flex flex-col items-center text-center mb-space-md">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-low shadow-sm mb-space-xs">
                  <img
                    alt="BusTrack Logo"
                    className="w-8 h-8 object-contain"
                    src={ASSETS.logo}
                  />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Welcome to BusTrack
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  IoT-powered transit & student safety portal
                </p>
              </div>

              {/* Segmented Role Selector */}
              <div className="w-full bg-surface-container-low p-1 rounded-lg mb-space-md shadow-inner">
                <div
                  aria-label="Portal Role Selector"
                  className="grid grid-cols-3 gap-1"
                  role="tablist"
                >
                  <button
                    className={`role-btn py-1 px-2 rounded font-label-sm text-label-sm flex items-center justify-center gap-1 transition-all ${
                      selectedRole === 'Administrator'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleRoleChange('Administrator')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      admin_panel_settings
                    </span>
                    <span className="truncate">Administrator</span>
                  </button>

                  <button
                    className={`role-btn py-1 px-2 rounded font-label-sm text-label-sm flex items-center justify-center gap-1 transition-all ${
                      selectedRole === 'Driver'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleRoleChange('Driver')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      directions_bus
                    </span>
                    <span className="truncate">Driver</span>
                  </button>

                  <button
                    className={`role-btn py-1 px-2 rounded font-label-sm text-label-sm flex items-center justify-center gap-1 transition-all ${
                      selectedRole === 'Student/Parent'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleRoleChange('Student/Parent')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      school
                    </span>
                    <span className="truncate">Student/Parent</span>
                  </button>
                </div>
              </div>

              {/* Live GPS Fleet Telemetry Badge */}
              <div className="flex items-center justify-between px-space-sm py-1 bg-surface-container-low rounded-lg mb-space-md">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant font-medium">
                    District Transit Grid #09
                  </span>
                </div>
                <span className="font-telemetry-sm text-telemetry-sm text-primary font-semibold">
                  99.4% ON-TIME
                </span>
              </div>

              {/* Action Mode Switcher: Sign In vs Create Account */}
              <div className="flex rounded-lg bg-surface-container-low p-0.5 mb-space-md">
                <button
                  className={`flex-1 py-1.5 text-center font-label-md text-label-md rounded transition-all ${
                    authTab === 'signin'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setAuthTab('signin')}
                  type="button"
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-1.5 text-center font-label-md text-label-md rounded transition-all ${
                    authTab === 'register'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-medium'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setAuthTab('register')}
                  type="button"
                >
                  Create Account
                </button>
              </div>

              {/* Feedback Alert if any */}
              {formFeedback && (
                <div className="mb-3 p-2 rounded-lg bg-surface-container-high text-primary font-telemetry-sm text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    sync
                  </span>
                  <span>{formFeedback}</span>
                </div>
              )}

              {/* SIGN IN FORM VIEW */}
              {authTab === 'signin' && (
                <form className="space-y-space-md" onSubmit={handleSignIn}>
                  <div>
                    <label
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                      htmlFor="signin-email"
                    >
                      District or Guardian Email
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px] pointer-events-none">
                        mail
                      </span>
                      <input
                        className="w-full h-9 pl-9 pr-3 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-outline/70 transition-all border border-transparent focus:border-primary/20"
                        id="signin-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="parent@district.org"
                        required
                        type="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant"
                        htmlFor="signin-password"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset verification link sent to ' + email)}
                        className="font-label-sm text-label-sm text-primary hover:text-secondary-container transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px] pointer-events-none">
                        lock
                      </span>
                      <input
                        className="w-full h-9 pl-9 pr-9 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-outline/70 transition-all border border-transparent focus:border-primary/20"
                        id="signin-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        className="absolute right-2.5 text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                        aria-label="Toggle password visibility"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        defaultChecked
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary bg-surface-container-low cursor-pointer"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Remember device for 30 days
                      </span>
                    </label>
                    <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm text-outline">
                      <span className="material-symbols-outlined text-[14px]">
                        verified_user
                      </span>{' '}
                      256-bit
                    </span>
                  </div>

                  <button
                    className="w-full h-10 mt-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg font-medium shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    type="submit"
                  >
                    <span>Sign In to Portal</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </form>
              )}

              {/* CREATE ACCOUNT FORM VIEW */}
              {authTab === 'register' && (
                <form className="space-y-space-sm" onSubmit={handleRegister}>
                  {/* Student Full Name */}
                  <div className="grid grid-cols-2 gap-space-xs">
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-fname"
                      >
                        First Name
                      </label>
                      <input
                        className="w-full h-8 px-2.5 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-fname"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Marcus"
                        required
                        type="text"
                      />
                    </div>
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-lname"
                      >
                        Last Name
                      </label>
                      <input
                        className="w-full h-8 px-2.5 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-lname"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Chen"
                        required
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Contact Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-email"
                      >
                        Account Email
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                          mail
                        </span>
                        <input
                          className="w-full h-8 pl-7 pr-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                          id="reg-email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="contact@home.net"
                          required
                          type="email"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-phone"
                      >
                        SMS Alerts Phone
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                          phone_iphone
                        </span>
                        <input
                          className="w-full h-8 pl-7 pr-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                          id="reg-phone"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="(555) 234-8901"
                          type="tel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student ID & Grade Level */}
                  <div className="grid grid-cols-2 gap-space-xs">
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-sid"
                      >
                        Student District ID
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                          badge
                        </span>
                        <input
                          className="w-full h-8 pl-7 pr-2 font-telemetry-sm text-telemetry-sm bg-surface-container-low focus:bg-surface-container-lowest text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase transition-all"
                          id="reg-sid"
                          value={regStudentId}
                          onChange={(e) => setRegStudentId(e.target.value)}
                          placeholder="STU-8849"
                          required
                          type="text"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-grade"
                      >
                        Grade Level
                      </label>
                      <select
                        className="w-full h-8 px-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-grade"
                        value={regGrade}
                        onChange={(e) => setRegGrade(e.target.value)}
                      >
                        <option value="6">Grade 6 - Middle</option>
                        <option value="7">Grade 7 - Middle</option>
                        <option value="8">Grade 8 - Middle</option>
                        <option value="9">Grade 9 - High School</option>
                        <option value="10">Grade 10 - High School</option>
                        <option value="11">Grade 11 - High School</option>
                        <option value="12">Grade 12 - Senior</option>
                      </select>
                    </div>
                  </div>

                  {/* Bus Route & Stop Routing Info */}
                  <div>
                    <label
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                      htmlFor="reg-route"
                    >
                      Assigned Bus Route
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                        alt_route
                      </span>
                      <select
                        className="w-full h-8 pl-7 pr-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-route"
                        value={regRoute}
                        onChange={(e) => setRegRoute(e.target.value)}
                      >
                        <option value="12">Route 12 - Northside Express (AM/PM)</option>
                        <option value="04">Route 04 - West Valley Metro Loop</option>
                        <option value="09">Route 09 - Highland Heights Circuit</option>
                        <option value="18">Route 18 - South Campus Magnet Shuttle</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                      htmlFor="reg-stop"
                    >
                      Designated Boarding Stop
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                        pin_drop
                      </span>
                      <input
                        className="w-full h-8 pl-7 pr-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-stop"
                        value={regStop}
                        onChange={(e) => setRegStop(e.target.value)}
                        placeholder="e.g. Elm St & 4th Ave Shelter"
                        required
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Collapsible Parent / Guardian Information Accordion */}
                  <div className="rounded-lg bg-surface-container-low overflow-hidden">
                    <button
                      className="w-full px-space-sm py-2 flex items-center justify-between text-left focus:outline-none hover:bg-surface-container transition-colors"
                      onClick={() => setShowParentAccordion(!showParentAccordion)}
                      type="button"
                    >
                      <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface font-medium">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          family_restroom
                        </span>
                        Parent / Guardian Details
                      </span>
                      <span
                        className={`material-symbols-outlined text-outline text-[18px] transition-transform duration-200 ${
                          showParentAccordion ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {showParentAccordion && (
                      <div className="px-space-sm pb-space-sm pt-1 space-y-space-xs">
                        <div className="grid grid-cols-2 gap-space-xs">
                          <input
                            className="w-full h-7 px-2 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Guardian Legal Name"
                            type="text"
                          />
                          <input
                            className="w-full h-7 px-2 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Relationship (e.g. Mother)"
                            type="text"
                          />
                        </div>
                        <input
                          className="w-full h-7 px-2 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Emergency Contact #2 (Optional)"
                          type="text"
                        />
                      </div>
                    )}
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid grid-cols-2 gap-space-xs">
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-pass"
                      >
                        Password
                      </label>
                      <input
                        className="w-full h-8 px-2.5 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-pass"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="Min. 8 chars"
                        required
                        type="password"
                      />
                    </div>
                    <div>
                      <label
                        className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                        htmlFor="reg-pass2"
                      >
                        Confirm
                      </label>
                      <input
                        className="w-full h-8 px-2.5 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="reg-pass2"
                        value={regPass2}
                        onChange={(e) => setRegPass2(e.target.value)}
                        placeholder="Repeat"
                        required
                        type="password"
                      />
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded text-primary focus:ring-primary accent-primary bg-surface-container-low cursor-pointer"
                        required
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                        I agree to the{' '}
                        <span className="text-primary hover:underline">
                          FERPA Telemetry Policy
                        </span>{' '}
                        &{' '}
                        <span className="text-primary hover:underline">
                          Terms of Transit Safety
                        </span>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Register Button */}
                  <button
                    className="w-full h-10 mt-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg font-medium shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    type="submit"
                  >
                    <span>Create Account & Link Route</span>
                    <span className="material-symbols-outlined text-[18px]">
                      how_to_reg
                    </span>
                  </button>
                </form>
              )}

              {/* Role-specific notice banners (dynamic) */}
              {selectedRole === 'Driver' && (
                <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg text-left">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                      terminal
                    </span>
                    <div>
                      <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                        MDT In-Cab Terminal Mode
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Drivers must utilize issued Vehicle Tablet or enter assigned District Operator PIN along with fleet credential.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'Administrator' && (
                <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg text-left">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      shield
                    </span>
                    <div>
                      <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Dispatcher & Fleet Operations
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Requires District 2FA hardware token or SSO through regional transportation directory.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Metadata */}
              <div className="mt-space-md pt-space-sm border-t border-surface-container-high/60 flex flex-col items-center text-center space-y-2">
                <button
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors group"
                  type="button"
                >
                  <span>Need administrator access? Contact fleet manager</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm text-outline">
                    <span className="material-symbols-outlined text-[14px]">lock</span> TLS 1.3
                  </span>
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm text-outline">
                    <span className="material-symbols-outlined text-[14px]">cell_tower</span> AWS IoT Core
                  </span>
                  <span className="inline-flex items-center gap-1 font-telemetry-sm text-telemetry-sm text-outline">
                    <span className="material-symbols-outlined text-[14px]">policy</span> FERPA Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
