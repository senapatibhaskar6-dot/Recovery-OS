import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  X,
  Building2,
  Check,
  ShieldCheck,
  CreditCard,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { formatINR, exportBankCollectionReport } from '../../utils/export';

interface BankReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankReportingModal: React.FC<BankReportingModalProps> = ({ isOpen, onClose }) => {
  const { portfolios, receipts, remitReceiptToBank, showToast } = useApp();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');

  if (!isOpen) return null;

  // Filter receipts
  const filteredReceipts = receipts.filter(r => {
    if (selectedPortfolioId !== 'all' && r.portfolioId !== selectedPortfolioId) {
      return false;
    }
    if (filterMode !== 'all' && r.paymentMode !== filterMode) {
      return false;
    }
    return true;
  });

  const totalCollected = filteredReceipts.reduce((sum, r) => sum + r.collectedAmount, 0);
  const geoVerifiedCount = filteredReceipts.filter(r => r.geoVerificationStatus === 'Verified On-Site').length;
  const cashTotal = filteredReceipts.filter(r => r.paymentMode === 'Cash').reduce((s, r) => s + r.collectedAmount, 0);
  const upiTotal = filteredReceipts.filter(r => r.paymentMode === 'UPI').reduce((s, r) => s + r.collectedAmount, 0);

  const selectedPortfolioObj = portfolios.find(p => p.id === selectedPortfolioId);
  const bankDisplayName = selectedPortfolioObj ? selectedPortfolioObj.clientBank : 'Consolidated_All_Banks';

  const handleDownload = () => {
    if (filteredReceipts.length === 0) {
      showToast('No Data', 'No collection records found for the selected bank.', 'error');
      return;
    }
    exportBankCollectionReport(bankDisplayName, filteredReceipts);
    showToast('Report Exported', `Bank Day-End MIS report generated for ${bankDisplayName}`, 'success');
  };

  const handleMarkAllRemitted = () => {
    filteredReceipts.forEach(r => {
      remitReceiptToBank(r.id);
    });
    showToast('Remitted', `Marked ${filteredReceipts.length} collections as remitted to bank account.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              Bank Reporting & Day-End Settlement
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Generate Bank Day-End MIS Collection Report</h2>
          <p className="text-xs text-slate-300 mt-1">
            Standard day-end collection spreadsheet (.xlsx / .csv) for direct submission to Bajaj, Hero, HDFC, and SBI bank managers.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Bank Portfolio
              </label>
              <select
                value={selectedPortfolioId}
                onChange={e => setSelectedPortfolioId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
              >
                <option value="all">All Bank Portfolios (Consolidated)</option>
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.clientBank} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Channel
              </label>
              <select
                value={filterMode}
                onChange={e => setFilterMode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
              >
                <option value="all">All Modes (Cash + UPI + Cheque)</option>
                <option value="Cash">Cash Only</option>
                <option value="UPI">UPI Digital Only</option>
                <option value="Cheque">Cheque Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Export Format
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Day-End MIS
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Recovered
              </span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                {formatINR(totalCollected)}
              </span>
              <span className="text-[10px] text-slate-500">{filteredReceipts.length} collection slips</span>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Geo-Verified Slips
              </span>
              <span className="text-lg font-black text-emerald-700 mt-0.5 block">
                {geoVerifiedCount} / {filteredReceipts.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">GPS lock confirmed</span>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                UPI / Digital Rupee
              </span>
              <span className="text-lg font-black text-blue-700 mt-0.5 block">
                {formatINR(upiTotal)}
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Instant reconciliation</span>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Cash in Hand
              </span>
              <span className="text-lg font-black text-amber-700 mt-0.5 block">
                {formatINR(cashTotal)}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Pending branch deposit</span>
            </div>
          </div>

          {/* Report Data Table Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">
                Collection Transactions Mapped to Bank ({filteredReceipts.length} Records)
              </span>
              <button
                type="button"
                onClick={handleMarkAllRemitted}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark All Remitted
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Receipt #</th>
                    <th className="p-2.5">Client Bank</th>
                    <th className="p-2.5">Loan Acc No</th>
                    <th className="p-2.5">Debtor Name</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5">Collected By</th>
                    <th className="p-2.5">Geo Status</th>
                    <th className="p-2.5">Bank Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        No collection receipts logged for this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-800 font-semibold">{r.receiptNumber}</td>
                        <td className="p-2.5 text-slate-700">{r.portfolioName.split(' ')[0]}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">{r.loanAccountNumber}</td>
                        <td className="p-2.5 text-slate-900">{r.customerName}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatINR(r.collectedAmount)}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                            {r.paymentMode}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600">
                          {r.collectedByName} ({r.collectedByRole})
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            r.geoVerificationStatus === 'Verified On-Site'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <MapPin className="w-2.5 h-2.5" />
                            {r.geoVerificationStatus}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            r.bankRemittanceStatus === 'Remitted to Bank'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.bankRemittanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Format conforms to RBI debt recovery agency day-end reporting compliance.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV / Excel
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
