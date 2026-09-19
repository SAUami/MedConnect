import React from 'react';
import { Activity, Phone, Mail, MapPin, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOP_FOOTER_SPECIALTIES } from '../data/medicalSpecialties';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">MedConnect</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Modernizing clinic workflows and patient record keeping. Book verified specialists, receive digital prescriptions, and access your complete health history anytime.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-200 tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/clinics" className="hover:text-white transition-colors text-cyan-400">
                  Nearby Clinics & Hospitals
                </Link>
              </li>
              <li>
                <Link to="/login?role=patient" className="hover:text-white transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=doctor" className="hover:text-white transition-colors">
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1.5">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Specialties */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-200 tracking-wider mb-4 flex items-center justify-between">
              <span>Top Specialties</span>
              <span className="text-[10px] font-normal text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">Tap to Book</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              {TOP_FOOTER_SPECIALTIES.map((spec) => (
                <li key={spec.name}>
                  <Link
                    to={`/doctors?specialization=${encodeURIComponent(spec.query)}`}
                    className="text-slate-400 hover:text-cyan-300 hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                    <span>{spec.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  to="/doctors"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                >
                  View All Specialists →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency / Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-200 tracking-wider mb-4">24/7 Helpline</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+91 1800-123-4567 (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>support@medconnect.org</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>National Health Network, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} MedConnect System. All rights reserved.</div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Healthcare Digitalization
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
