import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  History,
  Activity,
  AlertCircle,
  HeartPulse,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrescriptionTemplate from '../components/PrescriptionTemplate';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitals, setVitals] = useState({ bp: '120/80', temp: '98.6', pulse: '72', weight: '65' });
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 Tablet', frequency: 'Twice daily (After meals)', duration: '5 days', instructions: 'After meals with water' },
  ]);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [selectedViewPrescription, setSelectedViewPrescription] = useState(null);

  // Patient History Modal State
  const [historyModalPatient, setHistoryModalPatient] = useState(null);
  const [patientHistoryRecords, setPatientHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching doctor schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (apptId, newStatus) => {
    try {
      await api.patch(`/appointments/${apptId}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  // Medicine list modifiers
  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1 Tablet', frequency: 'Twice daily (After meals)', duration: '5 days', instructions: 'After meals with water' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Open Prescription Form
  const openPrescriptionModal = (appt) => {
    setPrescriptionModalAppt(appt);
    setDiagnosis('');
    setChiefComplaint(appt.symptoms || '');
    setVitals({ bp: '120/80', temp: '98.6', pulse: '72', weight: '65' });
    setInstructions('Maintain adequate hydration, light home-cooked diet, and complete medicine course as directed.');
    setFollowUpDate('After 7 days / As needed');
    setMedicines([
      { name: '', dosage: '1 Tablet', frequency: 'Twice daily (After meals)', duration: '5 days', instructions: 'After meals with water' },
    ]);
    setPrescriptionError('');
  };

  // Submit Prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setPrescriptionError('');

    if (!diagnosis.trim()) {
      setPrescriptionError('Please enter a diagnosis.');
      return;
    }

    const invalidMedicine = medicines.some((m) => !m.name.trim());
    if (invalidMedicine) {
      setPrescriptionError('Please specify name for all prescribed medicines.');
      return;
    }

    try {
      setPrescriptionSubmitting(true);
      const res = await api.post('/prescriptions/create', {
        appointmentId: prescriptionModalAppt._id,
        diagnosis,
        chiefComplaint,
        vitals,
        medicines,
        instructions,
        followUpDate,
      });

      setPrescriptionModalAppt(null);
      fetchAppointments();
      if (res.data?.prescription) {
        setSelectedViewPrescription(res.data.prescription);
      }
    } catch (err) {
      setPrescriptionError(err.response?.data?.message || 'Failed to submit prescription');
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  // View & Print Completed Prescription
  const handleViewPrescription = async (apptId) => {
    try {
      const res = await api.get(`/prescriptions/appointment/${apptId}`);
      setSelectedViewPrescription(res.data);
    } catch (err) {
      alert('Prescription not yet created or not found for this appointment.');
    }
  };

  // Open Patient Past Medical History
  const openPatientHistory = async (patient) => {
    if (!patient) return;
    try {
      setHistoryModalPatient(patient);
      setHistoryLoading(true);
      const res = await api.get(`/prescriptions/patient/${patient._id}`);
      setPatientHistoryRecords(res.data);
    } catch (err) {
      alert('Error fetching patient history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold rounded-full uppercase tracking-wider inline-block">
            Doctor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Hello, {user?.name}</h1>
          <p className="text-xs sm:text-sm text-blue-100">
            Manage your consultation queue, launch tele-clinics, and issue digital prescriptions.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div className="text-center px-3">
            <div className="text-2xl font-black">{todayAppointments.length}</div>
            <div className="text-[11px] text-blue-100">Today's Visits</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-3">
            <div className="text-2xl font-black">{appointments.length}</div>
            <div className="text-[11px] text-blue-100">Total Bookings</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-3">
            <div className="text-2xl font-black text-emerald-300">{completedAppointments.length}</div>
            <div className="text-[11px] text-blue-100">Completed</div>
          </div>
        </div>
      </div>

      {/* Appointments Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Patient Appointments Queue</h2>
            <p className="text-xs text-slate-500">All registered consultations in chronological order</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {appointments.length} Patients
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading appointments schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Appointments Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">Patients booking your slots will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Patient Details</th>
                  <th className="p-4">Date & Time Slot</th>
                  <th className="p-4">Consultation Mode</th>
                  <th className="p-4">Symptoms / Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const p = appt.patient;

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {p?.name?.[0] || 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p?.name || 'Patient'}</div>
                            <div className="text-[11px] text-slate-500">
                              {p?.gender || 'N/A'}, {p?.age ? `${p.age} Y` : ''} • {p?.phone || p?.email}
                            </div>
                            <button
                              onClick={() => openPatientHistory(p)}
                              className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                            >
                              <History className="w-3 h-3" /> View Medical History
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{appt.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {appt.timeSlot}
                        </div>
                      </td>

                      {/* Mode */}
                      <td className="p-4">
                        {appt.consultationType === 'video' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 font-bold text-[11px]">
                              <Video className="w-3 h-3" /> Teleconsultation
                            </span>
                            {appt.status === 'confirmed' && appt.meetingLink && (
                              <a
                                href={`${appt.meetingLink}#userInfo.displayName="${encodeURIComponent(user?.name || 'Doctor')}"`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-[10px] text-blue-600 font-bold hover:underline"
                              >
                                Join Video Room →
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            In-Clinic OPD
                          </span>
                        )}
                      </td>

                      {/* Symptoms */}
                      <td className="p-4 max-w-xs">
                        <span className="text-slate-600 text-xs italic">
                          {appt.symptoms || 'General routine consultation'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider inline-block ${
                              appt.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : appt.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {appt.status}
                          </span>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              appt.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {appt.paymentStatus === 'paid' ? `Paid (${appt.paymentMethod || 'UPI'})` : 'Pay at Clinic'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => openPrescriptionModal(appt)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Write Rx
                              </button>

                              <button
                                onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                title="Cancel consultation"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {appt.status === 'completed' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                              <button
                                onClick={() => handleViewPrescription(appt._id)}
                                className="px-2.5 py-1.5 bg-[#076c72] hover:bg-[#065b60] text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                View / Print Rx
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: DIGITAL PRESCRIPTION MAKER */}
      {prescriptionModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Generate Digital Prescription</h3>
              </div>
              <button
                onClick={() => setPrescriptionModalAppt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Patient overview header */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">PATIENT</span>
                <span className="font-bold text-slate-900 text-sm">{prescriptionModalAppt.patient?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE & SLOT</span>
                <span className="font-semibold text-slate-800">
                  {prescriptionModalAppt.date} ({prescriptionModalAppt.timeSlot})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">REPORTED SYMPTOMS</span>
                <span className="text-slate-700 italic">{prescriptionModalAppt.symptoms || 'None stated'}</span>
              </div>
            </div>

            {prescriptionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{prescriptionError}</span>
              </div>
            )}

            <form onSubmit={handlePrescriptionSubmit} className="space-y-5">
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  1. Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Type-2 Diabetes Mellitus, Allergic Contact Dermatitis..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  2. Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. High fever, persistent dry cough, body fatigue for 3 days..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Patient Vitals (BP, Temp, Pulse, Weight) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  3. Patient Vitals
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">BP (mmHg)</span>
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      placeholder="120/80"
                      className="w-full bg-white p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Temp (°F)</span>
                    <input
                      type="text"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      placeholder="98.6"
                      className="w-full bg-white p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Pulse (/min)</span>
                    <input
                      type="text"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="72"
                      className="w-full bg-white p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Weight (kg)</span>
                    <input
                      type="text"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      placeholder="65"
                      className="w-full bg-white p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Medicines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Prescribe Medications (Rx)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2">
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center text-xs"
                    >
                      <div className="col-span-12 sm:col-span-3">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name (e.g. Paracetamol 650)"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1 Tab)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Frequency (Twice daily)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Duration (5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-11 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Instructions (After food)"
                          value={med.instructions || ''}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={medicines.length === 1}
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions & Advice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  3. Doctor's Advice / Lifestyle Recommendations
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Drink plenty of warm water, low sodium diet, avoid strenuous exercise..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Follow Up Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  4. Follow-Up Recommendation (Optional)
                </label>
                <input
                  type="text"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  placeholder="e.g. Review after 7 days, or if fever persists"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPrescriptionModalAppt(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prescriptionSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {prescriptionSubmitting ? 'Finalizing Prescription...' : 'Issue Prescription & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PATIENT PAST MEDICAL HISTORY */}
      {historyModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  Medical History: {historyModalPatient.name}
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalPatient(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {historyLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading health history timeline...</div>
            ) : patientHistoryRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No past prescriptions recorded for this patient.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {patientHistoryRecords.map((rec) => (
                  <div key={rec._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="font-bold text-blue-700">
                        {rec.doctor?.user?.name || 'Doctor'} ({rec.doctor?.specialization})
                      </span>
                      <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">Diagnosis: {rec.diagnosis}</div>
                    <div className="text-slate-600">
                      <span className="font-semibold">Medicines: </span>
                      {rec.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                    </div>
                    {rec.instructions && (
                      <div className="text-slate-500 italic">Advice: {rec.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: EXACT OFFICIAL MEDCONNECT PRESCRIPTION TEMPLATE */}
      {selectedViewPrescription && (
        <PrescriptionTemplate
          prescription={selectedViewPrescription}
          onClose={() => setSelectedViewPrescription(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
