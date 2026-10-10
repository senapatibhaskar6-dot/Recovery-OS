import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AgencyProfile,
  UserRole,
  Portfolio,
  CustomerAccount,
  Employee,
  CallLog,
  CollectionReceipt,
  AttendanceRecord,
  PayrollRecord,
  CommissionSlab,
  CallDisposition,
} from '../types';
import {
  initialAgency,
  initialPortfolios,
  initialStaff,
  initialAccounts,
  initialCallLogs,
  initialReceipts,
  initialAttendance,
  initialPayroll,
  defaultCommissionSlabs,
  calculatePayrollRecord,
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  agency: AgencyProfile;
  currentRole: UserRole;
  currentUser: Employee;
  portfolios: Portfolio[];
  accounts: CustomerAccount[];
  callLogs: CallLog[];
  receipts: CollectionReceipt[];
  staff: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  commissionSlabs: CommissionSlab[];
  toasts: Toast[];

  // Actions
  setRole: (role: UserRole) => void;
  setCurrentUser: (emp: Employee) => void;
  registerAgency: (data: Partial<AgencyProfile>) => void;
  paySubscription: () => void;
  toggleSubscriptionExpiry: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Account actions
  addAccount: (account: CustomerAccount) => void;
  bulkUploadAccounts: (newAccounts: CustomerAccount[], portfolioId: string) => void;
  updateAccount: (id: string, updates: Partial<CustomerAccount>) => void;
  assignAccounts: (accountIds: string[], telecallerId?: string, fosId?: string) => void;

  // Call CRM
  logCall: (
    accountId: string,
    disposition: CallDisposition,
    durationSeconds: number,
    remarks: string,
    ptpDate?: string,
    ptpAmount?: number
  ) => void;

  // Collection & Field
  recordCollection: (receipt: Omit<CollectionReceipt, 'id' | 'receiptNumber'>) => CollectionReceipt;
  updateReceiptApproval: (receiptId: string, status: 'Approved' | 'Flagged') => void;
  remitReceiptToBank: (receiptId: string) => void;

  // HR & Attendance
  clockInOut: (employeeId: string, status: 'Present' | 'On Field') => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;

  // Payroll
  recalculatePayroll: () => void;
  approvePayrollBatch: () => void;
  updateCommissionSlabs: (slabs: CommissionSlab[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'recovery_os_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Agency
  const [agency, setAgency] = useState<AgencyProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agency`);
    return saved ? JSON.parse(saved) : initialAgency;
  });

  // Current Role & User
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [staff, setStaff] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff`);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [currentUser, setCurrentUserState] = useState<Employee>(() => {
    return initialStaff.find(s => s.role === 'Admin') || initialStaff[0];
  });

  // Data collections
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_portfolios`);
    return saved ? JSON.parse(saved) : initialPortfolios;
  });

  const [accounts, setAccounts] = useState<CustomerAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_callLogs`);
    return saved ? JSON.parse(saved) : initialCallLogs;
  });

  const [receipts, setReceipts] = useState<CollectionReceipt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_receipts`);
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payroll`);
    return saved ? JSON.parse(saved) : initialPayroll;
  });

  const [commissionSlabs, setCommissionSlabs] = useState<CommissionSlab[]>(defaultCommissionSlabs);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keep state saved
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_agency`, JSON.stringify(agency));
  }, [agency]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_callLogs`, JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
  }, [staff]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    const matchingStaff = staff.find(s => s.role === role);
    if (matchingStaff) {
      setCurrentUserState(matchingStaff);
    }
    showToast('Role Switched', `Now operating as ${role} (${matchingStaff?.name || 'Authorized'})`, 'info');
  };

  const setCurrentUser = (emp: Employee) => {
    setCurrentUserState(emp);
    setCurrentRole(emp.role);
  };

  const registerAgency = (data: Partial<AgencyProfile>) => {
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 30); // 30-day Free Trial

    const newAgency: AgencyProfile = {
      id: `agency-${Date.now()}`,
      name: data.name || 'New Recovery Agency',
      gstPan: data.gstPan || '27XXXXX0000X1Z0',
      ownerName: data.ownerName || 'Agency Owner',
      ownerContact: data.ownerContact || '+91 9800000000',
      email: data.email || 'contact@agency.com',
      address: data.address || 'Commercial Complex',
      city: data.city || 'Mumbai',
      state: data.state || 'Maharashtra',
      registrationDate: new Date().toISOString().split('T')[0],
      trialExpiresAt: trialExpiry.toISOString(),
      subscriptionStatus: 'trial',
      subscriptionPlan: 'Agency Pro - 1 Month Free Trial',
      monthlyFee: 999,
    };
    setAgency(newAgency);
    showToast('Agency Registered', '1-Month Free Trial activated successfully!', 'success');
  };

  const paySubscription = () => {
    const updated: AgencyProfile = {
      ...agency,
      subscriptionStatus: 'active',
      subscriptionPlan: 'Agency Pro (₹999/month)',
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };
    setAgency(updated);
    showToast('Subscription Active', 'Payment of ₹999 processed! Main dashboard unlocked.', 'success');
  };

  const toggleSubscriptionExpiry = () => {
    setAgency(prev => {
      const nextStatus = prev.subscriptionStatus === 'expired' ? 'trial' : 'expired';
      return {
        ...prev,
        subscriptionStatus: nextStatus,
        trialExpiresAt: nextStatus === 'expired' ? '2026-09-01T00:00:00Z' : new Date(Date.now() + 25 * 86400000).toISOString(),
      };
    });
    showToast('Subscription State Toggled', 'Simulated trial status changed.', 'info');
  };

  const addAccount = (account: CustomerAccount) => {
    setAccounts(prev => [account, ...prev]);
    showToast('Account Added', `Account ${account.loanAccountNumber} assigned.`, 'success');
  };

  const bulkUploadAccounts = (newAccounts: CustomerAccount[], portfolioId: string) => {
    // Smart distribution among active telecallers and FOS
    const telecallers = staff.filter(s => s.role === 'Telecaller' && s.status === 'Active');
    const fosList = staff.filter(s => s.role === 'FOS' && s.status === 'Active');

    const distributedAccounts = newAccounts.map((acc, index) => {
      const assignedTc = telecallers.length > 0 ? telecallers[index % telecallers.length] : undefined;
      const assignedFos = fosList.length > 0 ? fosList[index % fosList.length] : undefined;

      return {
        ...acc,
        assignedTelecallerId: assignedTc?.id,
        assignedTelecallerName: assignedTc?.name,
        assignedFosId: assignedFos?.id,
        assignedFosName: assignedFos?.name,
      };
    });

    setAccounts(prev => [...distributedAccounts, ...prev]);

    // Update portfolio total
    setPortfolios(prev =>
      prev.map(p => {
        if (p.id === portfolioId) {
          const addedPrincipal = distributedAccounts.reduce((sum, a) => sum + a.totalOverdueAmount, 0);
          return {
            ...p,
            totalAccounts: p.totalAccounts + distributedAccounts.length,
            totalPrincipalDue: p.totalPrincipalDue + addedPrincipal,
          };
        }
        return p;
      })
    );

    showToast(
      'Allocation Completed',
      `Parsed & distributed ${distributedAccounts.length} accounts to ${telecallers.length} Telecallers and ${fosList.length} FOS agents.`,
      'success'
    );
  };

  const updateAccount = (id: string, updates: Partial<CustomerAccount>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const assignAccounts = (accountIds: string[], telecallerId?: string, fosId?: string) => {
    const tcObj = telecallerId ? staff.find(s => s.id === telecallerId) : undefined;
    const fosObj = fosId ? staff.find(s => s.id === fosId) : undefined;

    setAccounts(prev =>
      prev.map(a => {
        if (accountIds.includes(a.id)) {
          return {
            ...a,
            assignedTelecallerId: tcObj ? tcObj.id : a.assignedTelecallerId,
            assignedTelecallerName: tcObj ? tcObj.name : a.assignedTelecallerName,
            assignedFosId: fosObj ? fosObj.id : a.assignedFosId,
            assignedFosName: fosObj ? fosObj.name : a.assignedFosName,
          };
        }
        return a;
      })
    );
    showToast('Reassigned', `Updated assignment for ${accountIds.length} accounts.`, 'success');
  };

  const logCall = (
    accountId: string,
    disposition: CallDisposition,
    durationSeconds: number,
    remarks: string,
    ptpDate?: string,
    ptpAmount?: number
  ) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;

    const newLog: CallLog = {
      id: `call-${Date.now()}`,
      accountId,
      customerName: acc.customerName,
      loanAccountNumber: acc.loanAccountNumber,
      portfolioName: acc.portfolioName,
      telecallerId: currentUser.id,
      telecallerName: currentUser.name,
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationSeconds,
      disposition,
      ptpDate,
      ptpAmount,
      remarks,
    };

    setCallLogs(prev => [newLog, ...prev]);

    // Update account status
    let nextStatus = acc.currentStatus;
    if (disposition === 'Connected - PTP Given') {
      nextStatus = 'PTP Committed';
    } else if (disposition === 'Connected - Refused to Pay') {
      nextStatus = 'Field Visit Pending';
    } else if (disposition === 'Switched Off / Not Reachable') {
      nextStatus = acc.ptpDate ? 'Broken PTP' : 'In Progress';
    }

    updateAccount(accountId, {
      currentStatus: nextStatus,
      lastContactDate: new Date().toISOString().split('T')[0],
      lastDisposition: disposition,
      ptpDate: ptpDate || acc.ptpDate,
      ptpAmount: ptpAmount || acc.ptpAmount,
      notes: [remarks, ...(acc.notes || [])],
    });

    showToast('Call Logged', `${disposition} recorded for ${acc.customerName}`, 'success');
  };

  const recordCollection = (receiptData: Omit<CollectionReceipt, 'id' | 'receiptNumber'>) => {
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReceipt: CollectionReceipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
    };

    setReceipts(prev => [newReceipt, ...prev]);

    // Update Account
    const acc = accounts.find(a => a.id === receiptData.accountId);
    if (acc) {
      const newTotal = (acc.totalRecoveredToDate || 0) + receiptData.collectedAmount;
      const isSettled = newTotal >= acc.totalOverdueAmount;
      updateAccount(acc.id, {
        totalRecoveredToDate: newTotal,
        currentStatus: isSettled ? 'Fully Settled' : 'Partially Recovered',
      });
    }

    // Update Portfolio collection total
    setPortfolios(prev =>
      prev.map(p => {
        if (p.id === receiptData.portfolioId) {
          return {
            ...p,
            totalCollected: p.totalCollected + receiptData.collectedAmount,
          };
        }
        return p;
      })
    );

    // Recalculate Payroll for the FOS agent
    if (receiptData.collectedByRole === 'FOS') {
      setPayroll(prev =>
        prev.map(pr => {
          if (pr.employeeId === receiptData.collectedById) {
            const emp = staff.find(s => s.id === receiptData.collectedById);
            if (emp) {
              return calculatePayrollRecord(
                emp,
                pr.monthYear,
                pr.workingDays,
                pr.presentDays,
                pr.totalRecoveryAchieved + receiptData.collectedAmount
              );
            }
          }
          return pr;
        })
      );
    }

    showToast(
      'Collection Receipt Issued',
      `Receipt #${receiptNum} generated for ₹${receiptData.collectedAmount.toLocaleString('en-IN')}`,
      'success'
    );

    return newReceipt;
  };

  const updateReceiptApproval = (receiptId: string, status: 'Approved' | 'Flagged') => {
    setReceipts(prev =>
      prev.map(r => (r.id === receiptId ? { ...r, supervisorApprovalStatus: status } : r))
    );
    showToast('Receipt Status Updated', `Receipt marked as ${status}`, 'info');
  };

  const remitReceiptToBank = (receiptId: string) => {
    setReceipts(prev =>
      prev.map(r => (r.id === receiptId ? { ...r, bankRemittanceStatus: 'Remitted to Bank' } : r))
    );
    showToast('Remittance Recorded', 'Collection marked as remitted to client bank.', 'success');
  };

  const clockInOut = (employeeId: string, status: 'Present' | 'On Field') => {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);

    if (existing) {
      // Clock out
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setAttendance(prev =>
        prev.map(a => (a.id === existing.id ? { ...a, clockOutTime: timeStr, totalHours: 8.5 } : a))
      );
      showToast('Attendance', `Clocked out at ${timeStr}`, 'info');
    } else {
      // Clock in
      const emp = staff.find(s => s.id === employeeId);
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: emp?.name || 'Staff',
        role: emp?.role || 'Telecaller',
        date: today,
        clockInTime: timeStr,
        status,
        geoVerified: true,
        totalHours: 0,
      };
      setAttendance(prev => [newRecord, ...prev]);
      showToast('Attendance Marked', `Clocked in successfully at ${timeStr} (${status})`, 'success');
    }
  };

  const addEmployee = (emp: Employee) => {
    setStaff(prev => [...prev, emp]);
    // Create initial payroll record
    const pay = calculatePayrollRecord(emp, 'October 2026', 26, 26, 0);
    setPayroll(prev => [...prev, pay]);
    showToast('Employee Added', `${emp.name} added as ${emp.role}`, 'success');
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setStaff(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    showToast('Employee Updated', 'Staff details saved.', 'info');
  };

  const recalculatePayroll = () => {
    const updated = staff.map(emp => {
      // Calculate total recovered by this staff member this month
      const recoveredAmount = receipts
        .filter(r => r.collectedById === emp.id && r.supervisorApprovalStatus !== 'Flagged')
        .reduce((sum, r) => sum + r.collectedAmount, 0);

      return calculatePayrollRecord(emp, 'October 2026', 26, 25, recoveredAmount);
    });
    setPayroll(updated);
    showToast('Payroll Recalculated', 'Statutory PF, ESIC & FOS commissions updated.', 'success');
  };

  const approvePayrollBatch = () => {
    setPayroll(prev =>
      prev.map(p => ({
        ...p,
        approvalStatus: 'Approved by Admin',
        disbursementDate: new Date().toISOString().split('T')[0],
      }))
    );
    showToast('Payroll Approved', 'October 2026 payroll approved for bank payout.', 'success');
  };

  const updateCommissionSlabs = (slabs: CommissionSlab[]) => {
    setCommissionSlabs(slabs);
    recalculatePayroll();
    showToast('Slabs Updated', 'FOS commission tiers updated across the agency.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        agency,
        currentRole,
        currentUser,
        portfolios,
        accounts,
        callLogs,
        receipts,
        staff,
        attendance,
        payroll,
        commissionSlabs,
        toasts,
        setRole,
        setCurrentUser,
        registerAgency,
        paySubscription,
        toggleSubscriptionExpiry,
        showToast,
        removeToast,
        addAccount,
        bulkUploadAccounts,
        updateAccount,
        assignAccounts,
        logCall,
        recordCollection,
        updateReceiptApproval,
        remitReceiptToBank,
        clockInOut,
        addEmployee,
        updateEmployee,
        recalculatePayroll,
        approvePayrollBatch,
        updateCommissionSlabs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
