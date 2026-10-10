import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayrollRecord, Employee } from '../../types';
import {
  DollarSign,
  Download,
  Printer,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  Sparkles,
  Building,
  User,
  Shield,
  Percent,
} from 'lucide-react';
import { formatINR, downloadCSV } from '../../utils/export';

interface PayrollEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayrollEngineModal: React.FC<PayrollEngineModalProps> = ({ isOpen, onClose }) => {
  const {
    agency,
    payroll,
    staff,
    commissionSlabs,
    recalculatePayroll,
    approvePayrollBatch,
    showToast,
  } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(payroll[0] || null);
  const [activeTab, setActiveTab] = useState<'register' | 'payslip' | 'slabs'>('register');

  if (!isOpen) return null;

  const totalGrossPayroll = payroll.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalNetPayroll = payroll.reduce((sum, p) => sum + p.netPayableSalary, 0);
  const totalPF = payroll.reduce((sum, p) => sum + p.pfDeduction, 0);
  const totalESIC = payroll.reduce((sum, p) => sum + p.esicDeduction, 0);
  const totalFOSCommission = payroll.reduce((sum, p) => sum + p.fosCommissionEarned, 0);

  const selectedEmployee = staff.find(s => s.id === selectedRecord?.employeeId);

  const handleExportPayrollCSV = () => {
    const headers = [
      'Employee Code',
      'Employee Name',
      'Designation / Role',
      'Month',
      'Days Worked',
      'Base Monthly Salary',
      'Recovery Collected (INR)',
      'FOS Commission Earned (INR)',
      'Gross Salary',
      'Provident Fund (PF 12%)',
      'ESIC (0.75%)',
      'Professional Tax (PT)',
      'Total Deductions',
      'Net Salary Payable (INR)',
      'Approval Status',
      'Disbursement Date',
    ];

    const rows = payroll.map(p => {
      const emp = staff.find(s => s.id === p.employeeId);
      return [
        emp?.employeeCode || 'N/A',
        p.employeeName,
        p.role,
        p.monthYear,
        `${p.presentDays}/${p.workingDays}`,
        p.baseSalary,
        p.totalRecoveryAchieved,
        p.fosCommissionEarned,
        p.grossSalary,
        p.pfDeduction,
        p.esicDeduction,
        p.professionalTax,
        p.totalDeductions,
        p.netPayableSalary,
        p.approvalStatus,
        p.disbursementDate || 'Pending',
      ];
    });

    downloadCSV(`RecoveryOS_Payroll_Register_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast('Payroll Exported', 'Payroll register CSV downloaded.', 'success');
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              Statutory Payroll Engine
            </span>
            <span className="text-xs text-slate-400">• EPF Act 1952 & ESIC Act 1948 Compliant</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Payroll, FOS Commission & Statutory Deductions</h2>
          <p className="text-xs text-slate-300 mt-1">
            Automated monthly calculation of base salaries, tiered FOS recovery commissions, and statutory PF, ESIC, and PT.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('register')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Monthly Payroll Register
            </button>
            <button
              onClick={() => setActiveTab('payslip')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'payslip'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              Official Payslip Preview
            </button>
            <button
              onClick={() => setActiveTab('slabs')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'slabs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              FOS Commission Slabs
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={recalculatePayroll}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs"
            >
              Recalculate
            </button>
            <button
              type="button"
              onClick={approvePayrollBatch}
              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Payroll
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: REGISTER */}
          {activeTab === 'register' && (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Net Payout</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{formatINR(totalNetPayroll)}</span>
                  <span className="text-[10px] text-slate-500">{payroll.length} Employees</span>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase block">FOS Commissions</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">{formatINR(totalFOSCommission)}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Earned on Recovery</span>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-blue-800 uppercase block">PF Deducted (12%)</span>
                  <span className="text-base font-black text-blue-700 mt-0.5 block">{formatINR(totalPF)}</span>
                  <span className="text-[10px] text-blue-600 font-medium">EPF Challan Ready</span>
                </div>
                <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-pink-800 uppercase block">ESIC Deducted</span>
                  <span className="text-base font-black text-pink-700 mt-0.5 block">{formatINR(totalESIC)}</span>
                  <span className="text-[10px] text-pink-600 font-medium">0.75% of Gross</span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                  <span className="text-[11px] font-semibold text-amber-800 uppercase block">Gross Liability</span>
                  <span className="text-base font-black text-amber-700 mt-0.5 block">{formatINR(totalGrossPayroll)}</span>
                  <span className="text-[10px] text-amber-600 font-medium">Before Deductions</span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Employee</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5 text-right">Base Salary</th>
                      <th className="p-2.5 text-right">Recovery Done</th>
                      <th className="p-2.5 text-right">Commission</th>
                      <th className="p-2.5 text-right">Gross</th>
                      <th className="p-2.5 text-right">PF (12%)</th>
                      <th className="p-2.5 text-right">ESIC (0.75%)</th>
                      <th className="p-2.5 text-right font-bold">Net Salary</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {payroll.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-900 font-bold">
                          {p.employeeName}
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                            {p.role}
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-slate-600">{formatINR(p.baseSalary)}</td>
                        <td className="p-2.5 text-right text-slate-600">
                          {p.totalRecoveryAchieved > 0 ? formatINR(p.totalRecoveryAchieved) : '—'}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-emerald-600">
                          {p.fosCommissionEarned > 0 ? `+${formatINR(p.fosCommissionEarned)}` : '—'}
                        </td>
                        <td className="p-2.5 text-right text-slate-700 font-semibold">{formatINR(p.grossSalary)}</td>
                        <td className="p-2.5 text-right text-rose-600">-{formatINR(p.pfDeduction)}</td>
                        <td className="p-2.5 text-right text-rose-600">
                          {p.esicDeduction > 0 ? `-${formatINR(p.esicDeduction)}` : '—'}
                        </td>
                        <td className="p-2.5 text-right font-black text-indigo-700 text-sm">
                          {formatINR(p.netPayableSalary)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(p);
                              setActiveTab('payslip');
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                          >
                            View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Approved by Agency Director Vikramaditya Rathore on 07-Oct-2026.
                </span>
                <button
                  type="button"
                  onClick={handleExportPayrollCSV}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  Download Payroll Master CSV
                </button>
              </div>
            </>
          )}

          {/* TAB 2: PAYSLIP PREVIEW */}
          {activeTab === 'payslip' && selectedRecord && (
            <div className="space-y-4">
              {/* Employee selector for payslip */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Select Staff Member:</span>
                  <select
                    value={selectedRecord.id}
                    onChange={e => {
                      const rec = payroll.find(p => p.id === e.target.value);
                      if (rec) setSelectedRecord(rec);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    {payroll.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.employeeName} ({p.role}) - Net: {formatINR(p.netPayableSalary)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handlePrintPayslip}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
              </div>

              {/* Printable Official Salary Slip Card */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm font-sans text-xs space-y-4 print:p-0 print:border-none">
                
                {/* Agency Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">{agency.name}</h1>
                    <p className="text-slate-600 text-[11px] mt-0.5">{agency.address}, {agency.city}, {agency.state}</p>
                    <p className="text-slate-500 text-[10px]">
                      GSTIN/PAN: {agency.gstPan} • Contact: {agency.ownerContact}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px] tracking-wider uppercase block mb-1">
                      SALARY SLIP
                    </span>
                    <span className="font-bold text-slate-900 text-sm block">{selectedRecord.monthYear}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SLIP #{selectedRecord.id.toUpperCase()}</span>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Employee Name</span>
                    <span className="font-bold text-slate-900">{selectedRecord.employeeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Designation</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Employee Code</span>
                    <span className="font-mono text-slate-800">{selectedEmployee?.employeeCode || 'AR-001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Days Worked</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.presentDays} of {selectedRecord.workingDays}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Bank Account</span>
                    <span className="font-mono text-slate-800">{selectedEmployee?.bankDetails.accountNumber || '••••••••'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Bank IFSC</span>
                    <span className="font-mono text-slate-800">{selectedEmployee?.bankDetails.ifsc || 'HDFC0000128'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">PF UAN Number</span>
                    <span className="font-mono text-slate-800">{selectedEmployee?.bankDetails.uanPf || '100984712019'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">ESIC IP Number</span>
                    <span className="font-mono text-slate-800">{selectedEmployee?.bankDetails.esicNumber || '3100847291001'}</span>
                  </div>
                </div>

                {/* Earnings & Deductions Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Earnings Column */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 text-xs border-b border-slate-200 flex justify-between">
                      <span>EARNINGS</span>
                      <span>AMOUNT (₹)</span>
                    </div>
                    <div className="p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Basic Salary</span>
                        <span className="font-semibold text-slate-900">{formatINR(selectedRecord.earnedBaseSalary * 0.5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">House Rent Allowance (HRA)</span>
                        <span className="font-semibold text-slate-900">{formatINR(selectedRecord.earnedBaseSalary * 0.3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Special Allowance</span>
                        <span className="font-semibold text-slate-900">{formatINR(selectedRecord.earnedBaseSalary * 0.2)}</span>
                      </div>
                      {selectedRecord.fosCommissionEarned > 0 && (
                        <div className="flex justify-between bg-emerald-50/70 p-1 rounded font-semibold text-emerald-800">
                          <span>FOS Recovery Commission ({formatINR(selectedRecord.totalRecoveryAchieved)} collected)</span>
                          <span>+{formatINR(selectedRecord.fosCommissionEarned)}</span>
                        </div>
                      )}
                      {selectedRecord.incentives > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Telecalling Performance Incentive</span>
                          <span>+{formatINR(selectedRecord.incentives)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                        <span>GROSS EARNINGS</span>
                        <span>{formatINR(selectedRecord.grossSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 text-xs border-b border-slate-200 flex justify-between">
                      <span>STATUTORY DEDUCTIONS</span>
                      <span>AMOUNT (₹)</span>
                    </div>
                    <div className="p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-slate-600 block">Employees' Provident Fund (EPF)</span>
                          <span className="text-[10px] text-slate-400">12% on Basic as per EPFO rules</span>
                        </div>
                        <span className="font-semibold text-rose-700">-{formatINR(selectedRecord.pfDeduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-slate-600 block">ESIC Contribution</span>
                          <span className="text-[10px] text-slate-400">0.75% of Gross (wage &lt; ₹21,000)</span>
                        </div>
                        <span className="font-semibold text-rose-700">
                          {selectedRecord.esicDeduction > 0 ? `-${formatINR(selectedRecord.esicDeduction)}` : '₹0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-slate-600 block">Professional Tax (PT)</span>
                          <span className="text-[10px] text-slate-400">Maharashtra State PT Slab</span>
                        </div>
                        <span className="font-semibold text-rose-700">-{formatINR(selectedRecord.professionalTax)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                        <span>TOTAL DEDUCTIONS</span>
                        <span className="text-rose-700">-{formatINR(selectedRecord.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Net Salary Highlight */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-indigo-900 block">NET TAKE-HOME SALARY</span>
                    <span className="text-[11px] text-indigo-700">Directly transferred to registered bank account</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-900">{formatINR(selectedRecord.netPayableSalary)}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 flex justify-between text-center text-[11px] text-slate-500">
                  <div>
                    <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                    <span>Prepared by: Pooja Sharma (HR)</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                    <span>Approved by: Vikramaditya Rathore (Admin)</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                    <span>Employee Signature</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SLABS CONFIGURATION */}
          {activeTab === 'slabs' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Configurable FOS Collection Commission Slabs</h3>
                <p className="text-xs text-slate-600">
                  FOS officers earn a tiered percentage commission on recovery amounts collected each month, added directly on top of their fixed base salary.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {commissionSlabs.map((slab, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Tier {i + 1}</span>
                      <span className="text-lg font-black text-slate-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {slab.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold">
                      {formatINR(slab.minAmount)} to {slab.maxAmount ? formatINR(slab.maxAmount) : 'No Limit'}
                    </div>
                    <p className="text-[11px] text-slate-500">{slab.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold block">How Statutory Formulas Are Calculated:</span>
                <p>• <strong>EPF (Provident Fund):</strong> 12% on Basic Salary capped at ₹15,000 monthly statutory ceiling.</p>
                <p>• <strong>ESIC:</strong> 0.75% employee contribution if gross earnings do not exceed ₹21,000 per month.</p>
                <p>• <strong>Professional Tax (PT):</strong> Flat ₹200 as per State Government schedule.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            Recovery OS Statutory Payroll Engine v2.6
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
