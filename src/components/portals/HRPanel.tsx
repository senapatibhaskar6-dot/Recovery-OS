import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole } from '../../types';
import {
  Users,
  Clock,
  UserPlus,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../../utils/export';

export const HRPanel: React.FC = () => {
  const {
    staff,
    attendance,
    clockInOut,
    currentUser,
    addEmployee,
    showToast,
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New employee form state
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: 'Telecaller' as UserRole,
    email: '',
    phone: '',
    baseSalary: 22000,
    fosCommissionRatePercent: 7,
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifsc: 'HDFC0000128',
    pan: '',
    uanPf: '',
    esicNumber: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAttendance = attendance.find(
    a => a.employeeId === currentUser.id && a.date === todayStr
  );

  const presentCount = attendance.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'On Field' || a.status === 'Late')).length;
  const onFieldCount = attendance.filter(a => a.date === todayStr && a.status === 'On Field').length;
  const lateCount = attendance.filter(a => a.date === todayStr && a.status === 'Late').length;

  const filteredStaff = staff.filter(s => {
    if (roleFilter !== 'all' && s.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmp.name,
      employeeCode: `AR-${newEmp.role.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      role: newEmp.role,
      email: newEmp.email,
      phone: newEmp.phone,
      avatarColor: newEmp.role === 'FOS' ? 'bg-blue-600' : newEmp.role === 'Telecaller' ? 'bg-emerald-600' : 'bg-indigo-600',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedPortfolios: ['port-bajaj'],
      baseSalary: Number(newEmp.baseSalary),
      fosCommissionRatePercent: newEmp.role === 'FOS' ? Number(newEmp.fosCommissionRatePercent) : undefined,
      bankDetails: {
        accountNumber: newEmp.accountNumber || '5010049182910',
        ifsc: newEmp.ifsc,
        bankName: newEmp.bankName,
        pan: newEmp.pan || 'AABCA1234F',
        uanPf: newEmp.uanPf || '101928491029',
        esicNumber: newEmp.esicNumber || '3100847291009',
      },
    };

    addEmployee(created);
    setShowAddModal(false);
    setNewEmp({
      name: '',
      role: 'Telecaller',
      email: '',
      phone: '',
      baseSalary: 22000,
      fosCommissionRatePercent: 7,
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifsc: 'HDFC0000128',
      pan: '',
      uanPf: '',
      esicNumber: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HR Header & Fast Clock In Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HR Staff & Digital Attendance Center</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
              EPF & ESIC Compliant Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily agent clock-ins with geo-verification punches, manage staff profiles, and oversee payroll inputs.
          </p>
        </div>

        {/* Digital Punch-In Trigger */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div>
            <div className="text-[11px] text-slate-500">Current User: <strong className="text-slate-800">{currentUser.name}</strong></div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {userTodayAttendance ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clocked In ({userTodayAttendance.clockInTime})
                </span>
              ) : (
                <span className="text-amber-700">Not Clocked In Today</span>
              )}
            </div>
          </div>
          <button
            onClick={() => clockInOut(currentUser.id, currentUser.role === 'FOS' ? 'On Field' : 'Present')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 ${
              userTodayAttendance
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {userTodayAttendance ? 'Clock Out' : 'Punch In with GPS'}
          </button>
        </div>
      </div>

      {/* Attendance Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Headcount</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{staff.length}</span>
          <span className="text-xs text-slate-500">All registered employees</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Present Today</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{presentCount}</span>
          <span className="text-xs text-emerald-600 font-medium">Digital attendance logged</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">On Field (FOS)</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{onFieldCount}</span>
          <span className="text-xs text-blue-600 font-medium">GPS tracked field officers</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Late Clock-Ins</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{lateCount}</span>
          <span className="text-xs text-amber-600 font-medium">After 09:30 AM shift start</span>
        </div>
      </div>

      {/* Staff Roster Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Staff Directory & Statutory Master
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff name / code..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Telecaller">Telecaller</option>
              <option value="FOS">FOS (Field Officer)</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
              <tr>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-right">Fixed Monthly Salary</th>
                <th className="p-3 text-right">FOS Commission</th>
                <th className="p-3">PF UAN / ESIC</th>
                <th className="p-3">Bank Account</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredStaff.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${emp.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px]">
                    <div>{emp.phone}</div>
                    <div className="text-slate-400">{emp.email}</div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatINR(emp.baseSalary)}
                  </td>
                  <td className="p-3 text-right text-emerald-600 font-bold">
                    {emp.fosCommissionRatePercent ? `${emp.fosCommissionRatePercent}% Slab` : '—'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    <div>UAN: {emp.bankDetails.uanPf}</div>
                    <div className="text-slate-400">ESIC: {emp.bankDetails.esicNumber}</div>
                  </td>
                  <td className="p-3 text-[11px] text-slate-600 font-mono">
                    <div>{emp.bankDetails.bankName}</div>
                    <div className="text-slate-400">{emp.bankDetails.accountNumber}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Digital Attendance Ledger */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Today's Digital Attendance & GPS Punch Ledger ({todayStr})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Automatic Geo-Tagging Enabled</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {attendance.map(a => (
            <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{a.employeeName}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  a.status === 'Present'
                    ? 'bg-emerald-100 text-emerald-800'
                    : a.status === 'On Field'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {a.status}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] flex justify-between">
                <span>Role: {a.role}</span>
                <span>In: <strong>{a.clockInTime}</strong></span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <MapPin className="w-3 h-3" /> GPS Verified Punch
                </span>
                <span>{a.totalHours ? `${a.totalHours} hrs` : 'In Progress'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Add New Recovery Staff Member</h3>
                <p className="text-xs text-slate-300">Statutory EPFO & ESIC details required for automated payroll.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Sunil V. Shinde"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Operational Role *</label>
                  <select
                    value={newEmp.role}
                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Telecaller">Telecaller</option>
                    <option value="FOS">FOS (Field Officer)</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Base Fixed Monthly Salary (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newEmp.baseSalary}
                    onChange={e => setNewEmp({ ...newEmp, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                {newEmp.role === 'FOS' && (
                  <div className="col-span-2 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <label className="block font-bold text-blue-900 uppercase mb-1">FOS Recovery Commission Rate (%)</label>
                    <input
                      type="number"
                      value={newEmp.fosCommissionRatePercent}
                      onChange={e => setNewEmp({ ...newEmp, fosCommissionRatePercent: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-blue-300 rounded-lg bg-white text-xs font-bold"
                    />
                    <p className="text-[10px] text-blue-700 mt-0.5">Calculated automatically on total collected rupee amount.</p>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={newEmp.phone}
                    onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="name@agency.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">PF UAN Number</label>
                  <input
                    type="text"
                    value={newEmp.uanPf}
                    onChange={e => setNewEmp({ ...newEmp, uanPf: e.target.value })}
                    placeholder="101XXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">ESIC IP Number</label>
                  <input
                    type="text"
                    value={newEmp.esicNumber}
                    onChange={e => setNewEmp({ ...newEmp, esicNumber: e.target.value })}
                    placeholder="310XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
