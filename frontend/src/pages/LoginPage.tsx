import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  BarChart2,
  Barcode,
  CheckSquare,
  Scale,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authApi } from '../services/auth';
import {
  LegalRuleBooksIllustration,
  BotanicalLeafAccent,
  FarmBitePotatoChipsPouchIllustration,
  StorefrontSketchIllustration,
} from '../components/BrandingAssets';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as any)?.email;

  const [email, setEmail] = useState(stateEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="max-w-7xl mx-auto py-4 font-sans relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[600px]">
        {/* LEFT COLUMN: Visual Inspection Scene with FarmBite Pouch & Rulebooks */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between h-full relative">
          {/* Top Handwritten Tagline */}
          <div className="space-y-1">
            <p className="font-handwriting text-2xl font-bold text-[#14532D]">
              Compliant Packs Build Fair Markets
            </p>
            <div className="w-32 h-1.5 bg-amber-400 rounded-full opacity-80 transform -rotate-1" />
          </div>

          {/* FarmBite Potato Chips Pouch with Floating Feature Tags */}
          <div className="relative my-4 flex items-center justify-center">
            <FarmBitePotatoChipsPouchIllustration className="w-56 h-72 drop-shadow-xl" />

            {/* Tag 1: Top Barcode Scan Tag */}
            <div className="absolute -top-3 left-0 bg-white/95 backdrop-blur-xs border border-sand-300 rounded-2xl p-2.5 shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-800">
              <Barcode className="w-4 h-4 text-slate-700 shrink-0" />
              <div>
                <p>Scan Products</p>
                <p className="text-[9px] text-slate-500 font-normal">with AI OCR</p>
              </div>
            </div>

            {/* Tag 2: Left Checklist Tag */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white/95 backdrop-blur-xs border border-sand-300 rounded-2xl p-2.5 shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-800">
              <CheckSquare className="w-4 h-4 text-slate-700 shrink-0" />
              <div>
                <p>Check Declarations</p>
                <p className="text-[9px] text-slate-500 font-normal">Verify Legal Metrology Rules</p>
              </div>
            </div>

            {/* Tag 3: Right Compliance Tag */}
            <div className="absolute bottom-2 -right-4 bg-white/95 backdrop-blur-xs border border-sand-300 rounded-2xl p-2.5 shadow-md flex items-center gap-2 text-[10px] font-bold text-slate-800">
              <Scale className="w-4 h-4 text-slate-700 shrink-0" />
              <div>
                <p>Ensure Compliance</p>
                <p className="text-[9px] text-slate-500 font-normal">Support Fair Markets</p>
              </div>
            </div>
          </div>

          {/* Legal Rulebooks Graphic at Desk Bottom */}
          <div className="pt-2">
            <LegalRuleBooksIllustration className="w-56 h-32" />
          </div>
        </div>

        {/* CENTER COLUMN: Inspector Sign In White Form Card */}
        <div className="lg:col-span-4 z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xl space-y-6 relative overflow-hidden max-w-md w-full mx-auto">
            {/* Top Right Botanical Leaf Accent */}
            <BotanicalLeafAccent className="absolute -top-3 -right-3 w-20 h-20 text-[#14532D]/80 opacity-60 pointer-events-none" />

            {/* Header Icon Badge */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center mx-auto text-[#14532D] shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#14532D]" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#0F392B] tracking-tight">
                Inspector Sign In
              </h2>
              <p className="text-xs text-slate-500 font-medium font-sans">
                Access SmartPack Legal Metrology Inspection Portal
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
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
                    className="w-full pl-10 pr-4 py-3 bg-[#F0F7FF] border border-[#CBD5E1] rounded-xl text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-700 uppercase font-sans mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#F0F7FF] border border-[#CBD5E1] rounded-xl text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-800 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#14532D] focus:ring-[#14532D]"
                    defaultChecked
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#14532D] font-bold hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F392B] hover:bg-[#16503d] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#0d3125] cursor-pointer mt-2"
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

            {/* Separator & Register link */}
            <div className="text-center pt-3 border-t border-sand-200/80">
              <p className="text-xs text-slate-600 font-sans">
                Don't have an inspector account?{' '}
                <Link to="/register" className="text-[#14532D] font-bold hover:underline">
                  Register here →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 Feature Badges & Storefront Sketch */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between h-full">
          {/* 3 Right Vertical Feature Badges */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <FileText className="w-5 h-5 text-[#14532D]" />
              </div>
              <div>
                <p>Authorized</p>
                <p className="text-slate-600 font-normal">Inspections Only</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <BarChart2 className="w-5 h-5 text-[#14532D]" />
              </div>
              <div>
                <p>Data-Driven</p>
                <p className="text-slate-600 font-normal">Compliance</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#14532D]" />
              </div>
              <div>
                <p>Secure</p>
                <p className="text-slate-600 font-normal">Inspector Access</p>
              </div>
            </div>
          </div>

          {/* Bottom Right Storefront Sketch & Cursive Motto */}
          <div className="pt-4 space-y-2 text-right">
            <div className="inline-block text-left">
              <p className="font-handwriting text-lg font-bold text-slate-800 leading-tight">
                "Fair Trade. Informed Consumers.
                <br />
                Stronger Markets"
              </p>
              <div className="w-24 h-1 bg-amber-400 rounded-full mt-1" />
            </div>

            <StorefrontSketchIllustration className="w-64 h-32 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
