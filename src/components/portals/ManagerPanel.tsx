import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LoanBucket } from '../../types';
import {
  Briefcase,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Layers,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { formatINR } from '../../utils/export';

export const ManagerPanel: React.FC = () => {
  const { portfolios, accounts, staff, receipts } = useApp();
  const [selectedBucket, setSelectedBucket] = useState<string>('all');

  const totalTarget = portfolios.reduce((sum, p) => sum + p.targetRecovery, 0);
  const totalCollected = receipts.reduce((sum, r) => sum + r.collectedAmount, 0);
  const achievementRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  // Buckets calculation
  const buckets: LoanBucket[] = ['B1 (1-30 DPD)', 'B2 (31-60 DPD)', 'B3 (61-90 DPD)', 'Write-off / NPA'];

  const bucketStats = buckets.map(b => {
    const bAccounts = accounts.filter(a => a.bucket === b);
    const count = bAccounts.length;
    const overdue = bAccounts.reduce((sum, a) => sum + a.totalOverdueAmount, 0);
    const collected = bAccounts.reduce((sum, a) => sum + a.totalRecoveredToDate, 0);
    return {
      bucket: b,
      count,
      overdue,
      collected,
      rate: overdue > 0 ? Math.round((collected / overdue) * 100) : 0,
    };
  });

  const filteredAccounts = selectedBucket === 'all'
    ? accounts
    : accounts.filter(a => a.bucket === selectedBucket);

  return (
    <div className="space-y-6">
      
      {/* Welcome & Strategy Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manager Operations Panel</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Agency Targets & Portfolio Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track client bank recovery SLA targets, bucket roll rates (B1 to NPA), and telecaller-to-FOS coordination.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <Target className="w-5 h-5 text-purple-600" />
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Month Target</span>
            <span className="text-sm font-black text-slate-900">{formatINR(totalTarget)}</span>
          </div>
        </div>
      </div>

      {/* Target vs Achievement Big Gauge */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              October Agency Target Achievement
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Achieved <strong className="text-slate-900">{formatINR(totalCollected)}</strong> against agency target of <strong className="text-slate-900">{formatINR(totalTarget)}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-purple-600">{achievementRate}%</span>
            <span className="text-xs text-slate-500 block">Completed</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, achievementRate))}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Days Remaining in Month</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">21 Days</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Required Daily Run-Rate</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {formatINR(Math.max(0, Math.round((totalTarget - totalCollected) / 21)))} / day
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Active Calling Seats</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {staff.filter(s => s.role === 'Telecaller').length} Telecallers
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Active FOS Field Fleet</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {staff.filter(s => s.role === 'FOS').length} Field Officers
            </span>
          </div>
        </div>
      </div>

      {/* Bucket Performance Matrix (B1, B2, B3, Write-off) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Delinquency Bucket Roll-Rate Analysis
            </h2>
          </div>
          <span className="text-xs text-slate-500">Early bucket cures prevent NPA write-offs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bucketStats.map(b => (
            <button
              key={b.bucket}
              type="button"
              onClick={() => setSelectedBucket(selectedBucket === b.bucket ? 'all' : b.bucket)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedBucket === b.bucket
                  ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{b.bucket}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {b.count} Accs
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">{formatINR(b.overdue)}</div>
              <div className="mt-2 text-xs text-slate-600 flex justify-between">
                <span>Recovered:</span>
                <span className="font-bold text-emerald-700">{formatINR(b.collected)}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, b.rate)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Performance Breakdown Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Portfolio-Wise Resolution Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Bank Client</th>
                <th className="p-3">Portfolio Code</th>
                <th className="p-3 text-right">Pool Accounts</th>
                <th className="p-3 text-right">Principal Outstanding</th>
                <th className="p-3 text-right">Collected (INR)</th>
                <th className="p-3 text-right">Target Recovery</th>
                <th className="p-3 text-center">Progress</th>
                <th className="p-3">Manager In Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {portfolios.map(p => {
                const pct = p.targetRecovery > 0 ? Math.round((p.totalCollected / p.targetRecovery) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-900 font-bold">{p.clientBank}</td>
                    <td className="p-3 font-mono text-slate-600">{p.code}</td>
                    <td className="p-3 text-right text-slate-900">{p.totalAccounts}</td>
                    <td className="p-3 text-right text-slate-700">{formatINR(p.totalPrincipalDue)}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatINR(p.totalCollected)}</td>
                    <td className="p-3 text-right text-slate-700">{formatINR(p.targetRecovery)}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        {pct}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{p.managerInCharge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
