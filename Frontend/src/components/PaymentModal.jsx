import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle,
} from 'lucide-react';

const PaymentModal = ({ doctor, date, timeSlot, onClose, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cash'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successStep, setSuccessStep] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardHolder, setCardHolder] = useState('RAHUL SHARMA');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const amount = doctor?.fees || 500;

  const handleProcessPayment = (method) => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessStep(true);

      const isCash = method === 'cash';
      const txnId = isCash
        ? `CASH-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
        : `TXN-MED-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: method,
          paymentStatus: isCash ? 'pending' : 'paid',
          amount,
          transactionId: txnId,
        });
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-left my-6 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Healthcare Checkout
          </div>
          <h2 className="text-xl font-black">Confirm Consultation Payment</h2>

          <div className="mt-4 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div>
              <div className="text-xs text-blue-100">Consultation with</div>
              <div className="font-bold text-sm text-white">{doctor?.user?.name}</div>
              <div className="text-[11px] text-blue-200">{doctor?.specialization} • {date} at {timeSlot}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-blue-200 uppercase font-semibold">Total Fee</div>
              <div className="text-2xl font-black text-emerald-300">₹{amount}</div>
            </div>
          </div>
        </div>

        {/* Success animation step */}
        {successStep ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Processed Successfully!</h3>
            <p className="text-xs text-slate-500">
              Securing appointment slot and creating instant consultation pass...
            </p>
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        ) : (
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-4 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-700 font-bold shadow-xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-[11px]">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-700 font-bold shadow-xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[11px]">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-700 font-bold shadow-xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="text-[11px]">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cash')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cash'
                    ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-700 font-bold shadow-xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[11px]">Pay at Clinic</span>
              </button>
            </div>

            {/* TAB 1: UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  {/* QR code SVG */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-300 shrink-0 shadow-xs">
                    <svg className="w-28 h-28" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#0f172a" />
                      <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#0f172a" />
                      <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#0f172a" />
                      <circle cx="50" cy="50" r="12" fill="#2563eb" />
                      <path d="M47,44 L53,44 L53,56 L47,56 Z M44,47 L56,47 L56,53 L44,53 Z" fill="white" />
                      <rect x="45" y="15" width="8" height="8" fill="#0f172a" />
                      <rect x="75" y="45" width="10" height="10" fill="#0f172a" />
                      <rect x="50" y="70" width="8" height="16" fill="#0f172a" />
                      <rect x="70" y="70" width="15" height="15" fill="#0f172a" />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 text-sm">Scan to Pay via Any UPI App</div>
                    <p className="text-[11px] text-slate-500">
                      Scan QR using Google Pay, PhonePe, Paytm, BHIM, or your bank UPI app.
                    </p>
                    <div className="inline-block font-mono text-[10px] bg-slate-200/70 px-2 py-0.5 rounded text-slate-700">
                      medconnect.health@upi
                    </div>
                  </div>
                </div>

                {/* UPI Apps selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                    Or select Instant UPI App
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay', color: 'text-blue-600' },
                      { id: 'phonepe', name: 'PhonePe', color: 'text-purple-600' },
                      { id: 'paytm', name: 'Paytm', color: 'text-sky-600' },
                      { id: 'bhim', name: 'BHIM UPI', color: 'text-emerald-600' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                          selectedApp === app.id
                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`block font-extrabold ${app.color}`}>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enter UPI ID */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Enter UPI ID (VPA)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment('upi')}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authorizing UPI Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Pay ₹{amount} via UPI
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARD */}
            {activeTab === 'card' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8891"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="As printed on card"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supports Visa, Mastercard, RuPay, Maestro</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment('card')}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Contacting Card Network...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{amount} Securely
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'HDFC Bank',
                      'State Bank of India',
                      'ICICI Bank',
                      'Axis Bank',
                      'Kotak Mahindra',
                      'Punjab National Bank',
                    ].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          selectedBank === b
                            ? 'border-blue-600 bg-blue-50 font-bold text-blue-900 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment('netbanking')}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Redirecting to {selectedBank}...
                    </>
                  ) : (
                    <>
                      <Building className="w-4 h-4" />
                      Pay ₹{amount} via {selectedBank}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 4: PAY AT CLINIC (CASH) */}
            {activeTab === 'cash' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    Pay at Hospital / Clinic Counter
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    You do not need to pay online right now. Your appointment will be confirmed immediately, and you can pay the consultation fee of <span className="font-bold">₹{amount}</span> directly at the reception counter before meeting the doctor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment('cash')}
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Booking & Pay ₹{amount} at Clinic
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
