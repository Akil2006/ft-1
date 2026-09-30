import React from 'react';

/**
 * Reusable SVG Branding Assets & Illustrations for SmartPack
 * Legal Metrology & Packaged Commodity Visual System
 */

// 1. SmartPack Official Logo (Box + Green Leaves Emblem)
export const SmartPackLogo: React.FC<{ compact?: boolean; className?: string; light?: boolean }> = ({
  compact = false,
  className = '',
  light = false,
}) => {
  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Package Box Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-md shadow-forest-900/20 border border-forest-500/30">
          <svg className="w-6 h-6 text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        {/* Leaf Overlay */}
        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5 border-2 border-ivory-100 shadow-sm">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <span className={`text-xl font-bold font-sans tracking-tight leading-tight ${light ? 'text-white' : 'text-slate-900'}`}>
            SmartPack
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-forest-600 -mt-0.5 font-sans">
            Legal Metrology Screening
          </span>
        </div>
      )}
    </div>
  );
};

// 2. Brass Scale of Justice / Metrology Weighing Scale Graphic
export const MetrologyScaleIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Base */}
      <ellipse cx="100" cy="170" rx="45" ry="12" fill="url(#brassGrad)" />
      <rect x="94" y="50" width="12" height="120" rx="3" fill="url(#brassGrad)" />
      {/* Top Beam */}
      <path d="M40 70 L160 70" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="70" r="10" fill="url(#goldGrad)" />
      {/* Left Pan */}
      <path d="M40 70 L25 120 M40 70 L55 120" stroke="#92400E" strokeWidth="2" />
      <path d="M15 120 C15 135, 65 135, 65 120 Z" fill="url(#goldGrad)" />
      {/* Right Pan */}
      <path d="M160 70 L145 120 M160 70 L175 120" stroke="#92400E" strokeWidth="2" />
      <path d="M135 120 C135 135, 185 135, 185 120 Z" fill="url(#goldGrad)" />
    </svg>
  );
};

// 3. Legal Metrology Act & Rulebook Graphic
export const LegalRuleBooksIllustration: React.FC<{ className?: string }> = ({ className = 'w-56 h-40' }) => {
  return (
    <div className={`relative flex flex-col justify-end ${className}`}>
      {/* Book 1 - Legal Metrology Act */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 p-3 rounded-lg shadow-lg border-l-4 border-amber-500 transform -rotate-1 mb-1">
        <div className="flex items-center justify-between border-b border-amber-700/50 pb-1 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">STATUTORY CODE</span>
          <span className="text-[10px] text-amber-300 font-semibold">2009</span>
        </div>
        <p className="text-xs font-serif font-bold text-amber-50 leading-tight">Legal Metrology Act, 2009</p>
        <p className="text-[9px] text-amber-300/80 mt-0.5">Department of Consumer Affairs, India</p>
      </div>

      {/* Book 2 - Packaged Commodities Rules */}
      <div className="bg-gradient-to-r from-slate-900 via-forest-900 to-slate-900 text-slate-100 p-3.5 rounded-lg shadow-xl border-l-4 border-forest-500 transform rotate-1">
        <div className="flex items-center justify-between border-b border-forest-700/50 pb-1 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">RULES & AMENDMENTS</span>
          <span className="text-[10px] text-emerald-300 font-semibold">2011</span>
        </div>
        <p className="text-sm font-serif font-bold text-emerald-50 leading-tight">Packaged Commodities Rules, 2011</p>
        <p className="text-[10px] text-emerald-300/80 mt-0.5">Preliminary Inspection & Field Declarations</p>
      </div>
    </div>
  );
};

// 4. Botanical Leaf Branch Overlay Graphic
export const BotanicalLeafAccent: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 Q 40 50 90 10" stroke="#84A98C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 70 C 15 55, 20 40, 35 50 C 40 55, 35 65, 30 70 Z" fill="#D8F3DC" stroke="#52796F" strokeWidth="1.5" />
      <path d="M50 50 C 35 35, 40 20, 55 30 C 60 35, 55 45, 50 50 Z" fill="#A3B18A" stroke="#52796F" strokeWidth="1.5" />
      <path d="M70 30 C 55 15, 60 0, 75 10 C 80 15, 75 25, 70 30 Z" fill="#D8F3DC" stroke="#52796F" strokeWidth="1.5" />
    </svg>
  );
};

// 5. Package Inspection Visual Card Illustration
export const PackageInspectionIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <div className={`relative bg-gradient-to-b from-amber-50 to-ivory-200 p-4 rounded-2xl border border-amber-200/80 shadow-md ${className}`}>
      {/* Product Mockup */}
      <div className="bg-amber-100 rounded-xl p-3 border border-amber-300/60 text-center">
        <div className="inline-block px-2 py-0.5 bg-forest-700 text-emerald-100 text-[9px] font-bold uppercase rounded mb-1">
          Organic Food Pack
        </div>
        <p className="text-xs font-bold text-slate-800">Roasted Almonds 500g</p>
        <div className="my-2 py-1.5 px-2 bg-white rounded border border-amber-200 text-left space-y-0.5 text-[9px]">
          <p><strong className="text-slate-600">Net Qty:</strong> 500 g</p>
          <p><strong className="text-slate-600">MRP:</strong> ₹350.00 (Incl. taxes)</p>
          <p><strong className="text-slate-600">Mfg Date:</strong> 08/2026</p>
        </div>
      </div>
      {/* Inspection Badge */}
      <div className="absolute -bottom-2 -right-2 bg-forest-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-emerald-400 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
        <span>SCREENED</span>
      </div>
    </div>
  );
};

// 6. Fair Weights & Fair Markets Stamp Mark
export const FairTradeStamp: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`rounded-full border-2 border-dashed border-amber-700/60 p-1 flex items-center justify-center ${className}`}>
      <div className="w-full h-full rounded-full border border-amber-800/40 bg-amber-100/50 flex flex-col items-center justify-center text-center p-1">
        <span className="text-[8px] font-bold tracking-widest text-amber-900 uppercase">FAIR WEIGHTS</span>
        <span className="text-[10px] font-bold text-forest-800">SMARTPACK</span>
        <span className="text-[8px] font-bold tracking-widest text-amber-900 uppercase">FAIR MARKETS</span>
      </div>
    </div>
  );
};
