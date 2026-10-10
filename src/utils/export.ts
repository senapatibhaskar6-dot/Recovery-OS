import { CollectionReceipt, CustomerAccount, PayrollRecord, AgencyProfile } from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}

/**
 * Downloads data as a CSV file compatible with Excel
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 BOM so Excel opens Hindi/Special chars correctly
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row =>
        row
          .map(val => {
            const strVal = String(val ?? '');
            return `"${strVal.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates official Bank Day-End MIS collection report
 */
export function exportBankCollectionReport(
  bankName: string,
  receipts: CollectionReceipt[],
  dateStr: string = new Date().toISOString().split('T')[0]
) {
  const headers = [
    'Sr No',
    'Bank / Client',
    'Loan Account No',
    'Customer Name',
    'Collection Date & Time',
    'Receipt No',
    'Amount Collected (INR)',
    'Payment Mode',
    'Txn Ref / Cheque No',
    'Collected By (Staff)',
    'Role',
    'Geo Verification Status',
    'Distance from Debtor (m)',
    'Supervisor Approval',
    'Bank Remittance Status',
  ];

  const rows = receipts.map((r, idx) => [
    idx + 1,
    r.portfolioName,
    r.loanAccountNumber,
    r.customerName,
    r.collectedAt,
    r.receiptNumber,
    r.collectedAmount,
    r.paymentMode,
    r.transactionReference || 'N/A',
    r.collectedByName,
    r.collectedByRole,
    r.geoVerificationStatus,
    r.distanceFromTargetMeters ?? 'Office/Online',
    r.supervisorApprovalStatus,
    r.bankRemittanceStatus,
  ]);

  const sanitizedBank = bankName.replace(/[^a-zA-Z0-9]/g, '_');
  downloadCSV(`RecoveryOS_BankReport_${sanitizedBank}_${dateStr}.csv`, headers, rows);
}

/**
 * Exports Allocation Master List for field or audit
 */
export function exportAccountAllocationReport(accounts: CustomerAccount[]) {
  const headers = [
    'Loan Account No',
    'Portfolio / Client',
    'Customer Name',
    'Contact Phone',
    'City & Pincode',
    'Product',
    'Overdue Amount (INR)',
    'Principal Outstanding',
    'Bucket',
    'DPD Days',
    'Current Status',
    'Assigned Telecaller',
    'Assigned FOS Agent',
    'PTP Date',
    'PTP Amount',
    'Last Contact Date',
  ];

  const rows = accounts.map(a => [
    a.loanAccountNumber,
    a.portfolioName,
    a.customerName,
    a.phone,
    `${a.city} - ${a.pincode}`,
    a.loanProduct,
    a.totalOverdueAmount,
    a.principalOutstanding,
    a.bucket,
    a.dpdDays,
    a.currentStatus,
    a.assignedTelecallerName || 'Unassigned',
    a.assignedFosName || 'Unassigned',
    a.ptpDate || 'None',
    a.ptpAmount || 0,
    a.lastContactDate || 'Never',
  ]);

  downloadCSV(`RecoveryOS_Account_Allocations_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}
