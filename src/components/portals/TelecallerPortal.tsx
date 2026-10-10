import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAccount, CallDisposition } from '../../types';
import {
  PhoneCall,
  PhoneOff,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/export';

export const TelecallerPortal: React.FC = () => {
  const {
    currentUser,
    accounts,
    callLogs,
    logCall,
    showToast,
  } = useApp();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Call simulation state
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  // Disposition Form
  const [disposition, setDisposition] = useState<CallDisposition>('Connected - PTP Given');
  const [ptpDate, setPtpDate] = useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [ptpAmount, setPtpAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [showScript, setShowScript] = useState<boolean>(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  useEffect(() => {
    if (selectedAccount && ptpAmount === 0) {
      setPtpAmount(selectedAccount.emiAmount || selectedAccount.totalOverdueAmount);
    }
  }, [selectedAccount]);

  // Call timer effect
  useEffect(() => {
    let timer: any;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    setCallDuration(0);
    showToast('Calling Customer', `Dialing ${selectedAccount?.customerName} (${selectedAccount?.phone})...`, 'info');
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  const handleSaveDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const dur = callDuration > 0 ? callDuration : 45; // default simulated duration if not timed
    logCall(
      selectedAccount.id,
      disposition,
      dur,
      remarks || `Call completed with disposition ${disposition}`,
      disposition === 'Connected - PTP Given' ? ptpDate : undefined,
      disposition === 'Connected - PTP Given' ? Number(ptpAmount) : undefined
    );

    // Reset and move to next account
    setIsCalling(false);
    setCallDuration(0);
    setRemarks('');

    // Advance to next account
    const currentIndex = accounts.findIndex(a => a.id === selectedAccountId);
    if (currentIndex >= 0 && currentIndex < accounts.length - 1) {
      setSelectedAccountId(accounts[currentIndex + 1].id);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    if (filterMode === 'ptp' && acc.currentStatus !== 'PTP Committed') return false;
    if (filterMode === 'broken' && acc.currentStatus !== 'Broken PTP') return false;
    if (filterMode === 'field' && acc.currentStatus !== 'Field Visit Pending') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        acc.customerName.toLowerCase().includes(q) ||
        acc.loanAccountNumber.toLowerCase().includes(q) ||
        acc.phone.includes(q)
      );
    }
    return true;
  });

  const accountCallHistory = callLogs.filter(c => c.accountId === selectedAccountId);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Telecaller Workstation & CRM</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Agent: {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated dialer workspace: view customer overdue details, initiate simulated calls, and log PTP commitments.
          </p>
        </div>

        <button
          onClick={() => setShowScript(!showScript)}
          className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          {showScript ? 'Hide Call Scripts' : 'RBI Fair Code Call Scripts'}
        </button>
      </div>

      {/* Script Drawer */}
      {showScript && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-2 text-indigo-950 animate-in fade-in duration-100">
          <div className="font-bold flex items-center gap-1.5 text-indigo-900">
            <Shield className="w-4 h-4 text-indigo-600" />
            Standard Bank Recovery Script (RBI Fair Practices Compliant):
          </div>
          <p>
            <strong>1. Identification:</strong> &quot;Namaste, I am calling from Apex Recoveries on behalf of {selectedAccount?.portfolioName}. Am I speaking with Mr./Ms. {selectedAccount?.customerName}?&quot;
          </p>
          <p>
            <strong>2. Overdue Intimation:</strong> &quot;We notice an outstanding of {formatINR(selectedAccount?.totalOverdueAmount || 0)} for your loan account {selectedAccount?.loanAccountNumber}. What is the earliest date you can confirm payment?&quot;
          </p>
          <p>
            <strong>3. PTP Confirmation:</strong> &quot;Thank you. We have recorded your Promise-to-Pay for {formatINR(ptpAmount || selectedAccount?.emiAmount || 0)} on {ptpDate}. A payment link and receipt will be issued upon clearance.&quot;
          </p>
        </div>
      )}

      {/* 2 Column Workspace: Account Queue (Left) & Active Call Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Queue & Filters (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Calling Queue ({filteredAccounts.length} Accounts)
            </span>
            <span className="text-xs text-slate-400">Select to load debtor</span>
          </div>

          {/* Search & Quick Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or loan no..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({accounts.length})
              </button>
              <button
                onClick={() => setFilterMode('ptp')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                  filterMode === 'ptp'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                PTPs
              </button>
              <button
                onClick={() => setFilterMode('broken')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                  filterMode === 'broken'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Broken PTP
              </button>
              <button
                onClick={() => setFilterMode('field')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                  filterMode === 'field'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Field Pending
              </button>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredAccounts.map(acc => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setPtpAmount(acc.emiAmount || acc.totalOverdueAmount);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{acc.customerName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{acc.loanAccountNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {acc.loanProduct} • {acc.portfolioName.split(' ')[0]}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        {acc.bucket}
                      </span>
                      <span className="text-slate-500 font-mono">{acc.phone}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900">
                      {formatINR(acc.totalOverdueAmount)}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                      acc.currentStatus === 'PTP Committed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : acc.currentStatus === 'Broken PTP'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {acc.currentStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Dialing & CRM Workspace (7 cols) */}
        {selectedAccount ? (
          <div className="lg:col-span-7 space-y-4">
            
            {/* Debtor Profile & Calling Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedAccount.customerName}</h2>
                    <span className="font-mono text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                      {selectedAccount.loanAccountNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAccount.portfolioName} • Product: {selectedAccount.loanProduct}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Overdue</span>
                  <span className="text-xl font-black text-rose-700">{formatINR(selectedAccount.totalOverdueAmount)}</span>
                </div>
              </div>

              {/* Account Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">EMI Due:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedAccount.emiAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Principal O/S:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedAccount.principalOutstanding)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DPD Delay:</span>
                  <span className="font-bold text-rose-700">{selectedAccount.dpdDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Pincode:</span>
                  <span className="font-mono text-slate-800">{selectedAccount.pincode} ({selectedAccount.city})</span>
                </div>
              </div>

              {/* Address details */}
              <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700">Registered Address: </span>
                {selectedAccount.address}, {selectedAccount.city} - {selectedAccount.pincode}
              </div>

              {/* Integrated Dialer Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isCalling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`}>
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Customer Phone:</div>
                    <div className="text-base font-bold tracking-wider font-mono">{selectedAccount.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isCalling && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold block">In Call</span>
                      <span className="text-base font-mono font-bold">
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:
                        {(callDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {isCalling ? (
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <PhoneOff className="w-4 h-4" />
                      End Call
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartCall}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call Customer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Disposition & PTP Logging Form */}
            <form onSubmit={handleSaveDisposition} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Log Call Disposition & Promise-To-Pay (PTP)
                </span>
                <span className="text-xs text-indigo-600 font-semibold">Step 2: Commit Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Call Disposition *</label>
                  <select
                    value={disposition}
                    onChange={e => setDisposition(e.target.value as CallDisposition)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Connected - PTP Given">Connected - PTP Given</option>
                    <option value="Connected - Refused to Pay">Connected - Refused to Pay</option>
                    <option value="Connected - Requesting Settlement">Connected - Requesting Settlement</option>
                    <option value="Connected - Callback Requested">Connected - Callback Requested</option>
                    <option value="RNR (Ringing No Response)">RNR (Ringing No Response)</option>
                    <option value="Switched Off / Not Reachable">Switched Off / Not Reachable</option>
                    <option value="Wrong Number / Number Invalid">Wrong Number / Number Invalid</option>
                    <option value="Third Party / Family Contacted">Third Party / Family Contacted</option>
                  </select>
                </div>

                {disposition === 'Connected - PTP Given' && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">PTP Promised Date *</label>
                      <input
                        type="date"
                        required
                        value={ptpDate}
                        onChange={e => setPtpDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">PTP Commitment Amount (INR) *</label>
                      <input
                        type="number"
                        required
                        value={ptpAmount}
                        onChange={e => setPtpAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </>
                )}

                <div className={disposition === 'Connected - PTP Given' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Call Remarks / Debtor Notes</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Debtor reason, callback timing, payment link request..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Disposition & Next Debtor
                </button>
              </div>
            </form>

            {/* History of Previous Calls for this Account */}
            {accountCallHistory.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Previous Calling History ({accountCallHistory.length} logs)
                </span>
                <div className="space-y-2">
                  {accountCallHistory.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-indigo-700">{log.disposition}</span>
                        <span className="text-slate-400 font-normal">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 italic">&quot;{log.remarks}&quot;</p>
                      <div className="text-[10px] text-slate-400">Caller: {log.telecallerName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-7 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            Select an account from the left calling queue to begin.
          </div>
        )}

      </div>

    </div>
  );
};
