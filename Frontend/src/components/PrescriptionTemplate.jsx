import React, { useState, useEffect } from 'react';
import { Printer, X, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';

const PrescriptionTemplate = ({ prescription, onClose }) => {
  if (!prescription) return null;

  // Zoom scale state: 'extra-small' (460px), 'small' (530px - default), 'medium' (640px)
  const [sizePreset, setSizePreset] = useState('small');

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const doctor = prescription.doctor || {};
  const doctorUser = doctor.user || {};
  const patient = prescription.patient || {};
  const appointment = prescription.appointment || {};
  const vitals = prescription.vitals || {};

  const handlePrint = () => {
    window.print();
  };

  // Fallback high quality avatar photos if not in DB
  const doctorPhoto =
    doctor.image ||
    doctorUser.image ||
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
  const patientPhoto =
    patient.image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
  };

  // Medicines (up to 8 rows to match the official template)
  const prescribedMeds = prescription.medicines || [];
  const tableRows = [];
  for (let i = 0; i < Math.max(8, prescribedMeds.length); i++) {
    tableRows.push(prescribedMeds[i] || null);
  }

  const clinicName = doctor.clinicName || 'MedConnect Multi-Specialty Hospital & Research Center';
  const clinicAddress = doctor.clinicAddress || 'Plot 42, Health City, Sector 62, New Delhi - 110092';
  const clinicPhone = doctor.clinicPhone || '+91 11 4567 8900';
  const clinicEmail = doctor.clinicEmail || 'care@medconnect.in';
  const clinicWebsite = 'www.medconnect.org';
  const clinicRegNo = doctor.clinicRegNo || 'DL-HOSP-2024-8841';

  // Size preset mapping
  const containerWidthClass =
    sizePreset === 'extra-small'
      ? 'max-w-[460px]'
      : sizePreset === 'medium'
      ? 'max-w-2xl'
      : 'max-w-[535px]'; // 'small' is default

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed-none"
    >
      {/* Container Card (Compact / Small by Default) */}
      <div className={`bg-white w-full ${containerWidthClass} rounded-2xl shadow-2xl overflow-hidden my-3 border border-slate-300 transition-all print:border-none print:shadow-none print:max-w-none print:my-0 print:rounded-none relative`}>
        
        {/* Sticky Controls Header (Hidden while printing) */}
        <div className="sticky top-0 z-30 bg-slate-900 text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-xs tracking-wide block">MedConnect Prescription</span>
              <span className="text-[10px] text-slate-400 block sm:inline">Official Digital Copy</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Size Toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 text-[10px] font-semibold border border-slate-700">
              <span className="text-[9px] text-slate-400 px-1.5 font-normal">Size:</span>
              <button
                type="button"
                onClick={() => setSizePreset('extra-small')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  sizePreset === 'extra-small' ? 'bg-[#076c72] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Extra Small Size"
              >
                XS
              </button>
              <button
                type="button"
                onClick={() => setSizePreset('small')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  sizePreset === 'small' ? 'bg-[#076c72] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Small Compact (Default)"
              >
                Small
              </button>
              <button
                type="button"
                onClick={() => setSizePreset('medium')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  sizePreset === 'medium' ? 'bg-[#076c72] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Medium Size"
              >
                Medium
              </button>
            </div>

            {/* Print Button (Prominent Emerald/Green) */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Print Prescription or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            {/* Cancel Button (Prominent Red / Rose with clear text label) */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Cancel and close prescription"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= EXACT PRESCRIPTION SHEET PRINTABLE ================= */}
        <div
          id="medconnect-official-prescription"
          className="bg-white text-slate-900 p-0 relative font-sans select-text text-left"
        >
          {/* Subtle Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-[280px] h-[280px] fill-current text-[#076c72]">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" />
              <path d="M85 45 H115 V85 H155 V115 H115 V155 H85 V115 H45 V85 H85 Z" fill="currentColor" />
            </svg>
          </div>

          {/* 1. TOP HEADER BAR (Deep Teal #076c72) - Extra Compact */}
          <div className="bg-[#076c72] text-white px-3.5 py-2.5 flex items-center justify-between gap-2.5">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-2">
              {/* White Circular Cross + ECG Pulse Logo */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-2xs shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M38 18 H62 V38 H82 V62 H62 V82 H38 V62 H18 V38 H38 Z"
                    fill="#076c72"
                  />
                  <path
                    d="M10 76 L32 76 L40 64 L48 88 L58 56 L66 76 L90 76"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                  MedConnect
                </h1>
                <p className="text-[9px] sm:text-[10px] text-teal-100 italic font-light mt-0.5 tracking-wide">
                  Your Health, Digitally Connected
                </p>
              </div>
            </div>

            {/* Clinic / Hospital Details */}
            <div className="text-right text-teal-100 text-[9px] leading-tight space-y-0.5">
              <div className="font-bold text-white text-[11px] sm:text-xs tracking-wide">
                {clinicName}
              </div>
              <div className="truncate max-w-[240px]">{clinicAddress}</div>
              <div>
                {clinicPhone} &nbsp;|&nbsp; {clinicEmail}
              </div>
              <div className="font-semibold text-teal-200">
                Reg. No.: {clinicRegNo}
              </div>
            </div>
          </div>

          {/* MAIN BODY PADDING - Tight & Compact */}
          <div className="p-3 space-y-2">
            {/* 2. ROW 1: DOCTOR DETAILS & CONSULTATION DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* DOCTOR DETAILS BOX */}
              <div className="border border-slate-300 rounded-md p-2 bg-white relative overflow-hidden flex justify-between gap-1.5 shadow-2xs">
                <div className="space-y-1 flex-1">
                  <div className="text-[8px] font-bold tracking-wider text-slate-500 uppercase">
                    DOCTOR DETAILS
                  </div>
                  
                  <div className="text-[10px] text-slate-800 leading-tight">
                    <span className="font-semibold text-slate-700">Dr. </span>
                    <span className="font-bold text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[100px]">
                      {doctorUser.name || 'Specialist Consultant'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-800 leading-tight">
                    <span className="font-semibold text-slate-700">Specialization: </span>
                    <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[80px]">
                      {doctor.specialization || 'General Physician'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-800 leading-tight">
                    <span className="font-semibold text-slate-700">Reg./License No.: </span>
                    <span className="font-medium text-slate-800 border-b border-slate-400 pb-0.5 inline-block min-w-[70px]">
                      {doctor.regNo || 'MCI/DMC-84920'}
                    </span>
                  </div>
                </div>

                {/* DOCTOR IMAGE IN DARK TRANSPARENT STYLE */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="relative group">
                    <img
                      src={doctorPhoto}
                      alt="Doctor Profile"
                      className="w-10 h-10 rounded-md object-cover border border-slate-400/80 shadow-2xs filter contrast-125 brightness-90 grayscale-[40%]"
                      style={{
                        opacity: 0.65,
                        backgroundColor: '#1e293b',
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/25 rounded-md pointer-events-none" />
                  </div>
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    Doctor
                  </span>
                </div>
              </div>

              {/* CONSULTATION DETAILS BOX */}
              <div className="border border-slate-300 rounded-md p-2 bg-white space-y-1 shadow-2xs">
                <div className="text-[8px] font-bold tracking-wider text-slate-500 uppercase">
                  CONSULTATION DETAILS
                </div>

                <div className="text-[10px] text-slate-800 leading-tight">
                  <span className="font-semibold text-slate-700">Date: </span>
                  <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[90px]">
                    {formatDate(appointment.date || prescription.createdAt)}
                  </span>
                </div>

                <div className="text-[10px] text-slate-800 leading-tight">
                  <span className="font-semibold text-slate-700">OPD / Appt ID: </span>
                  <span className="font-mono text-[9px] text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[80px]">
                    {appointment._id ? `OPD-${appointment._id.toString().slice(-8).toUpperCase()}` : `RX-${prescription._id.toString().slice(-8).toUpperCase()}`}
                  </span>
                </div>

                <div className="text-[10px] text-slate-800 leading-tight">
                  <span className="font-semibold text-slate-700">Follow-up: </span>
                  <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[80px]">
                    {prescription.followUpDate || 'After 7 days / As needed'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. ROW 2: PATIENT DETAILS BOX */}
            <div className="border border-slate-300 rounded-md p-2 bg-white shadow-2xs flex justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="text-[8px] font-bold tracking-wider text-slate-500 uppercase">
                  PATIENT DETAILS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-y-1 gap-x-2 text-[10px]">
                  {/* Name */}
                  <div className="sm:col-span-6 leading-tight">
                    <span className="font-semibold text-slate-700">Name: </span>
                    <span className="font-bold text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[100px]">
                      {patient.name || 'Patient'}
                    </span>
                  </div>

                  {/* Age & Gender */}
                  <div className="sm:col-span-6 flex items-center gap-2 leading-tight">
                    <div>
                      <span className="font-semibold text-slate-700">Age: </span>
                      <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[24px] text-center">
                        {patient.age || '32'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Gender: </span>
                      <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[40px] text-center capitalize">
                        {patient.gender || 'Male'}
                      </span>
                    </div>
                  </div>

                  {/* Patient ID */}
                  <div className="sm:col-span-6 leading-tight">
                    <span className="font-semibold text-slate-700">Patient ID: </span>
                    <span className="font-mono font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[90px]">
                      {patient._id ? `PAT-${patient._id.toString().slice(-6).toUpperCase()}` : 'PAT-849201'}
                    </span>
                  </div>

                  {/* Contact No */}
                  <div className="sm:col-span-6 leading-tight">
                    <span className="font-semibold text-slate-700">Contact: </span>
                    <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[90px]">
                      {patient.phone || '+91 98765 43210'}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-12 leading-tight">
                    <span className="font-semibold text-slate-700">Address: </span>
                    <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 inline-block w-full sm:w-[85%] truncate">
                      {patient.address || 'Flat 402, Green Valley Apartments, Delhi NCR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PATIENT IMAGE IN DARK TRANSPARENT STYLE */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative group">
                  <img
                    src={patientPhoto}
                    alt="Patient Profile"
                    className="w-10 h-10 rounded-md object-cover border border-slate-400/80 shadow-2xs filter contrast-125 brightness-90 grayscale-[40%]"
                    style={{
                      opacity: 0.65,
                      backgroundColor: '#1e293b',
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/25 rounded-md pointer-events-none" />
                </div>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Patient
                </span>
              </div>
            </div>

            {/* 4. ROW 3: VITALS (4 EQUAL COMPACT BOXES) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div className="border border-slate-300 rounded-md py-1 px-1.5 bg-white text-[9px] font-semibold text-slate-700 flex items-center justify-center gap-0.5 shadow-2xs">
                <span>BP:</span>
                <span className="border-b border-slate-400 font-bold text-slate-900 px-0.5 min-w-[32px] text-center">
                  {vitals.bp || '120/80'}
                </span>
                <span>mmHg</span>
              </div>

              <div className="border border-slate-300 rounded-md py-1 px-1.5 bg-white text-[9px] font-semibold text-slate-700 flex items-center justify-center gap-0.5 shadow-2xs">
                <span>Temp:</span>
                <span className="border-b border-slate-400 font-bold text-slate-900 px-0.5 min-w-[24px] text-center">
                  {vitals.temp || '98.6'}
                </span>
                <span>°F</span>
              </div>

              <div className="border border-slate-300 rounded-md py-1 px-1.5 bg-white text-[9px] font-semibold text-slate-700 flex items-center justify-center gap-0.5 shadow-2xs">
                <span>Pulse:</span>
                <span className="border-b border-slate-400 font-bold text-slate-900 px-0.5 min-w-[22px] text-center">
                  {vitals.pulse || '72'}
                </span>
                <span>/min</span>
              </div>

              <div className="border border-slate-300 rounded-md py-1 px-1.5 bg-white text-[9px] font-semibold text-slate-700 flex items-center justify-center gap-0.5 shadow-2xs">
                <span>Weight:</span>
                <span className="border-b border-slate-400 font-bold text-slate-900 px-0.5 min-w-[22px] text-center">
                  {vitals.weight || '68'}
                </span>
                <span>kg</span>
              </div>
            </div>

            {/* 5. ROW 4: DIAGNOSIS / CHIEF COMPLAINT */}
            <div className="border border-slate-300 rounded-md p-2 bg-white shadow-2xs space-y-0.5 min-h-[48px]">
              <div className="text-[8px] font-bold tracking-wider text-slate-500 uppercase">
                DIAGNOSIS / CHIEF COMPLAINT
              </div>
              <div className="text-[10px] text-slate-900 font-medium leading-tight">
                <div className="border-b border-slate-300 pb-0.5 font-bold text-[11px] text-slate-900">
                  {prescription.diagnosis}
                </div>
                {prescription.chiefComplaint && (
                  <div className="border-b border-slate-200 py-0.5 text-slate-700">
                    <span className="font-semibold text-slate-800">Chief Complaints: </span>
                    {prescription.chiefComplaint}
                  </div>
                )}
                {!prescription.chiefComplaint && (
                  <div className="border-b border-slate-200 py-0.5 text-slate-400 italic">
                    Primary diagnostic observation verified during clinical examination.
                  </div>
                )}
              </div>
            </div>

            {/* 6. ROW 5: Rx SYMBOL & MEDICINES TABLE */}
            <div className="pt-0.5">
              {/* Rx Symbol */}
              <div className="text-xl font-serif font-black italic tracking-wide text-[#076c72] mb-0.5 select-none flex items-center gap-1">
                <span>℞</span>
              </div>

              {/* Medicine Table with exact Deep Teal Header (#076c72) - Tight Rows */}
              <div className="border border-[#076c72] rounded-md overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-[9px] sm:text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#076c72] text-white font-bold">
                      <th className="py-1 px-1.5 text-center border-r border-[#0e747a] w-7">#</th>
                      <th className="py-1 px-1.5 border-r border-[#0e747a]">Medicine Name</th>
                      <th className="py-1 px-1.5 border-r border-[#0e747a] w-20">Dosage</th>
                      <th className="py-1 px-1.5 border-r border-[#0e747a] w-24">Frequency</th>
                      <th className="py-1 px-1.5 border-r border-[#0e747a] w-16">Duration</th>
                      <th className="py-1 px-1.5">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                    {tableRows.map((med, idx) => (
                      <tr
                        key={idx}
                        className={`h-5 sm:h-5.5 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                      >
                        <td className="py-0.5 px-1.5 text-center text-slate-600 font-semibold border-r border-slate-300">
                          {idx + 1}.
                        </td>
                        <td className="py-0.5 px-1.5 font-bold text-slate-900 border-r border-slate-300 truncate max-w-[120px]">
                          {med ? med.name : ''}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-700 border-r border-slate-300">
                          {med ? med.dosage : ''}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-700 border-r border-slate-300">
                          {med ? med.frequency : ''}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-700 border-r border-slate-300">
                          {med ? med.duration : ''}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-600 italic truncate max-w-[110px]">
                          {med ? (med.instructions || 'After meals') : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. ROW 6: ADVICE / GENERAL INSTRUCTIONS */}
            <div className="border border-slate-300 rounded-md p-2 bg-white shadow-2xs space-y-0.5 min-h-[48px]">
              <div className="text-[8px] font-bold tracking-wider text-slate-500 uppercase">
                ADVICE / GENERAL INSTRUCTIONS
              </div>
              <div className="text-[9px] text-slate-800 font-medium leading-tight">
                <div className="border-b border-slate-300 pb-0.5">
                  {prescription.instructions || 'Maintain adequate hydration, consume easily digestible nutritious diet, and ensure 8 hours of sleep.'}
                </div>
                <div className="border-b border-slate-300 py-0.5 text-slate-600">
                  Avoid heavy lifting or stressful physical exertion during recovery period. Complete full antibiotic course as prescribed.
                </div>
                <div className="border-b border-slate-200 py-0.5 text-slate-400 italic">
                  Report to emergency room immediately if high fever, severe breathlessness, or unusual allergic reactions occur.
                </div>
              </div>
            </div>

            {/* 8. FOOTER & SIGNATURE */}
            <div className="pt-2 flex justify-between items-end gap-2">
              {/* Disclaimer */}
              <div className="max-w-[210px] text-[8px] text-slate-500 leading-tight">
                This is a digitally generated prescription template from the
                <br />
                MedConnect platform. Please verify all details before dispensing.
              </div>

              {/* Signature & Stamp */}
              <div className="text-center shrink-0 w-36 sm:w-44">
                <div className="font-serif italic font-bold text-[11px] text-[#076c72] mb-0.5">
                  Dr. {doctorUser.name || 'Practitioner'}
                </div>
                <div className="border-t-2 border-slate-800 w-full mb-0.5"></div>
                <div className="text-[9px] text-slate-600 font-medium">
                  Doctor's Signature & Stamp
                </div>
              </div>
            </div>
          </div>

          {/* 9. BOTTOM DEEP TEAL BAR */}
          <div className="bg-[#076c72] text-white py-1 px-2.5 text-center text-[9px] font-medium tracking-wide">
            MedConnect &nbsp;•&nbsp; Doctor Appointment & Digital Health Record System
          </div>
        </div>

        {/* Dedicated Bottom Action Footer (Hidden while printing) */}
        <div className="bg-slate-100 p-3.5 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-xl border border-rose-300 hover:border-rose-400 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-rose-600" />
              <span>Cancel (Close)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="ml-auto px-5 py-2 bg-[#076c72] hover:bg-[#065b60] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;
