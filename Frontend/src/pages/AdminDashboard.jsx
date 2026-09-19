import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  FileText,
  Shield,
  Search,
  Activity,
  UserCheck,
  UserX,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'appointments' | 'users'
  const [userRoleFilter, setUserRoleFilter] = useState('categorized'); // 'categorized' | 'all' | 'patient' | 'doctor' | 'admin'
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, docRes, apptRes, userRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors'),
        api.get('/admin/appointments'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
      setUsersList(userRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDoctorApproval = async (docId) => {
    try {
      await api.patch(`/admin/doctors/${docId}/approval`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating doctor status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold rounded-full uppercase tracking-wider inline-block">
            Administration Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Platform Analytics & Control</h1>
          <p className="text-xs sm:text-sm text-purple-200">
            System overview for MedConnect healthcare network. Verify doctors, track appointments, and audit user records.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 text-xs">
          <Shield className="w-4 h-4 text-purple-300" />
          <span className="font-bold">Super Admin: {user?.name}</span>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalPatients}</div>
            <div className="text-[11px] text-slate-400 mt-1">Registered Users</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doctors</span>
              <Stethoscope className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalDoctors}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active Practitioners</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalAppointments}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total Appointments</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">{stats.completedAppointments}</div>
            <div className="text-[11px] text-slate-400 mt-1">Successful Visits</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescriptions</span>
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 mt-2">{stats.totalPrescriptions}</div>
            <div className="text-[11px] text-slate-400 mt-1">Digital Rx Issued</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'doctors'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Manage Doctors ({doctors.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments Audit Log ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          All Users Directory ({usersList.length})
        </button>
      </div>

      {/* TAB 1: DOCTOR MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Doctor Directory & Verification</h3>
            <span className="text-xs text-slate-500 font-medium">Click button to toggle approval status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Doctor Name & Email</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Experience & Fees</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{doc.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{doc.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-[11px]">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>{doc.experience} Years Exp</div>
                      <div className="text-[11px] font-bold text-emerald-600">₹{doc.fees}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-amber-500">★ {doc.rating}</span>{' '}
                      <span className="text-slate-400">({doc.totalReviews})</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                          doc.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {doc.isApproved ? 'Approved' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleDoctorApproval(doc._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                          doc.isApproved
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {doc.isApproved ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS AUDIT */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Network Appointments Audit Trail</h3>
            <p className="text-xs text-slate-500">Every appointment scheduled across all clinics</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/80">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{appt.patient?.name || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-400">{appt.patient?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{appt.doctor?.user?.name || 'Doctor'}</div>
                      <div className="text-[11px] text-blue-600">{appt.doctor?.specialization}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{appt.date}</div>
                      <div className="text-[11px] text-slate-500">{appt.timeSlot}</div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-slate-600">{appt.consultationType}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                          appt.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL USERS DIRECTORY (SEPARATED BY ROLES: PATIENTS, DOCTORS, ADMINS) */}
      {activeTab === 'users' && (() => {
        const patientUsers = usersList.filter((u) => u.role === 'patient');
        const doctorUsers = usersList.filter((u) => u.role === 'doctor');
        const adminUsers = usersList.filter((u) => u.role === 'admin');

        const filterBySearch = (list) => {
          if (!userSearchTerm.trim()) return list;
          const term = userSearchTerm.toLowerCase();
          return list.filter(
            (u) =>
              u.name?.toLowerCase().includes(term) ||
              u.email?.toLowerCase().includes(term) ||
              u.phone?.includes(term)
          );
        };

        const filteredPatients = filterBySearch(patientUsers);
        const filteredDoctors = filterBySearch(doctorUsers);
        const filteredAdmins = filterBySearch(adminUsers);
        const filteredAll = filterBySearch(usersList);

        const getDoctorInfo = (userId, email) => {
          return doctors.find((d) => d.user?._id === userId || d.user?.email === email);
        };

        return (
          <div className="space-y-6">
            {/* Role Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setUserRoleFilter('patient')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  userRoleFilter === 'patient'
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Patient Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{patientUsers.length}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Active OPD & Digital Record Users
                </div>
              </div>

              <div
                onClick={() => setUserRoleFilter('doctor')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  userRoleFilter === 'doctor'
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Doctor Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{doctorUsers.length}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Verified Specialists & Practitioners
                </div>
              </div>

              <div
                onClick={() => setUserRoleFilter('admin')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  userRoleFilter === 'admin'
                    ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Admin Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{adminUsers.length}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  System Administrators & Security Principals
                </div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                <button
                  onClick={() => setUserRoleFilter('categorized')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'categorized'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📁 Categorized (All Roles)
                </button>
                <button
                  onClick={() => setUserRoleFilter('patient')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    userRoleFilter === 'patient'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Patients ({patientUsers.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('doctor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    userRoleFilter === 'doctor'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Doctors ({doctorUsers.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    userRoleFilter === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admins ({adminUsers.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unified Table ({usersList.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                />
              </div>
            </div>

            {/* SEPARATED SECTION 1: PATIENT DIRECTORY */}
            {(userRoleFilter === 'categorized' || userRoleFilter === 'patient') && (
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        Registered Patients Directory
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          {filteredPatients.length} {filteredPatients.length === 1 ? 'Patient' : 'Patients'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Individuals registered for doctor consultations and digital health timelines</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="p-4">Patient Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Mobile Phone</th>
                        <th className="p-4">Gender / Age</th>
                        <th className="p-4">Registration Date</th>
                        <th className="p-4 text-right">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((u) => (
                          <tr key={u._id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-400">ID: {u._id}</div>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                            <td className="p-4 text-slate-600">{u.phone || 'Not provided'}</td>
                            <td className="p-4">
                              <span className="capitalize font-semibold text-slate-700">
                                {u.gender ? u.gender : '—'}
                              </span>
                              {u.age ? ` • ${u.age} yrs` : ''}
                            </td>
                            <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td className="p-4 text-right">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Verified Patient
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No patient accounts found matching your query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEPARATED SECTION 2: DOCTORS DIRECTORY */}
            {(userRoleFilter === 'categorized' || userRoleFilter === 'doctor') && (
              <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50/60 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        Medical Doctors & Specialists Directory
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Board-certified doctors authorized for in-clinic OPD & video consultations</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="p-4">Doctor Name</th>
                        <th className="p-4">Specialization</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">Experience & Fee</th>
                        <th className="p-4">Approval Status</th>
                        <th className="p-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((u) => {
                          const docInfo = getDoctorInfo(u._id, u.email);
                          return (
                            <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900">{u.name}</div>
                                <div className="text-[10px] text-slate-400">{docInfo?.qualifications || 'MBBS, MD'}</div>
                              </td>
                              <td className="p-4">
                                <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-[11px] border border-blue-100">
                                  {docInfo?.specialization || 'Consultant Specialist'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-slate-800 font-medium">{u.email}</div>
                                <div className="text-[11px] text-slate-400">{u.phone || 'Phone N/A'}</div>
                              </td>
                              <td className="p-4">
                                <div>{docInfo ? `${docInfo.experience} Yrs Experience` : 'Experienced'}</div>
                                <div className="text-[11px] font-bold text-emerald-600">
                                  {docInfo ? `₹${docInfo.fees} / OPD` : 'Consultation'}
                                </div>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                    docInfo?.isApproved !== false
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {docInfo?.isApproved !== false ? 'Approved' : 'Suspended'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {docInfo && (
                                  <button
                                    onClick={() => handleToggleDoctorApproval(docInfo._id)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                                      docInfo.isApproved
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                                  >
                                    {docInfo.isApproved ? 'Suspend' : 'Approve'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No doctor accounts found matching your query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEPARATED SECTION 3: ADMINISTRATORS DIRECTORY */}
            {(userRoleFilter === 'categorized' || userRoleFilter === 'admin') && (
              <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50/60 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        System Administrators Directory
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                          {filteredAdmins.length} {filteredAdmins.length === 1 ? 'Admin' : 'Admins'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Super administrators managing system credentials, audit logs, and medical verifications</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="p-4">Administrator Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Contact Phone</th>
                        <th className="p-4">Authority Scope</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Security Privilege</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdmins.length > 0 ? (
                        filteredAdmins.map((u) => (
                          <tr key={u._id} className="hover:bg-purple-50/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {u.name}
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 fill-purple-100" />
                              </div>
                              <div className="text-[10px] text-slate-400">Security Root Principal</div>
                            </td>
                            <td className="p-4 text-slate-700 font-semibold">{u.email}</td>
                            <td className="p-4 text-slate-600">{u.phone || 'Dedicated System Line'}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Full Platform Audit & Control
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td className="p-4 text-right">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                                Super Admin
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No administrator accounts found matching your query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* UNIFIED FLAT TABLE (IF USER CHOOSES 'all') */}
            {userRoleFilter === 'all' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Complete User Registry ({filteredAll.length})</h3>
                  <span className="text-xs text-slate-400">Combined records of all accounts</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAll.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80">
                          <td className="p-4 font-bold text-slate-900">{u.name}</td>
                          <td className="p-4 text-slate-600">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : u.role === 'doctor'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{u.phone || 'N/A'}</td>
                          <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default AdminDashboard;
