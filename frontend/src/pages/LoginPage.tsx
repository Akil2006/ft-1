import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, BarChart2 } from 'lucide-react';
import { authApi } from '../services/auth';
import { PackageInspectionIllustration, LegalRuleBooksIllustration } from '../components/BrandingAssets';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.login({ email, password });
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white/80 backdrop-blur-md border border-sand-300 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* LEFT PANEL: Inspection Environment Illustration & Badges */}
        <div className="lg:col-span-6 bg-gradient-to-br from-ivory-100 via-sand-100 to-sage-100 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sand-300/80 relative">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-forest-100 text-forest-800 text-xs font-semibold rounded-full border border-forest-200">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>Legal Metrology Inspection Portal</span>
            </div>

            <h2 className="text-3xl font-bold font-serif text-slate-900 leading-tight">
              Compliant Packs Build Fair Markets
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Scan commodity label declarations, run multi-engine OCR fallback, and verify evidence against statutory Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            {/* Product & Book Illustration Stack */}
            <div className="py-4 space-y-4">
              <PackageInspectionIllustration className="max-w-xs mx-auto shadow-md" />
              <LegalRuleBooksIllustration className="max-w-xs mx-auto" />
            </div>
          </div>

          {/* Side Inspection Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sand-300/60 text-center">
            <div className="p-2 bg-white/70 rounded-xl border border-sand-200">
              <ShieldCheck className="w-4 h-4 text-forest-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-800">Authorized</p>
              <p className="text-[9px] text-slate-500">Inspections Only</p>
            </div>
            <div className="p-2 bg-white/70 rounded-xl border border-sand-200">
              <BarChart2 className="w-4 h-4 text-forest-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-800">Data-Driven</p>
              <p className="text-[9px] text-slate-500">Compliance</p>
            </div>
            <div className="p-2 bg-white/70 rounded-xl border border-sand-200">
              <CheckCircle2 className="w-4 h-4 text-forest-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-800">Tamper-Evident</p>
              <p className="text-[9px] text-slate-500">SHA-256 Hash</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Inspector Sign In Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-white">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto shadow-xs border border-forest-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Inspector Sign In</h3>
            <p className="text-xs text-slate-500">Access SmartPack Legal Metrology Inspection Portal</p>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-sand-300 text-forest-700 focus:ring-forest-600" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-forest-700 hover:text-forest-800 font-semibold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-forest-900/20 flex items-center justify-center gap-2 transition-all text-xs tracking-wide uppercase mt-4"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-sand-200">
            <p className="text-xs text-slate-500">
              Don't have an inspector account?{' '}
              <Link to="/register" className="text-forest-700 font-bold hover:underline ml-1">
                Register here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
