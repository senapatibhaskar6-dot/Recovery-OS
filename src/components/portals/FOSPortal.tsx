import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAccount, CollectionReceipt } from '../../types';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  QrCode,
  Smartphone,
  Compass,
  ArrowRight,
  Printer,
  Download,
  Share2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '../../utils/export';
import { calculateDistanceMeters, formatDistance, evaluateGeoVerification, Coordinates } from '../../utils/geo';

export const FOSPortal: React.FC = () => {
  const {
    currentUser,
    accounts,
    recordCollection,
    showToast,
  } = useApp();

  // Mobile frame simulator toggle
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile-frame'>('responsive');

  // Filter accounts assigned to this FOS (or all accounts if admin testing)
  const fosAccounts = accounts.filter(
    a => a.assignedFosId === currentUser.id || currentUser.role !== 'FOS'
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>(fosAccounts[0]?.id || accounts[0]?.id || '');
  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  // GPS Location State
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({
    lat: selectedAccount?.targetLat ? selectedAccount.targetLat + 0.0003 : 18.5204,
    lng: selectedAccount?.targetLng ? selectedAccount.targetLng + 0.0002 : 73.8567,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSimulatedDoorstep, setIsSimulatedDoorstep] = useState<boolean>(true);

  // Collection receipt form state
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Cheque'>('UPI');
  const [txnRef, setTxnRef] = useState<string>(`UPI/${Date.now().toString().slice(-8)}/SBI`);
  const [hasSignature, setHasSignature] = useState<boolean>(true);
  const [showReceiptModal, setShowReceiptModal] = useState<CollectionReceipt | null>(null);

  // Sync collected amount default
  useEffect(() => {
    if (selectedAccount) {
      setCollectedAmount(selectedAccount.emiAmount || selectedAccount.totalOverdueAmount);
    }
  }, [selectedAccount]);

  // Real GPS fetch
  const handleFetchRealGPS = () => {
    if (!navigator.geolocation) {
      showToast('GPS Error', 'Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        setIsSimulatedDoorstep(false);
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        showToast('GPS Locked', `Acquired coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`, 'success');
      },
      err => {
        setIsLocating(false);
        showToast('GPS Permission', 'Could not get real GPS location. Using simulated field coordinates.', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Simulate Doorstep presence (< 100 meters)
  const handleSimulateDoorstep = () => {
    if (!selectedAccount) return;
    setIsSimulatedDoorstep(true);
    setCurrentCoords({
      lat: selectedAccount.targetLat + 0.0004,
      lng: selectedAccount.targetLng + 0.0003,
    });
    showToast('Doorstep Simulated', `Simulating physical presence at ${selectedAccount.customerName}'s address`, 'info');
  };

  // Simulate remote location (3.5 km away)
  const handleSimulateRemote = () => {
    if (!selectedAccount) return;
    setIsSimulatedDoorstep(false);
    setCurrentCoords({
      lat: selectedAccount.targetLat + 0.035,
      lng: selectedAccount.targetLng + 0.035,
    });
    showToast('Remote Simulated', 'Simulating remote submission (3.5 km away)', 'info');
  };

  // Evaluate geo verification status
  const targetCoords: Coordinates = {
    lat: selectedAccount?.targetLat || 18.5204,
    lng: selectedAccount?.targetLng || 73.8567,
  };

  const geoEval = evaluateGeoVerification(currentCoords, targetCoords);

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (collectedAmount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid rupee collection amount.', 'error');
      return;
    }

    const receipt = recordCollection({
      accountId: selectedAccount.id,
      customerName: selectedAccount.customerName,
      loanAccountNumber: selectedAccount.loanAccountNumber,
      portfolioId: selectedAccount.portfolioId,
      portfolioName: selectedAccount.portfolioName,
      collectedAmount: Number(collectedAmount),
      paymentMode,
      transactionReference: txnRef || (paymentMode === 'Cash' ? 'CSH-HAND' : 'UPI-CONFIRMED'),
      collectedByRole: 'FOS',
      collectedById: currentUser.id,
      collectedByName: currentUser.name,
      collectedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      targetAddress: `${selectedAccount.address}, ${selectedAccount.city} - ${selectedAccount.pincode}`,
      distanceFromTargetMeters: geoEval.distanceMeters,
      geoVerificationStatus: geoEval.status,
      supervisorApprovalStatus: geoEval.status === 'Verified On-Site' ? 'Approved' : 'Pending Review',
      bankRemittanceStatus: 'Pending Remittance',
    });

    setShowReceiptModal(receipt);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with View Toggle & Officer Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FOS Field Officer Portal</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> GPS Geo-Verified Fleet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Officer: <strong className="text-slate-900">{currentUser.name}</strong> • Real-time GPS verification against debtor registered address.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('responsive')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                viewMode === 'responsive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Responsive View
            </button>
            <button
              onClick={() => setViewMode('mobile-frame')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'mobile-frame' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile View
            </button>
          </div>
        </div>
      </div>

      {/* Main Container (Switchable to phone frame if desired) */}
      <div className={viewMode === 'mobile-frame' ? 'max-w-md mx-auto border-8 border-slate-800 rounded-[38px] p-2 bg-slate-800 shadow-2xl overflow-hidden' : ''}>
        
        {/* Mobile Top Bar if in frame mode */}
        {viewMode === 'mobile-frame' && (
          <div className="bg-slate-900 text-white px-4 py-2 rounded-t-[28px] text-[11px] flex justify-between items-center mb-2">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
            <span>5G • 98%</span>
          </div>
        )}

        <div className="space-y-4">
          
          {/* FOS Commission & Target Tracker Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">
                  FOS Tiered Incentive Engine
                </span>
                <span className="text-base font-black tracking-tight">{currentUser.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-300 font-bold block">Commission Rate</span>
                <span className="text-lg font-black text-emerald-400">7.0% Tier</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <span className="text-slate-300 text-[10px] block">Month Recovery Achieved:</span>
                <span className="font-bold text-white text-sm">{formatINR(145000)}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <span className="text-slate-300 text-[10px] block">Commission Earned:</span>
                <span className="font-bold text-emerald-300 text-sm">{formatINR(10150)}</span>
              </div>
            </div>
          </div>

          {/* Visit Queue Dropdown / List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Assigned Debtor for Field Visit
              </span>
              <span className="text-xs text-slate-500 font-medium">{fosAccounts.length} Pending</span>
            </div>

            <select
              value={selectedAccountId}
              onChange={e => {
                setSelectedAccountId(e.target.value);
                const acc = accounts.find(a => a.id === e.target.value);
                if (acc) {
                  setCurrentCoords({
                    lat: acc.targetLat + 0.0003,
                    lng: acc.targetLng + 0.0002,
                  });
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              {fosAccounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.customerName} — Overdue: {formatINR(a.totalOverdueAmount)} ({a.city} - {a.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Debtor Address & Navigation Box */}
          {selectedAccount && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedAccount.customerName}</h2>
                  <span className="text-xs font-mono text-slate-500">{selectedAccount.loanAccountNumber}</span>
                  <div className="text-xs text-slate-600 mt-1 font-medium">{selectedAccount.portfolioName}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-700 block">{formatINR(selectedAccount.totalOverdueAmount)} Due</span>
                  <span className="text-[10px] text-slate-500">EMI: {formatINR(selectedAccount.emiAmount)}</span>
                </div>
              </div>

              {/* Physical Address */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Customer Registered Address:</span>
                    <p className="text-slate-600 mt-0.5">{selectedAccount.address}, {selectedAccount.city} - {selectedAccount.pincode}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    GPS: {selectedAccount.targetLat.toFixed(4)}° N, {selectedAccount.targetLng.toFixed(4)}° E
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${selectedAccount.targetLat},${selectedAccount.targetLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Navigation className="w-3 h-3" /> Navigate via Google Maps
                  </a>
                </div>
              </div>

              {/* GOOGLE LOCATION TRACKING / GEO-VERIFICATION ENGINE WIDGET */}
              <div className="border-2 border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Live Geo-Verification Engine
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    geoEval.status === 'Verified On-Site'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : geoEval.status === 'Proximity Warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {geoEval.status}
                  </span>
                </div>

                {/* Distance Meter */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                      Measured Proximity to Debtor
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatDistance(geoEval.distanceMeters)} away
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold ${
                      geoEval.distanceMeters <= 250
                        ? 'text-emerald-600'
                        : geoEval.distanceMeters <= 800
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {geoEval.distanceMeters <= 250
                        ? 'Within 250m Radius'
                        : geoEval.distanceMeters <= 800
                        ? 'Near Vicinity'
                        : 'Remote (> 800m)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {geoEval.message}
                </p>

                {/* GPS Controls for Field Officer & Evaluator */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFetchRealGPS}
                    disabled={isLocating}
                    className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Reading GPS...' : 'Use Device GPS'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateDoorstep}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      isSimulatedDoorstep
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Simulate: At Doorstep (&lt; 80m)
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateRemote}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg"
                  >
                    Simulate: Out of Range (3.5km)
                  </button>
                </div>
              </div>

              {/* Instant Collection Receipt Issuance Form */}
              <form onSubmit={handleSubmitCollection} className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Instant Field Collection Receipt
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">Immediate Rupee Credit</span>
                </div>

                {/* Amount Quick Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount Collected (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={collectedAmount}
                    onChange={e => setCollectedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-xl"
                  />
                  <div className="flex gap-1.5 mt-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCollectedAmount(selectedAccount.emiAmount)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      1 EMI ({formatINR(selectedAccount.emiAmount)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectedAmount(selectedAccount.totalOverdueAmount)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      Full Overdue ({formatINR(selectedAccount.totalOverdueAmount)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectedAmount(Math.round(selectedAccount.emiAmount / 2))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      50% Token
                    </button>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center ${
                      paymentMode === 'UPI'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Cash')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center ${
                      paymentMode === 'Cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Cheque')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center ${
                      paymentMode === 'Cheque'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Cheque
                  </button>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {paymentMode === 'Cash' ? 'Cash Handover Code / Slip' : 'UTR Reference / Cheque No *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={txnRef}
                    onChange={e => setTxnRef(e.target.value)}
                    placeholder="e.g. UPI/628192019481/HDFC"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                {/* Digital Signature Pad simulation */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Debtor Digital Signature:</span>
                    <button
                      type="button"
                      onClick={() => setHasSignature(!hasSignature)}
                      className="text-[10px] text-indigo-600 font-semibold"
                    >
                      {hasSignature ? 'Clear Signature' : 'Sign Now'}
                    </button>
                  </div>
                  <div className="h-16 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 font-serif italic text-sm">
                    {hasSignature ? `${selectedAccount.customerName} (Signed On Screen)` : 'Tap to sign on glass'}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  Generate Official Collection Receipt & Slip
                </button>
              </form>

            </div>
          )}

        </div>

      </div>

      {/* POPUP: OFFICIAL DIGITAL RECEIPT SLIP PREVIEW */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Official Collection Receipt Issued</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal / Digital Receipt Card */}
            <div className="p-5 font-mono text-xs space-y-4 bg-white" id="collection-receipt-slip">
              
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-sans font-black text-sm text-slate-900">APEX RECOVERIES & RESOLUTION</h3>
                <p className="text-[10px] text-slate-500 font-sans">Authorized Debt Recovery Agency for Banks</p>
                <span className="text-[11px] font-bold text-slate-800 mt-1 block">
                  RECEIPT #{showReceiptModal.receiptNumber}
                </span>
                <span className="text-[10px] text-slate-500">{showReceiptModal.collectedAt}</span>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Client:</span>
                  <span className="font-bold text-slate-900">{showReceiptModal.portfolioName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Account:</span>
                  <span className="font-bold text-slate-900">{showReceiptModal.loanAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Debtor Name:</span>
                  <span className="font-bold text-slate-900">{showReceiptModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collected By:</span>
                  <span>{showReceiptModal.collectedByName} (FOS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold">{showReceiptModal.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Txn / UTR Ref:</span>
                  <span className="text-[10px] truncate max-w-[170px]">{showReceiptModal.transactionReference}</span>
                </div>
              </div>

              {/* Geo Verification Proof on Receipt */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Geo-Verified Field Collection
                </div>
                <div className="text-slate-500">Status: {showReceiptModal.geoVerificationStatus}</div>
                <div className="text-slate-500">Proximity to Address: {showReceiptModal.distanceFromTargetMeters}m</div>
              </div>

              {/* Big Rupee Amount */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center font-sans">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">AMOUNT RECEIVED (INR)</span>
                <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                  {formatINR(showReceiptModal.collectedAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono mt-0.5 block">Payment Recorded in Bank MIS</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300 pt-3">
                This is a digitally verified receipt issued under RBI Fair Recovery Guidelines.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Thermal Slip
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg"
              >
                Done / Next Visit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
