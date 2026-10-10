import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  PhoneCall,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Send,
  Filter,
} from 'lucide-react';
import { formatINR } from '../../utils/export';

export const SupervisorPanel: React.FC = () => {
  const {
    staff,
    accounts,
    callLogs,
    receipts,
    updateReceiptApproval,
    updateAccount,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'calling' | 'field'>('calling');

  const telecallers = staff.filter(s => s.role === 'Telecaller');
  const fosAgents = staff.filter(s => s.role === 'FOS');

  // Broken PTP accounts needing field escalation
  const brokenPtps = accounts.filter(
    a => a.currentStatus === 'Broken PTP' || a.currentStatus === 'Field Visit Pending'
  );

  const pendingApprovalReceipts = receipts.filter(r => r.supervisorApprovalStatus === 'Pending Review');

  const handleEscalateToFos = (accountId: string, fosId: string) => {
    const fos = fosAgents.find(f => f.id === fosId) || fosAgents[0];
    updateAccount(accountId, {
      currentStatus: 'Field Visit Pending',
      assignedFosId: fos?.id,
      assignedFosName: fos?.name,
      notes: [`Supervisor escalated to FOS ${fos?.name} for physical door visit.`, ...(accounts.find(a => a.id === accountId)?.notes || [])],
    });
    showToast('Escalated to FOS', `Field visit assigned to ${fos?.name}`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supervisor Dual Cockpit</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Telecallers & FOS Real-Time Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervise call logs, broken PTP re-escalations, and verify field collection receipts with GPS location integrity.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('calling')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'calling'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
            Telecalling Cockpit ({callLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'field'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            FOS Field Collections ({receipts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TELECALLER SUPERVISION */}
      {activeTab === 'calling' && (
        <div className="space-y-6">
          {/* Telecallers Roster Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {telecallers.map(tc => {
              const tcCalls = callLogs.filter(c => c.telecallerId === tc.id);
              const tcPtps = tcCalls.filter(c => c.disposition === 'Connected - PTP Given');
              const tcAccounts = accounts.filter(a => a.assignedTelecallerId === tc.id);

              return (
                <div key={tc.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {tc.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tc.employeeCode}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active On Seat
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Allocated</span>
                      <span className="font-bold text-slate-900 text-sm">{tcAccounts.length}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Calls Made</span>
                      <span className="font-bold text-indigo-700 text-sm">{tcCalls.length}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">PTP Commit</span>
                      <span className="font-bold text-emerald-700 text-sm">{tcPtps.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Broken PTP Alert Queue: 1-Click Dispatch FOS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Broken PTP & Escalation Queue ({brokenPtps.length} Cases)
                </h2>
              </div>
              <span className="text-xs text-rose-600 font-semibold">Immediate FOS Physical Door Visit Required</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Debtor & Loan No</th>
                    <th className="p-3">Bank Portfolio</th>
                    <th className="p-3">Target Address & Pincode</th>
                    <th className="p-3 text-right">Overdue (INR)</th>
                    <th className="p-3">Last Telecaller</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Assign Field Officer (FOS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {brokenPtps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">
                        No broken PTP cases currently in queue.
                      </td>
                    </tr>
                  ) : (
                    brokenPtps.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{acc.customerName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{acc.loanAccountNumber}</div>
                        </td>
                        <td className="p-3 text-slate-700">{acc.portfolioName.split(' ')[0]}</td>
                        <td className="p-3 text-slate-600 text-[11px] max-w-[200px] truncate" title={acc.address}>
                          {acc.address}, {acc.city} - {acc.pincode}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatINR(acc.totalOverdueAmount)}</td>
                        <td className="p-3 text-slate-600">{acc.assignedTelecallerName || 'Unassigned'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {acc.currentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              defaultValue={acc.assignedFosId || fosAgents[0]?.id}
                              id={`select-fos-${acc.id}`}
                              className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-800"
                            >
                              {fosAgents.map(f => (
                                <option key={f.id} value={f.id}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const sel = document.getElementById(`select-fos-${acc.id}`) as HTMLSelectElement;
                                handleEscalateToFos(acc.id, sel.value);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Dispatch
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIELD COLLECTION & GEO-VERIFICATION REVIEW */}
      {activeTab === 'field' && (
        <div className="space-y-6">
          {/* Field Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Pending Supervisor Review</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{pendingApprovalReceipts.length} Slips</span>
              <span className="text-xs text-slate-500">Requires audit confirmation</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Geo-Verified Compliant</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {receipts.filter(r => r.geoVerificationStatus === 'Verified On-Site').length} Slips
              </span>
              <span className="text-xs text-emerald-600 font-medium">GPS lock &lt; 250m from debtor home</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Field Recovery Today</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {formatINR(receipts.reduce((s, r) => s + r.collectedAmount, 0))}
              </span>
              <span className="text-xs text-slate-500">{receipts.length} Receipts logged</span>
            </div>
          </div>

          {/* Collection Receipts Audit Queue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Field Collection Slips & Geo-Integrity Audit
                </h2>
              </div>
              <span className="text-xs text-slate-500">Verify GPS proximity before remitting to bank</span>
            </div>

            <div className="space-y-3">
              {receipts.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-200">
                        {rec.receiptNumber}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{rec.customerName}</span>
                      <span className="text-xs text-slate-500 font-mono">({rec.loanAccountNumber})</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Debtor Address: <span className="font-medium text-slate-800">{rec.targetAddress}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                      <span>Field Officer: <strong className="text-slate-900">{rec.collectedByName}</strong></span>
                      <span>•</span>
                      <span>Mode: <strong>{rec.paymentMode}</strong></span>
                      <span>•</span>
                      <span>Txn: <strong className="font-mono text-slate-700">{rec.transactionReference}</strong></span>
                      <span>•</span>
                      <span>Time: {rec.collectedAt}</span>
                    </div>

                    {/* Geo Verification Badge & Distance */}
                    <div className="pt-1.5 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rec.geoVerificationStatus === 'Verified On-Site'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : rec.geoVerificationStatus === 'Proximity Warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                        {rec.geoVerificationStatus}
                      </span>
                      <span className="text-xs text-slate-500">
                        Recorded Proximity: <strong>{rec.distanceFromTargetMeters ? `${rec.distanceFromTargetMeters} meters` : 'Doorstep'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions & Amount */}
                  <div className="text-right shrink-0 space-y-2">
                    <div className="text-xl font-black text-slate-900">{formatINR(rec.collectedAmount)}</div>

                    <div className="flex items-center justify-end gap-2">
                      {rec.supervisorApprovalStatus === 'Approved' ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => updateReceiptApproval(rec.id, 'Flagged')}
                            className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                          >
                            Flag Discrepancy
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReceiptApproval(rec.id, 'Approved')}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
