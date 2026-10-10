import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { RegisterModal } from './components/auth/RegisterModal';
import { SubscriptionPaywallModal } from './components/auth/SubscriptionPaywallModal';
import { PortfolioAllocationModal } from './components/portfolios/PortfolioAllocationModal';
import { BankReportingModal } from './components/reports/BankReportingModal';
import { PayrollEngineModal } from './components/payroll/PayrollEngineModal';
import { AdminDashboard } from './components/portals/AdminDashboard';
import { ManagerPanel } from './components/portals/ManagerPanel';
import { HRPanel } from './components/portals/HRPanel';
import { SupervisorPanel } from './components/portals/SupervisorPanel';
import { TelecallerPortal } from './components/portals/TelecallerPortal';
import { FOSPortal } from './components/portals/FOSPortal';
import { ToastContainer } from './components/common/ToastContainer';
import {
  ShieldCheck,
  Briefcase,
  Users,
  UserCheck,
  PhoneCall,
  MapPin,
  Lock,
  Sparkles,
  CreditCard,
  Building2,
  FileSpreadsheet,
  UploadCloud,
  DollarSign,
  Layers,
} from 'lucide-react';
import { formatINR } from './utils/export';

const MainLayout: React.FC = () => {
  const { agency, currentRole, setRole, currentUser } = useApp();

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [isBankReportOpen, setIsBankReportOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);

  const roles = [
    { id: 'Admin', label: 'Admin Dashboard', icon: ShieldCheck, color: 'text-indigo-600' },
    { id: 'Manager', label: 'Manager Panel', icon: Briefcase, color: 'text-purple-600' },
    { id: 'HR', label: 'HR Panel', icon: Users, color: 'text-pink-600' },
    { id: 'Supervisor', label: 'Supervisor Panel', icon: UserCheck, color: 'text-amber-600' },
    { id: 'Telecaller', label: 'Telecaller CRM', icon: PhoneCall, color: 'text-emerald-600' },
    { id: 'FOS', label: 'FOS Field Portal', icon: MapPin, color: 'text-blue-600' },
  ] as const;

  // Check subscription expiry paywall
  const isExpired = agency.subscriptionStatus === 'expired';

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenAllocation={() => setIsAllocationOpen(true)}
        onOpenBankReport={() => setIsBankReportOpen(true)}
        onOpenPayroll={() => setIsPayrollOpen(true)}
      />

      {/* Role Navigation Tab Bar */}
      <nav aria-label="Role Portals Navigation" className="bg-white border-b border-slate-200 sticky top-[69px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2 gap-2 no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {roles.map(r => {
                const Icon = r.icon;
                const isActive = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : r.color}`} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0 text-xs text-slate-500 pl-4 border-l border-slate-200">
              <span className="font-semibold text-slate-700">Operating As:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                {currentUser.name} ({currentRole})
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If trial is expired, show paywall prompt overlay / banner */}
        {isExpired ? (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-rose-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                1-Month Free Trial Expired
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Unlock Recovery OS Main Dashboard
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your 30-day trial period for <strong>{agency.name}</strong> has concluded. Please activate your monthly subscription of ₹999/month to continue live operations.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                What's Unlocked with Subscription:
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span> Full Access to 6 Role Portals (Admin, Manager, HR, Supervisor, TC, FOS)
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span> Unlimited Bank Portfolios (Bajaj, Hero, HDFC, SBI)
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span> FOS Google Location GPS Geo-Verification Engine
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span> Direct Day-End Bank MIS Reports (.xlsx / .csv)
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span> Statutory PF (12%) & ESIC (0.75%) Payroll Engine
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsSubscriptionOpen(true)}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Pay ₹999 / Month & Unlock Instantly
              </button>
            </div>
          </div>
        ) : (
          /* Normal Dashboard Portals */
          <>
            {currentRole === 'Admin' && (
              <AdminDashboard
                onOpenAllocation={() => setIsAllocationOpen(true)}
                onOpenBankReport={() => setIsBankReportOpen(true)}
                onOpenPayroll={() => setIsPayrollOpen(true)}
              />
            )}

            {currentRole === 'Manager' && <ManagerPanel />}

            {currentRole === 'HR' && <HRPanel />}

            {currentRole === 'Supervisor' && <SupervisorPanel />}

            {currentRole === 'Telecaller' && <TelecallerPortal />}

            {currentRole === 'FOS' && <FOSPortal />}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Recovery OS</span>
            <span>•</span>
            <span>Enterprise Debt Recovery Agency Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>GSTIN: {agency.gstPan}</span>
            <span>•</span>
            <span>Monthly License: {formatINR(agency.monthlyFee)}/mo</span>
            <span>•</span>
            <span>Version 2.6</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <SubscriptionPaywallModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      <PortfolioAllocationModal
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
      />

      <BankReportingModal
        isOpen={isBankReportOpen}
        onClose={() => setIsBankReportOpen(false)}
      />

      <PayrollEngineModal
        isOpen={isPayrollOpen}
        onClose={() => setIsPayrollOpen(false)}
      />

      {/* Global Toasts */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
