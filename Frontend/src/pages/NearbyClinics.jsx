import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Navigation,
  ArrowRight,
  Filter,
  Ambulance,
  HeartPulse,
} from 'lucide-react';
import api from '../services/api';
import {
  INDIA_STATES_AND_DISTRICTS,
  STATE_CENTROIDS,
  DISTRICT_CENTROIDS,
  PAN_INDIA_HOSPITALS,
  calculateDistance,
  createDistrictCivilHospital,
} from '../data/indiaHealthcareData';

const NearbyClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [locating, setLocating] = useState(false);

  // Fetch when filters or coordinates change
  useEffect(() => {
    fetchClinics();
  }, [selectedState, selectedDistrict, selectedType, emergencyOnly, userCoords]);

  // Handle State Selection (Reset District when State changes)
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedDistrict('All');
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);
      let query = `/clinics?`;
      if (selectedState && selectedState !== 'All') {
        query += `state=${encodeURIComponent(selectedState)}&`;
      }
      if (selectedDistrict && selectedDistrict !== 'All') {
        query += `district=${encodeURIComponent(selectedDistrict)}&`;
      }
      if (selectedType && selectedType !== 'All') {
        query += `type=${encodeURIComponent(selectedType)}&`;
      }
      if (emergencyOnly) {
        query += `emergency=true&`;
      }
      if (userCoords) {
        query += `userLat=${userCoords.lat}&userLng=${userCoords.lng}&`;
      }

      const res = await api.get(query);
      if (Array.isArray(res.data) && res.data.length > 0) {
        // STRICT STATE VALIDATION: Discard any cross-state pollution
        let validData = res.data;
        if (selectedState && selectedState !== 'All') {
          const expectedState = selectedState.toLowerCase().trim();
          validData = validData.filter(
            (c) => c.state && c.state.toLowerCase().trim() === expectedState
          );
        }

        if (selectedDistrict && selectedDistrict !== 'All') {
          const expectedDist = selectedDistrict.toLowerCase().trim();
          const distMatches = validData.filter(
            (c) =>
              (c.district && c.district.toLowerCase().includes(expectedDist)) ||
              (c.city && c.city.toLowerCase().includes(expectedDist))
          );
          if (distMatches.length > 0) {
            validData = distMatches;
          } else if (selectedState !== 'All') {
            // If no specific private hospital in this district, synthesize the District Civil Hospital
            const civilHosp = createDistrictCivilHospital(selectedState, selectedDistrict);
            validData = [civilHosp, ...validData];
          }
        }

        if (validData.length > 0) {
          setClinics(validData);
          return;
        }
      }
      applyFallbackFilters();
    } catch (err) {
      console.warn('Clinics API route fallback active:', err.message);
      applyFallbackFilters();
    } finally {
      setLoading(false);
    }
  };

  const applyFallbackFilters = () => {
    let list = [...PAN_INDIA_HOSPITALS];

    // Reference point: user GPS coordinates, or selected district centroid
    let refPoint = null;
    let refType = null;

    if (userCoords) {
      refPoint = userCoords;
      refType = 'gps';
    } else if (selectedDistrict && selectedDistrict !== 'All') {
      refPoint = DISTRICT_CENTROIDS[selectedDistrict] || (selectedState !== 'All' ? STATE_CENTROIDS[selectedState] : null);
      refType = 'district';
    }

    // 1. STRICT STATE FILTERING: Never allow any hospital from another state!
    if (selectedState && selectedState !== 'All') {
      const st = selectedState.toLowerCase().trim();
      list = list.filter((c) => c.state && c.state.toLowerCase().trim() === st);
    }

    // 2. Calculate approximate distance relative to reference point
    if (refPoint) {
      list = list.map((c) => {
        const dist = calculateDistance(
          refPoint.lat,
          refPoint.lng,
          c.coordinates.lat,
          c.coordinates.lng
        );
        return { ...c, distanceKm: dist, distanceSource: refType };
      });
    }

    // 3. Apply District Filter
    if (selectedDistrict && selectedDistrict !== 'All') {
      const dt = selectedDistrict.toLowerCase().trim();
      const exactMatches = list.filter(
        (c) =>
          (c.district && c.district.toLowerCase().includes(dt)) ||
          (c.city && c.city.toLowerCase().includes(dt))
      );

      if (exactMatches.length > 0) {
        list = exactMatches;
      } else if (selectedState && selectedState !== 'All') {
        // District civil hospital synthesized entry for that district
        const civilHosp = createDistrictCivilHospital(selectedState, selectedDistrict);
        list = [civilHosp, ...list];
      }
    }

    // 4. Apply Facility Type Filter
    if (selectedType && selectedType !== 'All') {
      list = list.filter((c) => c.type.toLowerCase() === selectedType.toLowerCase());
    }

    // 5. Apply Emergency Filter
    if (emergencyOnly) {
      list = list.filter((c) => c.emergency24x7 === true);
    }

    // 6. Sort by distance if calculated, otherwise by rating
    list.sort((a, b) => {
      if (a.distanceKm !== null && a.distanceKm !== undefined && b.distanceKm !== null && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });

    setClinics(list);
  };

  // Detect User Location via Browser GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('GPS location detected! Sorted by nearest facility.');
        setLocating(false);
      },
      (error) => {
        // Fallback default coordinates (Delhi NCR) if user blocks location
        setUserCoords({ lat: 28.6139, lng: 77.209 });
        setLocationStatus('Location access denied. Using Central Delhi default.');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Client-side text search filter
  const filteredClinics = clinics.filter((clinic) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      clinic.name.toLowerCase().includes(q) ||
      clinic.address.toLowerCase().includes(q) ||
      (clinic.area && clinic.area.toLowerCase().includes(q)) ||
      (clinic.district && clinic.district.toLowerCase().includes(q)) ||
      (clinic.state && clinic.state.toLowerCase().includes(q)) ||
      (clinic.city && clinic.city.toLowerCase().includes(q)) ||
      clinic.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  const availableDistricts =
    selectedState !== 'All' ? INDIA_STATES_AND_DISTRICTS[selectedState] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Pan-India Healthcare Directory & Emergency Facilities
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find Nearby Clinics & Hospitals
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Select any <strong>State</strong> and <strong>District</strong> in India to discover nearest verified hospitals, 24/7 trauma emergency care, and multi-speciality clinics.
          </p>
        </div>

        {/* GPS Detect Location Button */}
        <div>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:bg-slate-300"
          >
            <Crosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Detect My Location (GPS)'}</span>
          </button>
          {locationStatus && (
            <div className="text-[11px] text-slate-500 mt-1.5 text-right font-medium">
              {locationStatus}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Quick Helpline Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-rose-500/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 text-white animate-heartbeat" />
          </div>
          <div>
            <h3 className="text-sm font-bold">In Case of Medical Emergency?</h3>
            <p className="text-xs text-rose-100">
              National Emergency & Ambulance Helpline: Dial <strong>102 / 108</strong> or tap any hospital's emergency line below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmergencyOnly(true);
            setSelectedType('Hospital');
          }}
          className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-sm hover:bg-rose-50 shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          Show 24/7 Emergency Hospitals
        </button>
      </div>

      {/* Cascading State & District Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search by Facility or Specialty
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Hospital name, area, doctor specialty..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* State / UT Selector */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select State / UT
            </label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All States (Pan-India)</option>
              {Object.keys(INDIA_STATES_AND_DISTRICTS)
                .sort()
                .map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
            </select>
          </div>

          {/* District Selector (Cascading) */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select District / City
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'All'}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="All">
                {selectedState === 'All'
                  ? 'All Districts (Select State First)'
                  : `All Districts in ${selectedState}`}
              </option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Type Filter */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Types</option>
              <option value="Hospital">Hospitals (Trauma/IPD)</option>
              <option value="Clinic">OPD Clinics</option>
            </select>
          </div>
        </div>

        {/* Filter Controls & Direct External Map Trigger */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 24/7 Emergency Toggle Button */}
            <button
              type="button"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                emergencyOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Ambulance className="w-4 h-4 text-rose-600" />
              <span>{emergencyOnly ? '24/7 Emergency Active' : 'Filter 24/7 Emergency'}</span>
            </button>

            {/* Reset Filters */}
            {(selectedState !== 'All' ||
              selectedDistrict !== 'All' ||
              selectedType !== 'All' ||
              emergencyOnly ||
              searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedState('All');
                  setSelectedDistrict('All');
                  setSelectedType('All');
                  setEmergencyOnly(false);
                  setSearchTerm('');
                }}
                className="py-1.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Search on Google Maps shortcut for selected district */}
          {selectedDistrict !== 'All' ? (
            <a
              href={`https://www.google.com/maps/search/hospitals+and+clinics+in+${encodeURIComponent(
                `${selectedDistrict} ${selectedState}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Explore All Clinics in {selectedDistrict} on Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : selectedState !== 'All' ? (
            <span className="text-xs text-slate-500 font-medium">
              Showing medical institutions in <strong>{selectedState}</strong>
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              Showing top verified institutions across <strong>India</strong>
            </span>
          )}
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No medical facilities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, choosing another district, or resetting the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
              setEmergencyOnly(false);
              setSelectedState('All');
              setSelectedDistrict('All');
            }}
            className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between hover-lift transition-all shadow-xs hover:border-blue-300"
            >
              <div className="space-y-4">
                {/* Header: Badges & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-lg ${
                          clinic.type === 'Hospital'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {clinic.type}
                      </span>
                      {clinic.emergency24x7 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          24/7 Emergency
                        </span>
                      )}
                      {clinic.badge && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 rounded-md">
                          {clinic.badge}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1.5">
                      {clinic.name}
                    </h2>
                    <p className="text-xs text-slate-500">{clinic.tagline}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70 shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-700">{clinic.rating}</span>
                    <span className="text-[10px] text-slate-400">({clinic.reviewsCount})</span>
                  </div>
                </div>

                {/* Distance & Address */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{clinic.address}</span>
                      <span className="text-slate-500">
                        {' '}
                        ({clinic.district || clinic.city}, {clinic.state})
                      </span>
                    </div>
                  </div>

                  {clinic.distanceKm !== null && clinic.distanceKm !== undefined && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-blue-700 font-bold">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {clinic.distanceKm === 0
                          ? `Located directly in ${clinic.district || clinic.city}`
                          : `Approximately ${clinic.distanceKm} km away ${
                              clinic.distanceSource === 'gps'
                                ? '(from your GPS location)'
                                : clinic.distanceSource === 'district'
                                ? `(from ${selectedDistrict} center)`
                                : ''
                            }`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timings & Helpline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{clinic.opdTimings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a
                      href={`tel:${clinic.contactPhone}`}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      {clinic.contactPhone}
                    </a>
                  </div>
                </div>

                {/* Key Facilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {clinic.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600"
                    >
                      ✓ {fac}
                    </span>
                  ))}
                </div>

                {/* Associated Verified Doctors */}
                {clinic.availableDoctors && clinic.availableDoctors.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Available Doctors At This Facility:
                    </span>
                    <div className="space-y-2">
                      {clinic.availableDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            <div>
                              <span className="font-bold text-slate-800">{doc.name}</span>
                              <span className="text-slate-500 text-[11px]">
                                {' '}
                                ({doc.specialization})
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/doctors/${doc.id}`}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                          >
                            Book Slot
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                {/* Google Maps Directions */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${clinic.name} ${clinic.address} ${clinic.city || clinic.district} ${clinic.state}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  Get Directions
                </a>

                {/* Emergency / Contact Call */}
                <a
                  href={`tel:${clinic.emergency24x7 ? clinic.emergencyPhone : clinic.contactPhone}`}
                  className="py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Facility
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyClinics;
