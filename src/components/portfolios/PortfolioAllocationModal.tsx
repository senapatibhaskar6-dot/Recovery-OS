import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAccount, LoanBucket } from '../../types';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatINR, downloadCSV } from '../../utils/export';

interface PortfolioAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioAllocationModal: React.FC<PortfolioAllocationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { portfolios, staff, bulkUploadAccounts, showToast } = useApp();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(portfolios[0]?.id || 'port-bajaj');
  const [parsedAccounts, setParsedAccounts] = useState<CustomerAccount[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [distributionMode, setDistributionMode] = useState<'round-robin' | 'pincode'>('round-robin');

  if (!isOpen) return null;

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolioId) || portfolios[0];
  const activeTelecallers = staff.filter(s => s.role === 'Telecaller' && s.status === 'Active');
  const activeFos = staff.filter(s => s.role === 'FOS' && s.status === 'Active');

  const downloadSampleTemplate = () => {
    const headers = [
      'Loan_Account_Number',
      'Customer_Name',
      'Mobile_Phone',
      'Debtor_Address',
      'Pincode',
      'City',
      'Loan_Product',
      'EMI_Amount',
      'Total_Overdue_Amount',
      'Principal_Outstanding',
      'DPD_Days',
      'Bucket',
    ];
    const rows = [
      [
        'BAJ-CD-990101',
        'Rajesh Kumar Varma',
        '+91 98230 11223',
        'Shop 12, Market Yard, Gultekdi',
        '411037',
        'Pune',
        'Consumer Durable',
        3500,
        14000,
        28000,
        42,
        'B2 (31-60 DPD)',
      ],
      [
        'HERO-2W-990102',
        'Santosh Baburao Patil',
        '+91 97631 22334',
        'Flat 101, Shivneri Appt, Katraj',
        '411046',
        'Pune',
        'Two-Wheeler Loan',
        2800,
        11200,
        45000,
        68,
        'B3 (61-90 DPD)',
      ],
      [
        'HDFC-PL-990103',
        'Meena Jayant Deshpande',
        '+91 99220 33445',
        'Bungalow 4, Model Colony, Shivajinagar',
        '411016',
        'Pune',
        'Personal Loan',
        14500,
        58000,
        290000,
        85,
        'B3 (61-90 DPD)',
      ],
    ];
    downloadCSV('RecoveryOS_Portfolio_Allocation_Template.csv', headers, rows);
    showToast('Template Downloaded', 'Sample CSV template ready for editing.', 'info');
  };

  const loadDemoSampleBatch = () => {
    const demoBatch: CustomerAccount[] = [
      {
        id: `acc-upload-${Date.now()}-1`,
        loanAccountNumber: `${currentPortfolio.code}-${Math.floor(100000 + Math.random() * 900000)}`,
        portfolioId: currentPortfolio.id,
        portfolioName: currentPortfolio.name,
        customerName: 'Ajay Jagtap',
        phone: '+91 98224 55102',
        address: 'B-304, Rutuparna Society, Kothrud',
        pincode: '411038',
        city: 'Pune',
        targetLat: 18.5082,
        targetLng: 73.8115,
        loanProduct: 'Personal Loan',
        emiAmount: 5200,
        totalOverdueAmount: 20800,
        principalOutstanding: 85000,
        dpdDays: 45,
        bucket: 'B2 (31-60 DPD)',
        currentStatus: 'Allocated',
        totalRecoveredToDate: 0,
        notes: ['Fresh allocation uploaded via system CSV.'],
      },
      {
        id: `acc-upload-${Date.now()}-2`,
        loanAccountNumber: `${currentPortfolio.code}-${Math.floor(100000 + Math.random() * 900000)}`,
        portfolioId: currentPortfolio.id,
        portfolioName: currentPortfolio.name,
        customerName: 'Kishore Shinde',
        phone: '+91 97632 99401',
        address: 'Shop 5, Mundhwa Bridge Road, Hadapsar',
        pincode: '411036',
        city: 'Pune',
        targetLat: 18.5218,
        targetLng: 73.9298,
        loanProduct: 'Two-Wheeler Loan',
        emiAmount: 3100,
        totalOverdueAmount: 12400,
        principalOutstanding: 38000,
        dpdDays: 62,
        bucket: 'B3 (61-90 DPD)',
        currentStatus: 'Allocated',
        totalRecoveredToDate: 0,
        notes: ['Fresh allocation uploaded via system CSV.'],
      },
      {
        id: `acc-upload-${Date.now()}-3`,
        loanAccountNumber: `${currentPortfolio.code}-${Math.floor(100000 + Math.random() * 900000)}`,
        portfolioId: currentPortfolio.id,
        portfolioName: currentPortfolio.name,
        customerName: 'Sneha Sathe',
        phone: '+91 98901 33201',
        address: 'Row House 8, Bramha Sun City, Wadgaon Sheri',
        pincode: '411014',
        city: 'Pune',
        targetLat: 18.5489,
        targetLng: 73.9212,
        loanProduct: 'Consumer Durable',
        emiAmount: 4100,
        totalOverdueAmount: 8200,
        principalOutstanding: 21000,
        dpdDays: 22,
        bucket: 'B1 (1-30 DPD)',
        currentStatus: 'Allocated',
        totalRecoveredToDate: 0,
        notes: ['Fresh allocation uploaded via system CSV.'],
      },
      {
        id: `acc-upload-${Date.now()}-4`,
        loanAccountNumber: `${currentPortfolio.code}-${Math.floor(100000 + Math.random() * 900000)}`,
        portfolioId: currentPortfolio.id,
        portfolioName: currentPortfolio.name,
        customerName: 'Vinayak Joshi',
        phone: '+91 94230 88204',
        address: 'Flat 12, Anand Complex, Sadashiv Peth',
        pincode: '411030',
        city: 'Pune',
        targetLat: 18.5132,
        targetLng: 73.8498,
        loanProduct: 'Personal Loan',
        emiAmount: 9500,
        totalOverdueAmount: 38000,
        principalOutstanding: 160000,
        dpdDays: 74,
        bucket: 'B3 (61-90 DPD)',
        currentStatus: 'Allocated',
        totalRecoveredToDate: 0,
        notes: ['Fresh allocation uploaded via system CSV.'],
      },
      {
        id: `acc-upload-${Date.now()}-5`,
        loanAccountNumber: `${currentPortfolio.code}-${Math.floor(100000 + Math.random() * 900000)}`,
        portfolioId: currentPortfolio.id,
        portfolioName: currentPortfolio.name,
        customerName: 'Rohan Gaikwad',
        phone: '+91 99229 11920',
        address: 'B-102, Silver Crest, Wakad Hinjewadi Road',
        pincode: '411057',
        city: 'Pune',
        targetLat: 18.5982,
        targetLng: 73.7621,
        loanProduct: 'Credit Card Outstanding',
        emiAmount: 5500,
        totalOverdueAmount: 49500,
        principalOutstanding: 120000,
        dpdDays: 110,
        bucket: 'Write-off / NPA',
        currentStatus: 'Allocated',
        totalRecoveredToDate: 0,
        notes: ['High delinquency case. FOS escalation suggested.'],
      },
    ];

    setParsedAccounts(demoBatch);
    setFileName(`Allocation_Dump_${currentPortfolio.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Batch Loaded', `5 sample accounts pre-loaded for ${currentPortfolio.name}`, 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast('Empty File', 'CSV must have at least one data row.', 'error');
        return;
      }

      // Simple CSV parser
      const parsed: CustomerAccount[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 5) {
          const loanNum = parts[0] || `${currentPortfolio.code}-${1000 + i}`;
          const custName = parts[1] || `Debtor ${i}`;
          const phone = parts[2] || '+91 9800000000';
          const addr = parts[3] || 'Pune Urban Area';
          const pincode = parts[4] || '411001';
          const city = parts[5] || 'Pune';
          const prod = parts[6] || 'Retail Loan';
          const emi = Number(parts[7]) || 3500;
          const overdue = Number(parts[8]) || 14000;
          const principal = Number(parts[9]) || 40000;
          const dpd = Number(parts[10]) || 45;
          const bucket = (parts[11] as LoanBucket) || (dpd > 90 ? 'Write-off / NPA' : dpd > 60 ? 'B3 (61-90 DPD)' : 'B2 (31-60 DPD)');

          parsed.push({
            id: `acc-upload-${Date.now()}-${i}`,
            loanAccountNumber: loanNum,
            portfolioId: currentPortfolio.id,
            portfolioName: currentPortfolio.name,
            customerName: custName,
            phone,
            address: addr,
            pincode,
            city,
            targetLat: 18.5204 + (Math.random() - 0.5) * 0.08,
            targetLng: 73.8567 + (Math.random() - 0.5) * 0.08,
            loanProduct: prod,
            emiAmount: emi,
            totalOverdueAmount: overdue,
            principalOutstanding: principal,
            dpdDays: dpd,
            bucket,
            currentStatus: 'Allocated',
            totalRecoveredToDate: 0,
            notes: ['Imported from external portfolio CSV.'],
          });
        }
      }

      setParsedAccounts(parsed);
      showToast('CSV Parsed', `Parsed ${parsed.length} accounts successfully.`, 'success');
    };
    reader.readAsText(file);
  };

  const handleExecuteAllocation = () => {
    if (parsedAccounts.length === 0) {
      showToast('No Accounts', 'Please select or upload accounts first.', 'error');
      return;
    }

    bulkUploadAccounts(parsedAccounts, currentPortfolio.id);
    onClose();
  };

  const totalOverdueParsed = parsedAccounts.reduce((sum, a) => sum + a.totalOverdueAmount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              Multi-Portfolio Engine
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Automated Portfolio Allocation Upload</h2>
          <p className="text-xs text-slate-300 mt-1">
            Systematically ingest bank delinquent portfolios (Bajaj, Hero, HDFC, SBI) and distribute accounts to telecallers and FOS officers.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Portfolio Selector & Template download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Client Bank / Portfolio *
              </label>
              <select
                value={selectedPortfolioId}
                onChange={e => setSelectedPortfolioId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
              >
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Standard Bank Template
              </label>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Download Sample CSV Format
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/60 transition-all">
            <input
              type="file"
              id="portfolioCsvInput"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="portfolioCsvInput" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-2 animate-bounce duration-1000" />
              <p className="text-sm font-bold text-slate-900">
                {fileName ? fileName : 'Choose CSV Allocation File or Drag & Drop'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standard columns: Loan Account No, Customer Name, Phone, Address, Pincode, EMI, Overdue, Bucket
              </p>
            </label>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-3">
              <span className="text-xs text-slate-500">Don't have a CSV file on hand?</span>
              <button
                type="button"
                onClick={loadDemoSampleBatch}
                className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load 5 Sample Indian Bank NPA Accounts
              </button>
            </div>
          </div>

          {/* Distribution Strategy preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Systematic Distribution Configuration
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Available: {activeTelecallers.length} Telecallers & {activeFos.length} FOS Agents
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800 block mb-1">Telecallers Pool</span>
                <p className="text-slate-500 text-[11px]">
                  {activeTelecallers.map(t => t.name).join(', ') || 'No active telecallers'}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800 block mb-1">FOS Field Officers Pool</span>
                <p className="text-slate-500 text-[11px]">
                  {activeFos.map(f => f.name).join(', ') || 'No active FOS'}
                </p>
              </div>
            </div>
          </div>

          {/* Parsed Accounts Table Preview */}
          {parsedAccounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">
                  Parsed Batch Preview ({parsedAccounts.length} Accounts • {formatINR(totalOverdueParsed)} Total Overdue)
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Allocation
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">Loan No</th>
                      <th className="p-2">Debtor Name</th>
                      <th className="p-2">Product</th>
                      <th className="p-2">Bucket</th>
                      <th className="p-2 text-right">Overdue</th>
                      <th className="p-2">Assigned Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {parsedAccounts.map((acc, idx) => {
                      const autoTc = activeTelecallers[idx % activeTelecallers.length]?.name || 'Auto-TC';
                      const autoFos = activeFos[idx % activeFos.length]?.name || 'Auto-FOS';
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono text-[11px] text-slate-800">{acc.loanAccountNumber}</td>
                          <td className="p-2 text-slate-900">{acc.customerName}</td>
                          <td className="p-2 text-slate-500">{acc.loanProduct}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                              {acc.bucket}
                            </span>
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900">{formatINR(acc.totalOverdueAmount)}</td>
                          <td className="p-2 text-[11px] text-slate-600">
                            <div>TC: {autoTc}</div>
                            <div className="text-indigo-600">FOS: {autoFos}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={parsedAccounts.length === 0}
              onClick={handleExecuteAllocation}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <span>Execute Allocation ({parsedAccounts.length} Accounts)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
