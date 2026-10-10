import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  X,
  Download,
  Sparkles,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { formatINR, downloadCSV } from '../../utils/export';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { agency, paySubscription, showToast } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  if (!isOpen) return null;

  const basePrice = 999;
  const gst18 = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gst18;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      paySubscription();
      setIsProcessing(false);
      setShowInvoice(true);
    }, 1200);
  };

  const handleDownloadInvoice = () => {
    const invoiceNo = `INV-ROS-${Date.now().toString().slice(-6)}`;
    const headers = [
      'Field',
      'Details',
    ];
    const rows = [
      ['Invoice Number', invoiceNo],
      ['Invoice Date', new Date().toLocaleDateString('en-IN')],
      ['Billed To Agency', agency.name],
      ['GSTIN / PAN', agency.gstPan],
      ['Agency Address', `${agency.address}, ${agency.city}, ${agency.state}`],
      ['Subscription Service', 'Recovery OS Enterprise SaaS License (1 Month)'],
      ['SAC Code', '998313 (Information Technology Software Services)'],
      ['Base Platform Fee', `₹${basePrice}`],
      ['CGST (9%)', `₹${Math.round(gst18 / 2)}`],
      ['SGST (9%)', `₹${Math.round(gst18 / 2)}`],
      ['Total Paid (INR)', `₹${totalPrice}`],
      ['Payment Status', 'SUCCESS (PAID)'],
      ['Access Period', '30 Days Full Enterprise Access'],
    ];

    downloadCSV(`RecoveryOS_TaxInvoice_${invoiceNo}.csv`, headers, rows);
    showToast('Invoice Downloaded', 'GST Tax Invoice downloaded successfully.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              Agency Subscription Plan
            </span>
            <span className="text-xs text-slate-400">• ₹999/month</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {agency.subscriptionStatus === 'expired'
              ? 'Unlock Full Dashboard Access'
              : 'Enterprise Agency Subscription'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Mandatory monthly license fee for full operations: multi-portfolio uploads, geo-verified FOS field visits, and bank reporting.
          </p>
        </div>

        {/* Success Invoice View */}
        {showInvoice ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment of ₹{totalPrice} Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your agency subscription has been successfully renewed. All 6 portals and modules are active.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Agency:</span>
                <span className="font-semibold text-slate-900">{agency.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="font-semibold text-slate-900">Monthly Auto-Renews</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono text-slate-800">TXN-ROS-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Amount Paid (incl. 18% GST):</span>
                <span>{formatINR(totalPrice)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Download Tax Invoice
              </button>
              <button
                onClick={() => {
                  setShowInvoice(false);
                  onClose();
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="p-6 space-y-5">
            {/* Value checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited Bank Portfolios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>FOS GPS Geo-Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automated CSV Distribution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bank Day-End Excel Reports</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Statutory PF & ESIC Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>6 Multi-Tier Role Portals</span>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
              <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                <span>Monthly Agency License:</span>
                <span className="font-semibold text-slate-900">{formatINR(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span>GST (18% - CGST 9% + SGST 9%):</span>
                <span>{formatINR(gst18)}</span>
              </div>
              <div className="border-t border-indigo-200/60 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Payable:</span>
                <span className="text-base text-indigo-700">{formatINR(totalPrice)} / month</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                    paymentMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Tab Details */}
            {paymentMethod === 'upi' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="w-32 h-32 bg-white border border-slate-300 rounded-lg mx-auto flex items-center justify-center p-2 mb-2 shadow-xs">
                  <div className="w-full h-full bg-slate-900 text-white rounded flex flex-col items-center justify-center text-[10px] p-2 text-center">
                    <QrCode className="w-12 h-12 mb-1 text-indigo-300" />
                    <span>Scan via GPay / PhonePe</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  UPI VPA: <span className="font-mono font-bold text-slate-800">recoveryos.rzp@icici</span>
                </p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Card Number (4532 •••• •••• 9012)"
                  defaultValue="4532 8910 2938 9012"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="782"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Supported Corporate & Retail Banks:</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800">HDFC Bank</div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800">ICICI Bank</div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800">State Bank of India</div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800">Axis Bank</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Pay {formatINR(totalPrice)} & Unlock</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
