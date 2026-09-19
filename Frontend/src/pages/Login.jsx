import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  User,
  Stethoscope,
  Shield,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const rolePresets = {
  patient: {
    title: 'Patient Portal',
    subtitle: 'Sign in to book visits, join video calls, and access health records',
    icon: User,
    color: 'emerald',
    demoEmail: 'rahul@gmail.com',
    demoPass: 'password123',
    demoPhone: '9888811111',
    demoLabel: 'Rahul Sharma (Patient)',
  },
  doctor: {
    title: 'Doctor Portal',
    subtitle: 'Sign in to manage patient queue and write digital prescriptions',
    icon: Stethoscope,
    color: 'blue',
    demoEmail: 'dr.rajesh@medconnect.com',
    demoPass: 'doctor123',
    demoPhone: '9876543210',
    demoLabel: 'Dr. Rajesh Sharma (Doctor)',
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Sign in to access platform analytics and doctor management',
    icon: Shield,
    color: 'purple',
    demoEmail: 'admin@medconnect.com',
    demoPass: 'admin123',
    demoPhone: '9000000000',
    demoLabel: 'System Admin',
  },
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const redirectUrl = searchParams.get('redirect');

  const initialRole = (roleParam && rolePresets[roleParam])
    ? roleParam
    : (redirectUrl?.includes('admin') ? 'admin' : (redirectUrl?.includes('doctor') ? 'doctor' : 'patient'));

  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Direct Password Credentials (Email or Mobile Number)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Password Reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Sync role if query parameter changes
  useEffect(() => {
    const r = searchParams.get('role');
    if (r && rolePresets[r]) {
      setSelectedRole(r);
    }
  }, [searchParams]);

  const activePreset = rolePresets[selectedRole];
  const IconComponent = activePreset.icon;

  const redirectAfterLogin = (user) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    if (user.role === 'admin') navigate('/admin-dashboard');
    else if (user.role === 'doctor') navigate('/doctor-dashboard');
    else navigate('/patient-dashboard');
  };

  // Direct Password Sign In Handler (Email or Phone Number)
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    const cleanId = identifier.trim();
    if (!cleanId || !password.trim()) {
      setError('Please enter your email or mobile number, and your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(cleanId, password);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please check your email/mobile and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Direct Password Reset (No OTP required)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    const cleanId = identifier.trim();
    if (!cleanId || !newPassword.trim()) {
      setError('Please enter your email or phone number, and a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(cleanId, newPassword);
      if (res.user) {
        setSuccessNotice(`Password updated successfully! Redirecting...`);
        setTimeout(() => {
          redirectAfterLogin(res.user);
        }, 1000);
      } else {
        setIsResetMode(false);
        setPassword(newPassword);
        setSuccessNotice('Password reset successfully! You can now sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No registered account found with this email/phone.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill Helper
  const handleApplyDemo = () => {
    setIdentifier(activePreset.demoEmail);
    setPassword(activePreset.demoPass);
    setError('');
    setSuccessNotice(`Loaded ${activePreset.demoLabel} credentials!`);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-left animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25">
            <Activity className="w-6 h-6 animate-heartbeat" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isResetMode ? 'Reset Your Password' : activePreset.title}
          </h1>
          <p className="text-xs text-slate-500">
            {isResetMode
              ? 'Enter your registered email or phone and set a new password'
              : activePreset.subtitle}
          </p>
        </div>

        {/* Role Selector Tabs (Patient, Doctor, Admin) */}
        {!isResetMode && (
          <div className="grid grid-cols-3 p-1 bg-slate-200/90 rounded-2xl gap-1 text-xs font-bold shadow-inner">
            {Object.keys(rolePresets).map((roleKey) => {
              const roleInfo = rolePresets[roleKey];
              const RoleIcon = roleInfo.icon;
              const isSelected = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => {
                    setSelectedRole(roleKey);
                    setIdentifier('');
                    setPassword('');
                    setError('');
                    setSuccessNotice('');
                  }}
                  className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 capitalize ${
                    isSelected
                      ? roleKey === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : roleKey === 'doctor'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{roleKey}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {!isResetMode ? (
            /* ============================================================ */
            /* PURE PASSWORD SIGN IN FORM (EMAIL OR PHONE + PASSWORD)      */
            /* ============================================================ */
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address or Mobile Number *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rahul@gmail.com or 9888811111"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError('');
                      setSuccessNotice('');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Demo Auto-fill Helper (Admin Console Only - Removed for Patient and Doctor) */}
              {selectedRole === 'admin' && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Need Test ID?
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyDemo}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Auto-fill {activePreset.demoLabel}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:bg-slate-300 ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    : selectedRole === 'doctor'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as {selectedRole.toUpperCase()}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ============================================================ */
            /* DIRECT FORGOT / RESET PASSWORD FORM (NO OTP REQUIRED)       */
            /* ============================================================ */
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                Enter your registered email or phone number and choose a new password. No OTP required.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registered Email or Mobile *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Create New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                  setSuccessNotice('');
                }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 pt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          )}

          {/* Registration link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
