import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, AlertCircle, ArrowRight, CheckSquare, Search } from 'lucide-react';
import { authApi } from '../services/auth';
import {
  SmartPackLogo,
  LegalRuleBooksIllustration,
  FairTradeStamp,
  BotanicalLeafAccent,
} from '../components/BrandingAssets';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAlreadyRegistered(false);
    setLoading(true);

    try {
      // 1. Register new user
      await authApi.register({ name, email, password });

      // 2. Auto-login immediately for seamless user onboarding
      try {
        await authApi.login({ email, password });
        if (onRegisterSuccess) onRegisterSuccess();
        navigate('/dashboard');
        return;
      } catch (loginErr) {
        // If registration succeeded but auto-login failed, navigate to login page with prefilled email
        navigate('/login', { state: { email } });
        return;
      }
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      let msg = 'Registration failed. Please check your details and try again.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }

      if (status === 409 || msg.toLowerCase().includes('already exists')) {
        setIsAlreadyRegistered(true);
        setError(`An inspector account for "${email}" is already registered. Click below to sign in directly!`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const checklistItems = [
    'MRP',
    'Net Quantity',
    'Manufacturing Date',
    'Manufacturer Details',
    'Country of Origin',
    'Consumer Care',
  ];

  return (
    <div className="max-w-7xl mx-auto py-4 font-sans relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[620px]">
        {/* LEFT COLUMN: Legal Metrology Inspection Desk Environment */}
        <div className="lg:col-span-6 space-y-6 relative">
          {/* Logo & Motto */}
          <div className="flex items-center justify-between">
            <SmartPackLogo />
            <div className="text-right">
              <p className="font-handwriting text-xl font-bold text-[#14532D]">
                Compliant Packs Build Fair Markets.
              </p>
              <div className="w-28 h-1 bg-amber-400 rounded-full ml-auto" />
            </div>
          </div>

          {/* Central Desk Scene: Pouch with Magnifying Glass Zoom & Extracted Snippets */}
          <div className="relative bg-gradient-to-br from-amber-50/60 via-ivory-100 to-sand-100 p-6 rounded-3xl border border-sand-300 shadow-md my-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Left Notepad Checklist Tape Note */}
              <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-sand-300 shadow-sm space-y-2 transform -rotate-1 relative">
                <div className="w-12 h-3 bg-amber-200/80 rounded mx-auto -mt-6 opacity-70 shadow-2xs" />
                <p className="font-bold text-xs text-slate-800 border-b border-sand-200 pb-1 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Inspection Checklist</span>
                </p>
                <div className="space-y-1.5 text-xs font-sans text-slate-700">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[#14532D] font-bold">☑</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Label Magnifying Glass Zoomed Card */}
              <div className="relative bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OCR Magnifier</span>
                  <Search className="w-4 h-4 text-[#14532D]" />
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-800 bg-sand-50 p-2.5 rounded-lg border border-sand-200">
                  <p><strong className="text-slate-600">Net Quantity :</strong> <span className="font-bold text-[#14532D]">100 g</span></p>
                  <p><strong className="text-slate-600">MRP :</strong> <span className="font-bold text-[#14532D]">₹ 40.00</span> (Incl. of all taxes)</p>
                  <p><strong className="text-slate-600">Mfg. Date :</strong> 12/09/2026</p>
                  <p><strong className="text-slate-600">Best Before :</strong> 11/03/2027</p>
                </div>
                <div className="text-center pt-1">
                  <span className="font-mono text-[9px] tracking-widest text-slate-500">||| |||| || ||| |||| 8 906123 456789</span>
                </div>
              </div>
            </div>

            {/* Top Tape Note on Pouch */}
            <div className="absolute top-2 right-4 bg-[#FEF3C7] border border-[#FDE68A] p-2 rounded-xl text-[10px] font-handwriting font-bold text-amber-900 shadow-xs transform rotate-2">
              <p>Scan / Read Labels</p>
              <p>Check Declarations</p>
              <p>Ensure Compliance</p>
            </div>
          </div>

          {/* Bottom Desk Equipment: Books + Weighing Scale + Sticky Note + Fair Trade Stamp */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-6 space-y-3">
              <LegalRuleBooksIllustration className="w-full h-32" />
            </div>

            <div className="sm:col-span-6 flex items-center justify-between gap-2">
              {/* Sticky Note */}
              <div className="bg-[#FEF9C3] p-3 rounded-xl border border-[#FDE047] text-xs font-handwriting text-amber-950 shadow-xs max-w-[150px] transform -rotate-2">
                "Accurate labels. Informed consumers. Stronger markets."
              </div>

              {/* Fair Trade Stamp */}
              <FairTradeStamp className="w-20 h-20 shrink-0" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Create Your Inspector Account Form */}
        <div className="lg:col-span-6 space-y-6 relative">
          {/* Top Right Hand-written Annotation */}
          <div className="flex justify-end items-center gap-1.5 text-xs text-slate-600 font-handwriting font-bold">
            <span>Secure Inspection workspace</span>
            <Lock className="w-3.5 h-3.5 text-slate-700" />
          </div>

          {/* Mandatory Preliminary Screening Notice */}
          <DisclaimerBanner />

          {/* Main Registration Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xl space-y-6 relative">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#14532D] font-sans">
                JOIN SMARTPACK
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Create Your Inspector Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-sans">
                Register for SmartPack Legal Metrology Screening System to start inspecting packaged products.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                {isAlreadyRegistered && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { email } })}
                      className="bg-[#14532D] hover:bg-[#0F392B] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Sign In with {email}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FULL NAME */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-700 uppercase font-sans mb-1.5">
                  FULL NAME
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Inspector Rajesh Kumar"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-700 uppercase font-sans mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harini@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-700 uppercase font-sans mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F392B] hover:bg-[#16503d] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#0d3125] cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register Inspector Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Already registered footer */}
            <div className="text-center pt-3 border-t border-sand-200/80">
              <p className="text-xs text-slate-600 font-sans">
                Already registered?{' '}
                <Link to="/login" className="text-[#14532D] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Screen Edge Botanical Leaf Accent */}
      <BotanicalLeafAccent className="hidden xl:block absolute top-10 -right-8 w-40 h-80 text-[#14532D] opacity-40 pointer-events-none" />
    </div>
  );
};
