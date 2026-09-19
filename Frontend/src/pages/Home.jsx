import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  FileText,
  Video,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  HeartPulse,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Activity,
  Award,
  Zap,
  Building2,
  MapPin,
  Navigation,
  PhoneCall,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TypewriterText from '../components/TypewriterText';

const specialties = [
  { name: 'Cardiologist', icon: '❤️', desc: 'Heart care, ECG, hypertension & rhythm' },
  { name: 'Dermatologist', icon: '✨', desc: 'Skin, hair, allergy & clinical dermatology' },
  { name: 'General Physician', icon: '🩺', desc: 'Fever, diabetes, family primary care' },
  { name: 'Pediatrician', icon: '👶', desc: 'Child health, infant nutrition & vaccination' },
  { name: 'Orthopedic Surgeon', icon: '🦴', desc: 'Joint pain, fractures, spine & arthritis' },
];

const quickSearchTags = [
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Orthopedic Surgeon',
  'Pediatrician',
];

const Home = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loggedDoctorProfile, setLoggedDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setAllDoctors(res.data);
        setFeaturedDoctors(res.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDoctors();
  }, []);

  // Fetch logged-in doctor profile if active user is a doctor
  useEffect(() => {
    if (user && user.role === 'doctor') {
      api
        .get('/doctors/profile/me')
        .then((res) => setLoggedDoctorProfile(res.data))
        .catch(() => {});
    } else {
      setLoggedDoctorProfile(null);
    }
  }, [user]);

  // Determine dynamic doctor to display in hero "Available Now" card
  const activeDisplayDoctor = (() => {
    if (user && user.role === 'doctor') {
      return {
        name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
        specialization: loggedDoctorProfile?.specialization || 'On-Duty Specialist',
        qualifications: loggedDoctorProfile?.qualifications || 'MBBS, MD',
        isLoggedInUser: true,
      };
    }
    const onlineDoc = allDoctors.find((d) => d.isOnline);
    if (onlineDoc && onlineDoc.user?.name) {
      return {
        name: onlineDoc.user.name.startsWith('Dr.') ? onlineDoc.user.name : `Dr. ${onlineDoc.user.name}`,
        specialization: onlineDoc.specialization || 'Consultant Specialist',
        qualifications: onlineDoc.qualifications || 'MBBS, MD',
        isLoggedInUser: false,
      };
    }
    if (allDoctors.length > 0 && allDoctors[0].user?.name) {
      const firstDoc = allDoctors[0];
      return {
        name: firstDoc.user.name.startsWith('Dr.') ? firstDoc.user.name : `Dr. ${firstDoc.user.name}`,
        specialization: firstDoc.specialization || 'Specialist Physician',
        qualifications: firstDoc.qualifications || 'MBBS, MD',
        isLoggedInUser: false,
      };
    }
    return {
      name: 'On-Call Verified Specialists',
      specialization: 'Cardiology, Dermatology & General OPD',
      qualifications: 'Board-Certified MDs',
      isLoggedInUser: false,
    };
  })();

  const getDoctorInitials = (name) => {
    if (!name) return 'DR';
    return (
      name
        .replace(/^Dr\.\s*/i, '')
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DR'
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/doctors?specialization=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section with Dynamic Animated Headline & Medical Watermark */}
      <section className="relative overflow-hidden hero-mesh bg-grid-pattern pt-16 pb-24 border-b border-slate-200">
        {/* High-Resolution Transparent Doctor-Patient Background Watermark (Darker & More Prominent) */}
        <div
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: "url('/medical-bg.jpg')",
            opacity: 0.32,
            mixBlendMode: 'multiply',
            filter: 'contrast(1.15) brightness(0.82)',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.6) 85%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.6) 85%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Soft Ambient Background Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Copy with Letter & Text Animations */}
            <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
              {/* Animated Top Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/80 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Modern Healthcare Ecosystem
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Clinics Online
                </span>
              </div>

              {/* Headline with Typewriter Letter Animation (Locked Height & Single Line - Zero Jump) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Intelligent Platform for
                <span className="block mt-1 sm:mt-2 h-[40px] sm:h-[56px] lg:h-[68px] min-h-[40px] sm:min-h-[56px] lg:min-h-[68px] max-h-[40px] sm:max-h-[56px] lg:max-h-[68px] flex items-center overflow-hidden font-black text-blue-600">
                  <TypewriterText
                    words={[
                      'Digital Health Records',
                      'Instant OPD Bookings',
                      'Paperless OPD Care',
                      'Live Teleconsultations',
                      'Smart Slot Booking',
                    ]}
                    typingSpeed={65}
                    deletingSpeed={30}
                    pauseDuration={2200}
                    className="font-black text-2xl sm:text-4xl lg:text-5xl text-blue-600 whitespace-nowrap"
                    textColor="text-blue-600"
                    cursorColor="bg-blue-600"
                  />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Eliminate lost paper prescriptions and chaotic hospital OPD lines. Book verified specialists with guaranteed clash-free slots, consult via encrypted video, and maintain your permanent longitudinal medical timeline in one place.
              </p>

              {/* Enhanced Interactive Search Bar */}
              <div className="space-y-2.5">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-200/90 hover:border-blue-400 transition-all"
                >
                  <div className="flex items-center gap-2.5 px-3.5 flex-1 w-full">
                    <Search className="w-5 h-5 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search doctor by name, specialty, or clinic..."
                      className="w-full py-2.5 text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02] active:scale-95"
                  >
                    Find Specialist
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Search Specialty Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Popular:
                  </span>
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg border border-slate-200/80 transition-colors font-medium shadow-xs"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Professional Trust Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/90">
                <div className="p-3 bg-white/75 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-xs">
                  <div className="text-xl font-black text-slate-900">100%</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verified Doctors</div>
                </div>
                <div className="p-3 bg-white/75 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-xs">
                  <div className="text-xl font-black text-blue-600">0s</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Slot Collision</div>
                </div>
                <div className="p-3 bg-white/75 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-xs">
                  <div className="text-xl font-black text-cyan-600">PDF</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Instant Records</div>
                </div>
                <div className="p-3 bg-white/75 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-xs">
                  <div className="text-xl font-black text-emerald-600">256-Bit</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">HIPAA Security</div>
                </div>
              </div>
            </div>

            {/* Right Col: High-Tech Telehealth Card with Floating Badges */}
            <div className="lg:col-span-5 relative">
              {/* Floating Badge 1 (Top Left) */}
              <div className="hidden sm:flex absolute -top-4 -left-6 z-20 items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-500/10 border border-slate-200 animate-float">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">100% Patient Privacy</span>
              </div>

              {/* Floating Badge 2 (Bottom Right) */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-500/10 border border-slate-200 animate-float-reverse">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-800">4.9/5 Rating (2.8k+ Reviews)</span>
              </div>

              {/* Main Interactive Doctor Preview Card */}
              <div className="relative glass-card rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-600/15 border border-white/90">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                      <HeartPulse className="w-6 h-6 animate-heartbeat text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 text-base">Live Teleconsultation</h3>
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                        Integrated Jitsi Meet HD
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                    Encrypted Call
                  </span>
                </div>

                {/* Doctor Active State Showcase (Dynamic - shows logged-in doctor or active on-duty practitioner) */}
                <div
                  className={`my-4 p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    activeDisplayDoctor.isLoggedInUser
                      ? 'bg-gradient-to-r from-emerald-50 to-blue-50/80 border-emerald-300 shadow-sm'
                      : 'bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm ${
                        activeDisplayDoctor.isLoggedInUser ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                    >
                      {getDoctorInitials(activeDisplayDoctor.name)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {activeDisplayDoctor.name}
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            activeDisplayDoctor.isLoggedInUser
                              ? 'text-emerald-600 fill-emerald-100'
                              : 'text-blue-600 fill-blue-100'
                          }`}
                        />
                        {activeDisplayDoctor.isLoggedInUser && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            You (On-Duty)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeDisplayDoctor.specialization} • {activeDisplayDoctor.qualifications}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Available Now
                    </span>
                  </div>
                </div>

                <div className="py-2 space-y-3 text-left">
                  <div className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Smart Time Slot Selection</h4>
                      <p className="text-[11px] text-slate-500">Pick any available 30-min interval with automated clash prevention.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Instant Digital Prescription</h4>
                      <p className="text-[11px] text-slate-500">Doctors write dosage & advice; patients can download or print PDF anytime.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Medical History Timeline</h4>
                      <p className="text-[11px] text-slate-500">Complete longitudinal health record accessible for future consultations.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/doctors"
                  className="mt-4 block w-full py-3 text-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/15 hover:shadow-lg"
                >
                  Book an Appointment Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Browse by Medical Field</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Top Specializations</h2>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 md:mt-0"
          >
            Explore all doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {specialties.map((item) => (
            <Link
              key={item.name}
              to={`/doctors?specialization=${encodeURIComponent(item.name)}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover-lift hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby Clinics & 24/7 Hospitals Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-7 sm:p-9 text-white text-left border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Healthcare Facilities & Trauma Centers
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Find Nearby Clinics & 24/7 Emergency Hospitals
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Need urgent physical consultation, ICU beds, or specialized diagnostics? Discover nearby hospitals and clinics with real-time GPS distance, OPD hours, contact helplines, and direct doctor appointments.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">✓ 24x7 Ambulance & Emergency</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">✓ In-Clinic & Hospital OPDs</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">✓ Cashless Insurance Accepted</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">✓ Real-Time GPS Directions</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                to="/clinics"
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all text-center flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Locate Nearby Facilities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Top Rated Specialists</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Doctors</h2>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 md:mt-0"
          >
            View all ({featuredDoctors.length}+) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover-lift transition-all text-left shadow-xs hover:border-blue-300"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg border border-blue-100/80">
                        {doc.specialization}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{doc.user?.name || 'Doctor'}</h3>
                      <p className="text-xs text-slate-500 font-medium">{doc.qualifications}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {doc.rating}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
                    {doc.about || 'Dedicated medical practitioner with clinical excellence in patient diagnosis.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-700">{doc.experience} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-emerald-600 text-sm">₹{doc.fees}</span>
                    </div>
                    {/* Timing Badge */}
                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px] mt-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Available at 9:00 AM to 5:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/doctors/${doc._id}`}
                    className="block w-full py-2.5 text-center bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Real-World Solution: Traditional Paper OPD vs MedConnect Platform */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Real Problem Solved
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Why Clinics & Patients Need MedConnect
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Most local clinics and hospitals still rely on fragile paper files. MedConnect bridges the gap for doctors and patients alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Traditional Paper OPD Card */}
          <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Traditional Paper-Based OPD</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              How small hospitals and clinics struggle with manual pen-and-paper record keeping:
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Lost Prescriptions:</strong> Patients frequently misplace slips, making follow-ups blind and risky.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Time-Consuming Lookup:</strong> Doctors spend critical minutes digging through outdated physical files.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Double-Booking & Long Queues:</strong> Manual diary registers cause severe slot clashes and OPD delays.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Handwriting Confusion:</strong> Difficult-to-read dosage instructions risk patient compliance.</span>
              </li>
            </ul>
          </div>

          {/* MedConnect Digital Solution Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/80 border border-blue-200 shadow-md shadow-blue-500/5 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">MedConnect Digital Health OS</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Complete automated modernization engineered for doctors, patients, and administrators:
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-800">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Permanent Health Timeline:</strong> Complete longitudinal patient record accessible securely in 1 click.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero-Collision Smart Slots:</strong> Real-time engine locks reserved intervals to prevent overlapping visits.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Digital PDF Prescriptions:</strong> Standardized dosage & advice with instant print and mobile download.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Integrated Telehealth:</strong> Built-in Jitsi Meet HD video consultation without third-party apps.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works - 4 Steps */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Streamlined Healthcare</span>
          <h2 className="text-3xl font-extrabold text-white mt-1 mb-12">How MedConnect Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 hover-lift transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Find Your Doctor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by specialization, experience, fees, or clinic location to find the perfect specialist.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 hover-lift transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Select Live Slot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick your preferred date and time slot. Our smart engine eliminates double-booking instantly.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 hover-lift transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Consult Patiently</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visit in-clinic or tap to join high-definition video call on Jitsi without installing any software.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 hover-lift transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Digital Prescription</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get a clean digital prescription with medicines, dosage, and advice. Print or save as PDF anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 24/7 Digital OPD & Integrated Healthcare Network Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white text-left shadow-2xl shadow-blue-950/40 border border-blue-800/30">
          {/* Subtle Ambient Background Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Integrated National Healthcare Network</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Immediate Specialist Care & 24/7 Emergency Medical Support
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Connect with board-certified doctors for instant in-clinic OPD or HD teleconsultations. Locate nearby 24/7 emergency clinics, calculate exact GPS distances, and access your encrypted digital health records with zero paperwork.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2.5 font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Rapid Emergency Dial</h4>
                <p className="text-xs text-slate-400">1-click direct connection to National Emergency (112) & Ambulance (102).</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Verified Specialists</h4>
                <p className="text-xs text-slate-400">Cardiology, Dermatology, Pediatrics & General OPD with zero wait times.</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Encrypted Health Vault</h4>
                <p className="text-xs text-slate-400">Downloadable digital prescriptions & lifetime clinical history stored securely.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/doctors"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Book Specialist OPD
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/clinics"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-cyan-300" />
                Nearby Clinics & Hospitals
              </Link>

              <a
                href="tel:112"
                className="px-5 py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all border border-red-500/30 shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Emergency Helpline (112)
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
