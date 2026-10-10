import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Building2,
  PhoneCall,
  MapPin,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { formatINR, formatNumber } from '../../utils/export';

interface AdminDashboardProps {
  onOpenAllocation: () => void;
  onOpenBankReport: () => void;
  onOpenPayroll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAllocation,
  onOpenBankReport,
  onOpenPayroll,
}) => {
  const {
    agency,
    portfolios,
    accounts,
    receipts,
    staff,
    callLogs,
    payroll,
    approvePayrollBatch,
  } = useApp();

  // Aggregate metrics
  const totalPrincipalManaged = portfolios.reduce((sum, p) => sum + p.totalPrincipalDue, 0);
  const totalRecoveredRupees = receipts.reduce((sum, r) => sum + r.collectedAmount, 0);
  const totalTargetRecovery = portfolios.reduce((sum, p) => sum + p.targetRecovery, 0);
  const recoveryPercentage = totalTargetRecovery > 0 ? ((totalRecoveredRupees / totalTargetRecovery) * 100).toFixed(1) : '0';

  const ptpAccounts = accounts.filter(a => a.currentStatus === 'PTP Committed');
  const brokenPtpAccounts = accounts.filter(a => a.currentStatus === 'Broken PTP');
  const fieldPendingAccounts = accounts.filter(a => a.currentStatus === 'Field Visit Pending');

  const activeTelecallers = staff.filter(s => s.role === 'Telecaller').length;
  const activeFos = staff.filter(s => s.role === 'FOS').length;

  const pendingPayrollApproval = payroll.some(p => p.approvalStatus !== 'Approved by Admin');

  return (
    <div className="space-y-6">
      
      {/* Welcome & Top Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Executive Command Center</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Agency Master View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cross-portfolio daily recovery tracking, bank remittances, payroll approvals, and staff oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAllocation}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            Upload Bank CSV
          </button>
          <button
            onClick={onOpenBankReport}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Bank MIS Reports
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recovery Pool</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(totalPrincipalManaged)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{accounts.length} Total Accounts</span>
            <span>•</span>
            <span>{portfolios.length} Bank Clients</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rupee Recovered</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
            {formatINR(totalRecoveredRupees)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{recoveryPercentage}% of Monthly Target ({formatINR(totalTargetRecovery)})</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active PTP Pipeline</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-900 tracking-tight">
            {ptpAccounts.length} Accounts
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Commitment: {formatINR(ptpAccounts.reduce((s, a) => s + (a.ptpAmount || 0), 0))}</span>
            {brokenPtpAccounts.length > 0 && (
              <span className="text-rose-600 font-semibold">{brokenPtpAccounts.length} Broken</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Operational Workforce</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {staff.length} Active Staff
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{activeTelecallers} Telecallers</span>
            <span>•</span>
            <span>{activeFos} Field Officers (FOS)</span>
          </div>
        </div>

      </div>

      {/* Payroll Approval & Compliance Action Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold tracking-tight">Month-End Statutory Payroll & FOS Commission Status</h3>
          </div>
          <p className="text-xs text-slate-300">
            October 2026 payroll engine calculated: EPF (12%), ESIC (0.75%), PT (₹200) and tiered recovery commissions for {staff.length} staff members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPayroll}
            className="px-4 py-2 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-xl transition-all shadow-xs"
          >
            Review Salary Slips
          </button>
          {pendingPayrollApproval && (
            <button
              onClick={approvePayrollBatch}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Payroll
            </button>
          )}
        </div>
      </div>

      {/* Bank Client Portfolios Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-wider">
              Client Bank Portfolios Performance
            </h2>
          </div>
          <button
            onClick={onOpenAllocation}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            + Allocate New Portfolio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolios.map(p => {
            const pct = p.targetRecovery > 0 ? Math.round((p.totalCollected / p.targetRecovery) * 100) : 0;
            return (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {p.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{pct}% Target</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1" title={p.name}>
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.clientBank}</p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Accounts:</span>
                      <span className="font-semibold text-slate-900">{p.totalAccounts}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Principal Due:</span>
                      <span className="font-semibold text-slate-900">{formatINR(p.totalPrincipalDue)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Recovered to Date:</span>
                      <span className="font-bold text-emerald-700">{formatINR(p.totalCollected)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${p.logoColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target: {formatINR(p.targetRecovery)}</span>
                    <span>Mgr: {p.managerInCharge.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Live Collection Stream & Recent Calling Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Live Collection Slips Stream */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Field & Office Collections
              </h2>
            </div>
            <span className="text-xs text-slate-500">{receipts.length} Transactions</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {receipts.map(r => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                    r.paymentMode === 'UPI' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    {r.paymentMode === 'UPI' ? 'UPI' : 'CSH'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-500">{r.loanAccountNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Collected by <strong className="text-slate-800">{r.collectedByName}</strong> ({r.collectedByRole})
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        r.geoVerificationStatus === 'Verified On-Site'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <MapPin className="w-2.5 h-2.5" />
                        {r.geoVerificationStatus}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.collectedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">{formatINR(r.collectedAmount)}</div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 inline-block ${
                    r.supervisorApprovalStatus === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {r.supervisorApprovalStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Telecalling Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Calling Activity & Dispositions
              </h2>
            </div>
            <span className="text-xs text-slate-500">{callLogs.length} Calls Logged</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {callLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-start justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{log.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{log.loanAccountNumber}</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-1">
                    Disposition:{' '}
                    <span className={`font-bold ${
                      log.disposition.includes('PTP')
                        ? 'text-emerald-700'
                        : log.disposition.includes('Refused')
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      {log.disposition}
                    </span>
                  </div>
                  {log.ptpAmount && (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                      PTP: {formatINR(log.ptpAmount)} on {log.ptpDate}
                    </div>
                  )}
                  {log.remarks && (
                    <p className="text-[11px] text-slate-500 italic mt-1">&quot;{log.remarks}&quot;</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{log.timestamp}</span>
                  <span className="text-[10px] font-semibold text-indigo-600 block mt-1">
                    {log.telecallerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
