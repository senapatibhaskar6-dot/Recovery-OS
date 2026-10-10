import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  PhoneCall,
  MapPin,
  FileSpreadsheet,
  DollarSign,
  UploadCloud,
  ChevronDown,
  Sparkles,
  CreditCard,
  UserCheck,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/export';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenSubscription: () => void;
  onOpenAllocation: () => void;
  onOpenBankReport: () => void;
  onOpenPayroll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenSubscription,
  onOpenAllocation,
  onOpenBankReport,
  onOpenPayroll,
}) => {
  const {
    agency,
    currentRole,
    currentUser,
    setRole,
    staff,
    setCurrentUser,
    toggleSubscriptionExpiry,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Compute trial days remaining
  const trialEndDate = new Date(agency.trialExpiresAt);
  const today = new Date();
  const diffTime = trialEndDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const roles: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { role: 'Admin', label: 'Admin', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Full System Oversight & Approvals' },
    { role: 'Manager', label: 'Manager', icon: Briefcase, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Portfolios & Target Oversight' },
    { role: 'HR', label: 'HR', icon: Users, color: 'text-pink-600 bg-pink-50 border-pink-200', desc: 'Staff Roster & Digital Attendance' },
    { role: 'Supervisor', label: 'Supervisor', icon: UserCheck, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Live Calling & Field Review' },
    { role: 'Telecaller', label: 'Telecaller', icon: PhoneCall, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Calling CRM & PTP Logging' },
    { role: 'FOS', label: 'FOS (Field Officer)', icon: MapPin, color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Geo-verified Field Collections' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top operational banner for subscription / trial status */}
      <div className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b ${
        agency.subscriptionStatus === 'expired'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : agency.subscriptionStatus === 'active'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
      }`}>
        <div className="flex items-center gap-2">
          {agency.subscriptionStatus === 'expired' ? (
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4" />
              1-Month Free Trial Expired. Dashboard features locked until subscription renewal.
            </span>
          ) : agency.subscriptionStatus === 'active' ? (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <Sparkles className="w-4 h-4" />
              Agency Pro Active Subscription (₹999/month) — Unlimited Portfolios & Users
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>
                1-Month Free Trial Active: <strong className="font-semibold text-indigo-700">{daysLeft} days remaining</strong> (Renews at ₹999/month)
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSubscriptionExpiry}
            title="Toggle between Trial / Expired state to test paywall logic"
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/80 hover:bg-white text-slate-700 border border-slate-200 transition-colors"
          >
            Simulate: {agency.subscriptionStatus === 'expired' ? 'Restore Trial' : 'Expire Trial'}
          </button>
          
          <button
            onClick={onOpenSubscription}
            className={`px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              agency.subscriptionStatus === 'expired'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {agency.subscriptionStatus === 'expired' ? 'Pay ₹999 to Unlock' : 'Subscription Plan'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Agency Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tight text-lg shadow-sm">
              R<span className="text-indigo-400">OS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">Recovery OS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  v2.6 Enterprise
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-[340px]" title={agency.name}>
                {agency.name}
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Action Bar */}
            <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-200 pr-3 mr-1">
              <button
                onClick={onOpenAllocation}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Upload multi-portfolio CSV to automatically distribute accounts"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                Upload CSV
              </button>

              <button
                onClick={onOpenBankReport}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Generate and download Day-End Bank MIS Report (.xlsx/.csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Bank MIS Export
              </button>

              <button
                onClick={onOpenPayroll}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Statutory Payroll (PF, ESIC, PT) & FOS Commission calculation"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                Payroll & PF
              </button>
            </div>

            {/* Role Switcher Pill / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition-all"
              >
                <span className="text-slate-500 font-normal">Active Role:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {currentRole}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Workspace Role
                  </div>
                  {roles.map(r => {
                    const Icon = r.icon;
                    const isActive = currentRole === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => setRole(r.role)}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-indigo-50/60 font-semibold' : ''
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-md ${r.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{r.label}</span>
                            {isActive && (
                              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/70 px-1.5 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile / Switch Staff Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                title={currentUser.name}
              >
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarColor || 'bg-slate-800'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                      <span>Code: {currentUser.employeeCode}</span>
                      <span>•</span>
                      <span>Salary: {formatINR(currentUser.baseSalary)}</span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fast Switch to Staff Member
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {staff.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => setCurrentUser(emp)}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 ${
                          currentUser.id === emp.id ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${emp.avatarColor}`} />
                          <span>{emp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          {emp.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      onClick={onOpenRegister}
                      className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1.5 font-medium"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Register New Agency / Edit Agency
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
