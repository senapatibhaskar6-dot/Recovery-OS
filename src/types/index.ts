export type UserRole = 'Admin' | 'Manager' | 'HR' | 'Supervisor' | 'Telecaller' | 'FOS';

export interface AgencyProfile {
  id: string;
  name: string;
  gstPan: string;
  ownerName: string;
  ownerContact: string;
  email: string;
  address: string;
  city: string;
  state: string;
  registrationDate: string;
  trialExpiresAt: string; // ISO date
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionPlan: string;
  monthlyFee: number; // 999
  lastPaymentDate?: string;
}

export type LoanBucket = 'B1 (1-30 DPD)' | 'B2 (31-60 DPD)' | 'B3 (61-90 DPD)' | 'Write-off / NPA';

export interface Portfolio {
  id: string;
  code: string;
  name: string;
  clientBank: string;
  logoColor: string;
  totalAccounts: number;
  totalPrincipalDue: number;
  totalCollected: number;
  targetRecovery: number;
  managerInCharge: string;
}

export interface CustomerAccount {
  id: string;
  loanAccountNumber: string;
  portfolioId: string;
  portfolioName: string;
  customerName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  pincode: string;
  city: string;
  targetLat: number;
  targetLng: number;
  loanProduct: string; // "Two-Wheeler Loan", "Personal Loan", "Consumer Durable", "Credit Card"
  emiAmount: number;
  totalOverdueAmount: number;
  principalOutstanding: number;
  dpdDays: number;
  bucket: LoanBucket;
  assignedTelecallerId?: string;
  assignedTelecallerName?: string;
  assignedFosId?: string;
  assignedFosName?: string;
  currentStatus: 'Allocated' | 'In Progress' | 'PTP Committed' | 'Broken PTP' | 'Field Visit Pending' | 'Partially Recovered' | 'Fully Settled' | 'Dispute';
  ptpDate?: string;
  ptpAmount?: number;
  lastContactDate?: string;
  lastDisposition?: string;
  totalRecoveredToDate: number;
  notes: string[];
}

export type CallDisposition = 
  | 'Connected - PTP Given'
  | 'Connected - Refused to Pay'
  | 'Connected - Requesting Settlement'
  | 'Connected - Callback Requested'
  | 'RNR (Ringing No Response)'
  | 'Switched Off / Not Reachable'
  | 'Wrong Number / Number Invalid'
  | 'Third Party / Family Contacted';

export interface CallLog {
  id: string;
  accountId: string;
  customerName: string;
  loanAccountNumber: string;
  portfolioName: string;
  telecallerId: string;
  telecallerName: string;
  timestamp: string;
  durationSeconds: number;
  disposition: CallDisposition;
  ptpDate?: string;
  ptpAmount?: number;
  remarks: string;
  audioRecordingUrl?: string;
}

export interface GeoLocationPoint {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timestamp: string;
}

export interface CollectionReceipt {
  id: string;
  receiptNumber: string;
  accountId: string;
  customerName: string;
  loanAccountNumber: string;
  portfolioId: string;
  portfolioName: string;
  collectedAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Cheque' | 'Direct Bank Transfer' | 'NetBanking';
  transactionReference: string;
  collectedByRole: 'FOS' | 'Telecaller' | 'Agency Office';
  collectedById: string;
  collectedByName: string;
  collectedAt: string;
  fosGeoLocation?: GeoLocationPoint;
  targetAddress: string;
  distanceFromTargetMeters?: number;
  geoVerificationStatus: 'Verified On-Site' | 'Proximity Warning' | 'Remote / Out-of-Range' | 'Manual Verification';
  visitProofPhoto?: string;
  customerSignature?: string;
  supervisorApprovalStatus: 'Approved' | 'Pending Review' | 'Flagged';
  bankRemittanceStatus: 'Pending Remittance' | 'Remitted to Bank';
}

export interface Employee {
  id: string;
  name: string;
  employeeCode: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarColor: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  assignedPortfolios: string[];
  baseSalary: number; // Monthly fixed
  fosCommissionRatePercent?: number; // e.g. 5% to 10%
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    pan: string;
    uanPf: string;
    esicNumber: string;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: UserRole;
  date: string; // YYYY-MM-DD
  clockInTime: string;
  clockOutTime?: string;
  status: 'Present' | 'Late' | 'Half Day' | 'On Field' | 'Absent';
  clockInGeo?: GeoLocationPoint;
  geoVerified: boolean;
  totalHours: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: UserRole;
  monthYear: string; // "October 2026"
  baseSalary: number;
  workingDays: number;
  presentDays: number;
  earnedBaseSalary: number;
  // FOS specific
  totalRecoveryAchieved: number;
  fosCommissionEarned: number;
  incentives: number;
  // Deductions
  grossSalary: number;
  pfDeduction: number; // 12% of Basic
  esicDeduction: number; // 0.75% of Gross
  professionalTax: number; // standard 200
  otherDeductions: number;
  totalDeductions: number;
  netPayableSalary: number;
  approvalStatus: 'Draft' | 'Approved by Admin' | 'Disbursed';
  disbursementDate?: string;
}

export interface CommissionSlab {
  minAmount: number;
  maxAmount: number | null; // null for no upper limit
  percentage: number;
  description: string;
}
