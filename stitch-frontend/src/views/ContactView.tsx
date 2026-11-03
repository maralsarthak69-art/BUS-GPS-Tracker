import React, { useState } from 'react';
import { ViewMode } from '../types';
import { ASSETS } from '../mockData';

interface ContactViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate, onShowToast }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('emergency_dispatch');
  const [priority, setPriority] = useState<'low' | 'medium' | 'urgent'>('urgent');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handlePrioritySelect = (level: 'low' | 'medium' | 'urgent') => {
    setPriority(level);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
      onShowToast('Incident Ticket Dispatched', `Logged ${ticketId} with SLA response under 90s.`);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied to Clipboard', text);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Status & Incident Announcement Banner */}
      <div className="w-full mb-space-lg">
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-space-xs">
                Operational Telemetry Desk Status: Active Triaging
                <span className="bg-secondary-fixed text-on-secondary-fixed font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded-full font-semibold">
                  SYSTEM LEVEL 1
                </span>
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Live operator queue: 3 open transmissions • Average pickup under 14s
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-end md:self-auto">
            <span className="font-telemetry-sm text-telemetry-sm text-outline font-medium uppercase tracking-wider">
              ENC-256 CHANNEL
            </span>
            <span className="material-symbols-outlined text-secondary text-[18px]">
              verified_user
            </span>
          </div>
        </div>
      </div>

      {/* Header Section with Tactical Grid Aesthetic */}
      <header className="w-full text-center py-space-xl px-space-md relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm mb-space-xl border border-surface-container/50">
        <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-primary font-telemetry-sm text-telemetry-sm uppercase tracking-widest mb-space-sm">
          <span className="material-symbols-outlined text-[16px]">headset_mic</span>
          Unified Support Portal • Node OPS-East
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface max-w-4xl mx-auto tracking-tight">
          District Transit Support & Emergency Dispatch
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-space-sm">
          Have questions about fleet integration, parent accounts, or emergency routing? Reach our operations team 24/7.
        </p>

        {/* Quick Stats Bar inside Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm max-w-3xl mx-auto mt-space-lg pt-space-lg">
          <div className="flex flex-col items-center p-space-sm bg-surface-container-low rounded-lg">
            <span className="font-telemetry-lg text-telemetry-lg text-primary font-semibold">
              90s
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Emergency SLA
            </span>
          </div>
          <div className="flex flex-col items-center p-space-sm bg-surface-container-low rounded-lg">
            <span className="font-telemetry-lg text-telemetry-lg text-secondary font-semibold">
              100%
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Fleet Coverage
            </span>
          </div>
          <div className="flex flex-col items-center p-space-sm bg-surface-container-low rounded-lg">
            <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
              142
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Active Dispatches
            </span>
          </div>
          <div className="flex flex-col items-center p-space-sm bg-surface-container-low rounded-lg">
            <span className="font-telemetry-lg text-telemetry-lg text-primary font-semibold">
              24/7/365
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Telemetry Desk
            </span>
          </div>
        </div>
      </header>

      {/* 2-Column Core Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* LEFT COLUMN: Contact & Incident Ticket Form (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-space-lg bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-surface-container/50">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="p-space-xs rounded-lg bg-primary-fixed text-on-primary-fixed">
                <span className="material-symbols-outlined text-[22px]">assignment_add</span>
              </span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Dispatch & Incident Submission
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Direct pipeline to district route controller and hardware telemetry team
                </p>
              </div>
            </div>
            <span className="font-telemetry-sm text-telemetry-sm text-outline bg-surface-container px-space-sm py-1 rounded">
              SEC-FORM #892
            </span>
          </div>

          {submittedTicket ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-2xl">check</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-emerald-950 font-bold">
                Ticket Successfully Logged: {submittedTicket}
              </h3>
              <p className="text-sm text-emerald-800 max-w-md mx-auto">
                Assigned to Primary Dispatcher Console with active SLA countdown. A confirmation with priority radio frequency has been transmitted.
              </p>
              <button
                onClick={() => {
                  setSubmittedTicket(null);
                  setSubject('');
                  setMessage('');
                  setFiles([]);
                }}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
                type="button"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-space-lg" onSubmit={handleFormSubmit}>
              {/* Name Duo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
                    htmlFor="firstName"
                  >
                    <span>First Name</span>
                    <span className="text-error font-telemetry-sm text-telemetry-sm">*</span>
                  </label>
                  <input
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all placeholder:text-outline-variant border border-transparent focus:border-primary/20"
                    id="firstName"
                    placeholder="e.g. Elena"
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
                    htmlFor="lastName"
                  >
                    <span>Last Name</span>
                    <span className="text-error font-telemetry-sm text-telemetry-sm">*</span>
                  </label>
                  <input
                    className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all placeholder:text-outline-variant border border-transparent focus:border-primary/20"
                    id="lastName"
                    placeholder="e.g. Vance"
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
                    htmlFor="email"
                  >
                    <span>District / School Email</span>
                    <span className="text-error font-telemetry-sm text-telemetry-sm">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                      mail
                    </span>
                    <input
                      className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all placeholder:text-outline-variant border border-transparent focus:border-primary/20"
                      id="email"
                      placeholder="evance@metrodistrict.k12.us"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium"
                    htmlFor="category"
                  >
                    Inquirer Category
                  </label>
                  <div className="relative flex items-center">
                    <select
                      className="w-full h-10 px-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none appearance-none cursor-pointer pr-10 border border-transparent focus:border-primary/20"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="district_admin">District Administrator</option>
                      <option value="driver_contractor">Driver / Contractor</option>
                      <option value="parent_guardian">Parent / Guardian</option>
                      <option value="emergency_dispatch">Emergency Dispatch</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 pointer-events-none text-outline text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Level Pill Selectors */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-medium">
                    Ticket Priority Level
                  </label>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline">
                    Select triage queue
                  </span>
                </div>
                <div aria-label="Priority Level" className="grid grid-cols-3 gap-space-sm" role="radiogroup">
                  <button
                    className={`priority-btn flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg transition-all ${
                      priority === 'low'
                        ? 'bg-surface-container-highest text-on-surface shadow-sm font-semibold'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                    onClick={() => handlePrioritySelect('low')}
                    type="button"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md">Low (Routine)</span>
                  </button>

                  <button
                    className={`priority-btn flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg transition-all ${
                      priority === 'medium'
                        ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm font-semibold'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                    onClick={() => handlePrioritySelect('medium')}
                    type="button"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary-container"></span>
                    <span className="font-label-md text-label-md">Medium</span>
                  </button>

                  <button
                    className={`priority-btn flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg transition-all ${
                      priority === 'urgent'
                        ? 'bg-error-container text-on-error-container shadow-sm font-semibold'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                    onClick={() => handlePrioritySelect('urgent')}
                    type="button"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                    </span>
                    <span className="font-label-md text-label-md">Urgent Incident</span>
                  </button>
                </div>
              </div>

              {/* Subject Line */}
              <div className="flex flex-col gap-space-xs">
                <label
                  className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
                  htmlFor="subject"
                >
                  <span>Subject Line</span>
                  <span className="text-error font-telemetry-sm text-telemetry-sm">*</span>
                </label>
                <input
                  className="h-10 px-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all placeholder:text-outline-variant border border-transparent focus:border-primary/20"
                  id="subject"
                  placeholder="e.g. Bus #402 Delay / Telemetry Beacon Lost at Sector 4"
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Detailed Message */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium flex items-center gap-space-xs"
                    htmlFor="message"
                  >
                    <span>Detailed Message & Circumstance Log</span>
                    <span className="text-error font-telemetry-sm text-telemetry-sm">*</span>
                  </label>
                  <span className="font-telemetry-sm text-telemetry-sm text-outline-variant">
                    Markdown supported
                  </span>
                </div>
                <textarea
                  className="p-space-md bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all resize-y placeholder:text-outline-variant border border-transparent focus:border-primary/20"
                  id="message"
                  placeholder="Please detail exact route number, cross streets, driver radio ID, or technical error codes..."
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              {/* File Attachment Dropzone */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">
                  Attach Evidence or Diagnostic Stream
                </label>
                <label
                  htmlFor="fileUpload"
                  className="relative rounded-xl p-space-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-surface-container-low hover:bg-surface-container border border-dashed border-outline-variant"
                >
                  <input
                    accept=".mp4,.csv,.json,.png,.jpg,.log"
                    className="hidden"
                    id="fileUpload"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                  <div className="p-space-sm rounded-full bg-surface-container-lowest text-primary mb-space-xs shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-medium">
                    Drop dashcam clips, GPS telemetry logs, or click to browse
                  </p>
                  <p className="font-telemetry-sm text-telemetry-sm text-outline mt-1">
                    Supported: .MP4, .LOG, .CSV, .JSON up to 250MB (Encrypted in transit)
                  </p>

                  {files.length > 0 && (
                    <div className="mt-space-sm flex flex-wrap gap-space-xs justify-center">
                      {files.map((f, i) => (
                        <span
                          key={i}
                          className="font-telemetry-sm text-telemetry-sm px-2 py-1 rounded bg-surface-container-highest text-primary flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">attachment</span>
                          {f.name} ({Math.round(f.size / 1024)} KB)
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              </div>

              {/* Primary Action */}
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <button
                  className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold tracking-wide flex items-center justify-center gap-space-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSubmitting ? 'animate-spin' : ''
                    }`}
                  >
                    {isSubmitting ? 'sync' : 'send_time_extension'}
                  </span>
                  <span>
                    {isSubmitting
                      ? 'Routing to Primary Dispatcher...'
                      : 'Submit Inquiry / Dispatch Ticket'}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-space-xs text-outline font-telemetry-sm text-telemetry-sm text-center">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    lock
                  </span>
                  <span>
                    Zero-loss dispatch log. All inquiries timestamped to immutable fleet record.
                  </span>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* RIGHT COLUMN: Operations HQ, Hotlines & Hours (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Response Time Guarantee Badge Banner */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md border border-surface-container/50">
            <div className="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[28px]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase font-semibold text-primary tracking-wider">
                Service Guarantee
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                Average emergency response: under 90 seconds
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Real-time rerouting coordinated via automated relay
              </span>
            </div>
          </div>

          {/* Live Dispatch Center Visual Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container/50">
            <div className="p-space-md flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Central Operations HQ
                </span>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                TERMINAL 01 • METRO
              </span>
            </div>

            {/* Map Container */}
            <div
              className="w-full h-48 bg-surface-container bg-cover bg-center relative select-none"
              style={{ backgroundImage: `url(${ASSETS.mapCentralHQ})` }}
            >
              <div className="absolute inset-0 bg-inverse-surface/10 pointer-events-none"></div>
              <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 rounded shadow-sm flex items-center gap-space-xs">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-telemetry-sm text-telemetry-sm font-semibold text-on-surface">
                  RADAR ACTIVE
                </span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary opacity-60"></span>
                  <div className="h-6 w-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                  </div>
                </div>
                <div className="bg-inverse-surface text-inverse-on-surface font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded shadow-md mt-1 whitespace-nowrap">
                  500 Transit Way
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-inverse-surface/80 text-inverse-on-surface font-telemetry-sm text-telemetry-sm px-2 py-0.5 rounded">
                GPS: 40.7128° N, 74.0060° W
              </div>
            </div>

            <div className="p-space-md flex items-center justify-between bg-surface-container-lowest">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Transit Command Tower
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  500 Transit Way, Metro Hub, Suite 400
                </span>
              </div>
              <button
                onClick={() =>
                  onShowToast(
                    'Directions Loaded',
                    'Routing from current terminal to 500 Transit Way (ETA 14 mins).'
                  )
                }
                className="h-8 px-space-md bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center gap-space-xs transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Contact Details List */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container/50">
            <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              High-Priority Communications
            </h3>
            {/* Hotline */}
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">phone_in_talk</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    24/7 Fleet Emergency Hotline
                  </span>
                  <span className="font-telemetry-md text-telemetry-md font-medium text-error">
                    1-800-BUSTRACK
                  </span>
                </div>
              </div>
              <button
                className="p-2 rounded-lg text-outline-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
                onClick={() => copyToClipboard('1-800-BUSTRACK')}
                title="Copy Number"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>

            {/* Support Email */}
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">alternate_email</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Operations Support Email
                  </span>
                  <span className="font-telemetry-md text-telemetry-md font-medium text-primary">
                    ops@bustrack-transit.gov
                  </span>
                </div>
              </div>
              <button
                className="p-2 rounded-lg text-outline-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
                onClick={() => copyToClipboard('ops@bustrack-transit.gov')}
                title="Copy Email"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>

            {/* VHF Channel */}
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">radio</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Regional Dispatch VHF Radio
                  </span>
                  <span className="font-telemetry-md text-telemetry-md font-medium text-secondary">
                    Channel 16 • 156.800 MHz
                  </span>
                </div>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-outline bg-surface-container px-2 py-1 rounded">
                FM TACTICAL
              </span>
            </div>
          </div>

          {/* Office & Dispatch Hours Card */}
          <div className="rounded-xl shadow-md p-space-lg flex flex-col gap-space-md bg-[#0F172A] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs text-white">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  calendar_clock
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-white">
                  Office & Dispatch Hours
                </h3>
              </div>
              <span className="font-telemetry-sm text-telemetry-sm text-outline-variant uppercase">
                UTC -05:00
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {/* Mon-Fri */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-white/5">
                <div className="flex items-center gap-space-sm">
                  <span className="h-2 w-2 rounded-full bg-secondary"></span>
                  <span className="font-body-md text-body-md text-white font-medium">
                    Monday – Friday
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-telemetry-sm text-telemetry-sm text-white font-semibold">
                    05:00 AM – 09:00 PM
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed">
                    Active Dispatch & Hardware Support
                  </span>
                </div>
              </div>

              {/* Saturday */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-white/5">
                <div className="flex items-center gap-space-sm">
                  <span className="h-2 w-2 rounded-full bg-secondary-fixed-dim"></span>
                  <span className="font-body-md text-body-md text-white font-medium">
                    Saturday
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-telemetry-sm text-telemetry-sm text-white font-semibold">
                    07:00 AM – 05:00 PM
                  </span>
                  <span className="font-label-sm text-label-sm text-outline-variant">
                    Fleet Maintenance Standby
                  </span>
                </div>
              </div>

              {/* Sunday */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-[#EF4444]/15">
                <div className="flex items-center gap-space-sm">
                  <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                  <span className="font-body-md text-body-md text-[#EF4444] font-semibold">
                    Sunday
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-telemetry-sm text-telemetry-sm text-[#EF4444] font-bold tracking-tight">
                    Emergency Routing Only
                  </span>
                  <span className="font-label-sm text-label-sm text-[#EF4444]/80">
                    Admin offices closed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs text-outline-variant font-telemetry-sm text-telemetry-sm">
              <span>Failover routing auto-escalates via cellular telemetry bridge.</span>
            </div>
          </div>
        </section>
      </div>

      {/* Operational Dispatch Centers / Facility Network Section */}
      <section className="mt-space-xl pt-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-xs">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Regional Nodes
            </span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Secondary Depots & Telemetry Relays
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            Field operations centers provide real-time hardware swapouts, replacement buses, and localized district dispatchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Facility 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/50">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold">
                  NORTH DEPOT
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-secondary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> OPERATIONAL
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                Lincoln Corridor Yard
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                1420 N. Industrial Parkway • Fleet capacity 65 units
              </p>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md p-space-md rounded-b-xl">
              <span className="font-telemetry-sm text-telemetry-sm text-outline">
                Radio Ch. 04
              </span>
              <button
                onClick={() =>
                  onShowToast('Radio Channel 04 Connected', 'Linked to Lincoln Corridor Yard dispatcher.')
                }
                className="font-label-md text-label-md text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span>Connect</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Facility 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/50">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold">
                  EAST DEPOT
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-secondary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> OPERATIONAL
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                Highland Transit Base
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                88 Valley Crest Road • Fleet capacity 48 units
              </p>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md p-space-md rounded-b-xl">
              <span className="font-telemetry-sm text-telemetry-sm text-outline">
                Radio Ch. 09
              </span>
              <button
                onClick={() =>
                  onShowToast('Radio Channel 09 Connected', 'Linked to Highland Transit Base dispatcher.')
                }
                className="font-label-md text-label-md text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span>Connect</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Facility 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/50">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold">
                  SOUTH RELAY
                </span>
                <span className="font-telemetry-sm text-telemetry-sm text-secondary-container flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> STANDBY
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                Harbor Fleet Station
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                310 Port Authority Pier 9 • Battery Swap & Diagnostic
              </p>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md p-space-md rounded-b-xl">
              <span className="font-telemetry-sm text-telemetry-sm text-outline">
                Radio Ch. 12
              </span>
              <button
                onClick={() =>
                  onShowToast('Radio Channel 12 Connected', 'Linked to Harbor Fleet Station diagnostic relay.')
                }
                className="font-label-md text-label-md text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span>Connect</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
