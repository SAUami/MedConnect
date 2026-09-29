import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, User, LogOut, Menu, X, Shield, Stethoscope, ChevronRight, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black bg-gradient-to-r from-blue-700 via-blue-800 to-cyan-600 bg-clip-text text-transparent">
                  MedConnect
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  OPD Live
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-bold -mt-0.5">
                Digital Healthcare OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/doctors')
                  ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Find Doctors
            </Link>
            <Link
              to="/clinics"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/clinics')
                  ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>Nearby Clinics & Hospitals</span>
            </Link>

            {isPatient && (
              <Link
                to="/patient-dashboard"
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/patient-dashboard')
                    ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                My Records & OPD
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/doctor-dashboard"
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/doctor-dashboard')
                    ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Doctor Portal
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/admin-dashboard')
                    ? 'text-blue-700 bg-blue-50/90 border border-blue-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Admin Portal
              </Link>
            )}

          </nav>

          {/* User Status / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                      : user.role === 'doctor'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : user.role === 'doctor' ? (
                    <Stethoscope className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  {user.role}
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-xs text-slate-500 leading-tight truncate max-w-[150px]">{user.email || user.phone}</div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/clinics"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-blue-600 hover:bg-blue-50"
          >
            <Building2 className="w-4 h-4 text-cyan-600" />
            Nearby Clinics & Hospitals
          </Link>
          {isPatient && (
            <Link
              to="/patient-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              My Dashboard & Records
            </Link>
          )}
          {isDoctor && (
            <Link
              to="/doctor-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              Doctor Portal
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              Admin Portal
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-sm font-semibold text-slate-800">
                  {user.name} ({user.role})
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
