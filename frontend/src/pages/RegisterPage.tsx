import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import { authApi } from '../services/auth';
import { PackageInspectionIllustration, LegalRuleBooksIllustration, FairTradeStamp } from '../components/BrandingAssets';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.register({ name, email, password });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Email might be in use.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const statutoryDeclarations = [
    'MRP (Maximum Retail Price)',
    'Net Quantity & Unit Verification',
    'Month & Year of Manufacture / Packing',
    'Manufacturer / Packer / Importer Details',
    'Country of Origin (For Imported Commodities)',
    'Consumer Care Contact & Address',
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white/80 backdrop-blur-md border border-sand-300 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* LEFT PANEL: Inspection Checklist & Environment Graphic */}
        <div className="lg:col-span-6 bg-gradient-to-br from-ivory-100 via-sand-100 to-sage-100 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sand-300/80 relative">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-forest-100 text-forest-800 text-xs font-semibold rounded-full border border-forest-200">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>JOIN SMARTPACK INSPECTION PORTAL</span>
            </div>

            <h2 className="text-3xl font-bold font-serif text-slate-900 leading-tight">
              Screen Packaging against Statutory Metrology Rules
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Register an authorized inspector workspace to process packaged commodities, execute automated rule screening, and generate tamper-evident evidence reports.
            </p>

            {/* Checklist Box */}
            <div className="bg-white/90 rounded-2xl p-4 border border-sand-300 shadow-xs space-y-2.5 my-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans border-b border-sand-200 pb-1.5">
                Statutory Inspection Scope:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {statutoryDeclarations.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphic Illustration */}
            <div className="flex items-center justify-between pt-2">
              <PackageInspectionIllustration className="w-44 shadow-sm" />
              <FairTradeStamp className="w-20 h-20 shadow-2xs" />
            </div>
          </div>

          <div className="pt-4 border-t border-sand-300/60">
            <LegalRuleBooksIllustration className="w-full" />
          </div>
        </div>

        {/* RIGHT PANEL: Create Inspector Account Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-white">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto shadow-xs border border-forest-200">
              <UserIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Create Your Inspector Account</h3>
            <p className="text-xs text-slate-500">Register for SmartPack Legal Metrology Screening System</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Inspector Rajesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="harini@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-forest-900/20 flex items-center justify-center gap-2 transition-all text-xs tracking-wide uppercase mt-4"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Register Inspector Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-sand-200">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-forest-700 font-bold hover:underline ml-1">
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
