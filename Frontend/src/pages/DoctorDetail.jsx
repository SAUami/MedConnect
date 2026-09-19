import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ShieldCheck,
  User,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [consultationType, setConsultationType] = useState('in-clinic');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Generate next 7 days list
  useEffect(() => {
    const dates = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      dates.push({
        date: iso,
        dayName,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayName}, ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      });
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].date);
    }
  }, []);

  // Fetch Doctor details & reviews
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const [docRes, revRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/reviews/doctor/${id}`),
        ]);
        setDoctor(docRes.data);
        setReviews(revRes.data);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Fetch booked slots for the selected doctor & date
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchBookedSlots = async () => {
      try {
        const res = await api.get(`/appointments/booked-slots?doctorId=${id}&date=${selectedDate}`);
        setBookedSlots(res.data);
        setSelectedSlot(''); // Reset slot on date change
      } catch (err) {
        console.error('Error checking booked slots:', err);
      }
    };

    fetchBookedSlots();
  }, [id, selectedDate]);

  // Determine available slots for the chosen date's day of week
  const getSlotsForSelectedDate = () => {
    if (!doctor || !selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dateObj.getDay()];

    const dayAvailability = doctor.availability?.find(
      (a) => a.day.toLowerCase() === currentDayName.toLowerCase()
    );

    return dayAvailability ? dayAvailability.slots : [
      '09:00 AM - 09:30 AM',
      '10:00 AM - 10:30 AM',
      '11:00 AM - 11:30 AM',
      '04:00 PM - 04:30 PM',
      '05:00 PM - 05:30 PM',
    ];
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/doctors/${id}`));
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setBookingError('Please select both an appointment date and an available time slot.');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await api.post('/appointments/book', {
        doctorId: id,
        date: selectedDate,
        timeSlot: selectedSlot,
        symptoms,
        consultationType,
      });

      setBookingSuccess(res.data.appointment);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested specialist is no longer active.</p>
        <Link to="/doctors" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Back to Doctors Catalog
        </Link>
      </div>
    );
  }

  const currentSlots = getSlotsForSelectedDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back Link */}
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Doctors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Doctor Profile Bio & Reviews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg">
                  {doctor.specialization}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{doctor.user?.name}</h1>
                <p className="text-sm text-slate-600 font-medium">{doctor.qualifications}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {doctor.rating} ({doctor.totalReviews} Reviews)
                  </div>
                  <span>•</span>
                  <span>{doctor.experience} Years Experience</span>
                </div>

                {/* Consultation Timings */}
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-bold text-xs mt-3 w-fit">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Available at 9:00 AM to 5:00 PM</span>
                </div>
              </div>

              <div className="text-right sm:text-right bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold block">Consultation Fee</span>
                <span className="text-2xl font-black text-emerald-600">₹{doctor.fees}</span>
              </div>
            </div>

            {/* About */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">About Doctor</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {doctor.about ||
                  'Specialized medical practitioner with extensive expertise in diagnostics, preventative wellness, and compassionate patient management.'}
              </p>
            </div>

            {/* Clinic Address */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">Clinic Location</h3>
              <div className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{doctor.clinicAddress}</span>
              </div>
            </div>
          </div>

          {/* Patient Reviews Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Patient Reviews & Experiences</h3>
              <span className="text-xs font-semibold text-slate-500">{reviews.length} Verified Reviews</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No reviews yet for this doctor. Be the first to leave one after your consultation!</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {rev.patient?.name?.[0] || 'P'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{rev.patient?.name || 'Verified Patient'}</span>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        {rev.rating}/5
                      </div>
                    </div>
                    {rev.comment && <p className="text-xs text-slate-600 pl-9">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Appointment Booking Flow */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-blue-900/5 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Book Appointment
            </h2>

            {/* Success state */}
            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">Appointment Confirmed!</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your appointment with <span className="font-semibold">{doctor.user?.name}</span> is scheduled for{' '}
                  <span className="font-semibold">{bookingSuccess.date}</span> at{' '}
                  <span className="font-semibold">{bookingSuccess.timeSlot}</span>.
                </p>

                {bookingSuccess.consultationType === 'video' && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700">
                    <span className="font-bold block text-blue-600 mb-1">Teleconsultation Room Ready</span>
                    You can join the video consultation anytime from your Patient Dashboard.
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    to="/patient-dashboard"
                    className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20"
                  >
                    View in My Dashboard & Records
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* 1. Consultation Mode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultationType('in-clinic')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        consultationType === 'in-clinic'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 ${consultationType === 'in-clinic' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold">In-Clinic</div>
                        <div className="text-[10px] text-slate-500">Visit Hospital</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('video')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        consultationType === 'video'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Video className={`w-5 h-5 ${consultationType === 'video' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold">Video Call</div>
                        <div className="text-[10px] text-slate-500">Jitsi Live Room</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Date Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    2. Select Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {availableDates.map((item) => (
                      <button
                        type="button"
                        key={item.date}
                        onClick={() => setSelectedDate(item.date)}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs text-center shrink-0 transition-all ${
                          selectedDate === item.date
                            ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">{item.label}</div>
                        <div className={`text-[10px] ${selectedDate === item.date ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.date}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Slot Picker with Collision Avoidance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Available Time Slots
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> 9:00 AM - 5:00 PM
                    </span>
                  </div>

                  {currentSlots.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      Doctor is not available on this day. Please select another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {currentSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlot === slot;

                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl border text-xs text-center transition-all relative ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm shadow-blue-500/30'
                                : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{slot}</span>
                            </div>
                            {isBooked && (
                              <span className="block text-[9px] text-red-500 font-bold uppercase mt-0.5 no-underline">
                                Already Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Symptoms / Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    4. Symptoms or Reason for Visit (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Mild headache, follow-up checkup, fever since 2 days..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Reserving Slot...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Booking (₹{doctor.fees})
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-slate-500">
                    You will be prompted to sign in to confirm this booking.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
