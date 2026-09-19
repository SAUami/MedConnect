import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Calendar, Stethoscope, SlidersHorizontal, Clock, X } from 'lucide-react';
import api from '../services/api';
import { MEDICAL_SPECIALTY_GROUPS, ALL_SPECIALTIES_FLAT } from '../data/medicalSpecialties';

const primaryPills = [
  'All',
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Neurologist',
  'Gynecologist & Obstetrician',
  'Dentist',
  'ENT Specialist',
  'Ophthalmologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Medical Oncologist',
  'Psychiatrist',
];

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialSpecialization = searchParams.get('specialization') || searchParams.get('specialty') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialization);
  const [maxFee, setMaxFee] = useState(1500);
  const [sortBy, setSortBy] = useState('rating');

  // React to URL query parameter changes (e.g. navigation from footer or header links)
  useEffect(() => {
    const urlSpec = searchParams.get('specialization') || searchParams.get('specialty') || 'All';
    const urlSearch = searchParams.get('search') || '';
    setSelectedSpecialty(urlSpec);
    setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, maxFee]);

  const handleSelectSpecialty = (spec) => {
    setSelectedSpecialty(spec);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (!spec || spec === 'All') {
        p.delete('specialization');
        p.delete('specialty');
      } else {
        p.set('specialization', spec);
      }
      return p;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All');
    setMaxFee(1500);
    setSearchParams({});
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let query = `/doctors?`;
      if (selectedSpecialty && selectedSpecialty !== 'All') {
        query += `specialization=${encodeURIComponent(selectedSpecialty)}&`;
      }
      if (maxFee) {
        query += `maxFees=${maxFee}&`;
      }

      const res = await api.get(query);
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter client-side by search query
  const filteredDoctors = doctors
    .filter((doc) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const docName = doc.user?.name?.toLowerCase() || '';
      const specialty = doc.specialization?.toLowerCase() || '';
      const address = doc.clinicAddress?.toLowerCase() || '';
      return docName.includes(term) || specialty.includes(term) || address.includes(term);
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fees-low') return a.fees - b.fees;
      if (sortBy === 'fees-high') return b.fees - a.fees;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find & Book Top Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse verified healthcare specialists, check availability slots, and book your visit instantly.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Text search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name, specialty, or clinic..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="rating">Top Rated ⭐</option>
              <option value="fees-low">Fee: Low to High</option>
              <option value="fees-high">Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          {/* Max Fee Range */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Max Fee: ₹{maxFee}</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-24 accent-blue-600"
            />
          </div>
        </div>

        {/* Specialization Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full lg:w-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Specialization:
            </span>
            {[
              ...primaryPills,
              ...(selectedSpecialty &&
              selectedSpecialty !== 'All' &&
              !primaryPills.includes(selectedSpecialty)
                ? [selectedSpecialty]
                : []),
            ].map((spec) => (
              <button
                key={spec}
                onClick={() => handleSelectSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Comprehensive Dropdown for All 35+ Specialties */}
          <div className="shrink-0 w-full lg:w-auto">
            <select
              value={selectedSpecialty}
              onChange={(e) => handleSelectSpecialty(e.target.value)}
              className="w-full lg:w-auto py-1.5 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Specialties ({ALL_SPECIALTIES_FLAT.length}+ Fields)</option>
              {MEDICAL_SPECIALTY_GROUPS.map((group) => (
                <optgroup key={group.category} label={`── ${group.category} ──`}>
                  {group.specialties.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
          </span>
          {selectedSpecialty && selectedSpecialty !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full animate-fade-in">
              Specialty: {selectedSpecialty}
              <button
                onClick={() => handleSelectSpecialty('All')}
                className="hover:bg-blue-200 rounded-full p-0.5 text-blue-600 hover:text-blue-900 transition-colors"
                title="Clear specialty filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Doctors Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords, increasing max fee, or clearing the specialization filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover-lift transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg">
                      {doc.specialization}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-2">{doc.user?.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{doc.qualifications}</p>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {doc.rating}
                    <span className="text-[10px] text-slate-400 font-normal">({doc.totalReviews})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
                  {doc.about || 'Dedicated specialist offering compassionate patient treatment and modern clinical care.'}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.clinicAddress}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-semibold text-slate-800">{doc.experience} Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-emerald-600 text-base">₹{doc.fees}</span>
                  </div>

                  {/* Consultation Timings */}
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-bold text-xs mt-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Available at 9:00 AM to 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={`/doctors/${doc._id}`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
