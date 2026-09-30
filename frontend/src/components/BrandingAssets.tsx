import React from 'react';

/**
 * Reusable SVG Branding Assets & Visual Graphics for SmartPack
 * Matches the visual design reference screenshots exactly.
 */

// 1. SmartPack Official Logo (Craft Box + Green Leaves Emblem)
export const SmartPackLogo: React.FC<{ compact?: boolean; className?: string; light?: boolean }> = ({
  compact = false,
  className = '',
  light = false,
}) => {
  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Craft Box Container */}
        <div className="w-10 h-10 rounded-xl bg-[#E29D52] flex items-center justify-center shadow-md border border-[#C88239]">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        {/* Leaf Overlay */}
        <div className="absolute -top-1.5 -left-1.5 bg-[#14532D] rounded-full p-1 border-2 border-[#FAF7EE] shadow-xs">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <span className={`text-xl font-bold font-serif tracking-tight leading-none ${light ? 'text-white' : 'text-slate-900'}`}>
            SmartPack
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#14532D] font-sans mt-0.5">
            Legal Metrology Screening
          </span>
        </div>
      )}
    </div>
  );
};

// 2. Ashoka Emblem Vector Illustration (For Legal Metrology Statutory Cards)
export const AshokaEmblemIllustration: React.FC<{ className?: string }> = ({ className = 'w-10 h-14' }) => {
  return (
    <svg className={className} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lions Top Silhouette */}
      <path d="M30 40 C 30 20, 45 10, 50 10 C 55 10, 70 20, 70 40 C 70 50, 60 55, 50 55 C 40 55, 30 50, 30 40 Z" fill="#14532D" opacity="0.85" />
      <circle cx="50" cy="25" r="8" fill="#14532D" />
      <path d="M38 35 Q 50 30 62 35 Q 50 45 38 35 Z" fill="#FAF7EE" />
      {/* Abacus Base */}
      <rect x="25" y="60" width="50" height="15" rx="2" fill="#14532D" />
      {/* Ashoka Chakra */}
      <circle cx="50" cy="67.5" r="5" stroke="#FAF7EE" strokeWidth="1.5" />
      <path d="M50 62.5 L50 72.5 M45 67.5 L55 67.5" stroke="#FAF7EE" strokeWidth="1" />
      {/* Bull and Horse Accents */}
      <circle cx="33" cy="67.5" r="2.5" fill="#FAF7EE" />
      <circle cx="67" cy="67.5" r="2.5" fill="#FAF7EE" />
      {/* Pedestal & Motto 'Satyameva Jayate' in Devanagari style */}
      <path d="M20 78 L80 78 L75 92 L25 92 Z" fill="#14532D" opacity="0.9" />
      <text x="50" y="87" fill="#FAF7EE" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="serif">
        सत्यमेव जयते
      </text>
    </svg>
  );
};

// 3. Top Header Packaging Group Graphic (Dashboard Header Top Right)
export const DashboardHeaderProductsGraphic: React.FC<{ className?: string }> = ({ className = 'w-64 h-32' }) => {
  return (
    <svg className={className} viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Soft Shadow */}
      <ellipse cx="160" cy="145" rx="140" ry="12" fill="#E2DBC8" opacity="0.6" />
      
      {/* Stand-up Pouch Bag (Green Organic Food) */}
      <path d="M40 50 L80 40 L95 135 L30 135 Z" fill="#2D6A4F" />
      <path d="M40 50 L80 40 L75 30 L45 30 Z" fill="#1B4332" />
      <rect x="42" y="70" width="40" height="45" rx="4" fill="#FAF7EE" />
      <text x="62" y="90" fill="#2D6A4F" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ORGANIC</text>
      <text x="62" y="100" fill="#14532D" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Healthy Food</text>

      {/* Chips Bag (Orange/Yellow Cappis) */}
      <path d="M100 45 Q 130 35 150 45 L155 138 Q 125 145 95 138 Z" fill="#F59E0B" />
      <path d="M100 45 L150 45 L145 38 L105 38 Z" fill="#D97706" />
      <path d="M95 138 L155 138 L150 144 L100 144 Z" fill="#D97706" />
      <ellipse cx="125" cy="85" rx="22" ry="16" fill="#FAF7EE" />
      <text x="125" y="88" fill="#B45309" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">Cappis</text>

      {/* Glass Bottle with Golden Cap (Juice / Oil) */}
      <rect x="175" y="30" width="16" height="12" rx="2" fill="#D97706" />
      <path d="M178 42 L188 42 L194 65 L172 65 Z" fill="#D1D5DB" opacity="0.8" />
      <rect x="170" y="65" width="26" height="72" rx="6" fill="#EAB308" opacity="0.9" />
      <rect x="172" y="80" width="22" height="36" rx="2" fill="#FAF7EE" />
      <text x="183" y="98" fill="#78350F" fontSize="7" fontWeight="bold" textAnchor="middle">JUICE</text>

      {/* Box with Botanical Print */}
      <rect x="215" y="60" width="70" height="75" rx="6" fill="#E5D9C5" stroke="#C8B9A6" strokeWidth="2" />
      <rect x="225" y="70" width="50" height="55" rx="4" fill="#FAF7EE" />
      <circle cx="250" cy="92" r="14" fill="#D8F3DC" />
      <path d="M250 82 Q 255 92 250 102 Q 245 92 250 82 Z" fill="#14532D" />
    </svg>
  );
};

// 4. Batch Inspection Packaging Conveyor Graphic (Batch Inspection Top Right)
export const BatchPackageConveyorGraphic: React.FC<{ className?: string }> = ({ className = 'w-72 h-32' }) => {
  return (
    <svg className={className} viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Conveyor Belt Track */}
      <rect x="10" y="125" width="340" height="20" rx="4" fill="#475569" />
      <circle cx="30" cy="135" r="6" fill="#94A3B8" />
      <circle cx="80" cy="135" r="6" fill="#94A3B8" />
      <circle cx="130" cy="135" r="6" fill="#94A3B8" />
      <circle cx="180" cy="135" r="6" fill="#94A3B8" />
      <circle cx="230" cy="135" r="6" fill="#94A3B8" />
      <circle cx="280" cy="135" r="6" fill="#94A3B8" />
      <circle cx="330" cy="135" r="6" fill="#94A3B8" />

      {/* Stand-up Pouch Bag */}
      <path d="M40 50 L75 42 L85 125 L35 125 Z" fill="#D97706" />
      <rect x="45" y="65" width="30" height="40" rx="3" fill="#FAF7EE" />

      {/* Tea Box */}
      <rect x="100" y="60" width="45" height="65" rx="4" fill="#14532D" />
      <circle cx="122.5" cy="90" r="12" fill="#D8F3DC" />

      {/* Potato Chips Bag */}
      <path d="M160 40 Q 185 32 210 40 L215 125 Q 185 130 155 125 Z" fill="#DC2626" />
      <ellipse cx="185" cy="80" rx="18" ry="14" fill="#FAF7EE" />
      <text x="185" y="84" fill="#DC2626" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Chips</text>

      {/* Oil Bottle */}
      <rect x="235" y="35" width="12" height="10" rx="2" fill="#B45309" />
      <path d="M230 45 L252 45 L256 125 L226 125 Z" fill="#F59E0B" />

      {/* Shipping Master Box */}
      <rect x="270" y="55" width="70" height="70" rx="4" fill="#D97706" opacity="0.9" />
      <line x1="305" y1="55" x2="305" y2="125" stroke="#78350F" strokeWidth="2" strokeDasharray="4 2" />
      <rect x="280" y="75" width="30" height="25" fill="#FAF7EE" />
    </svg>
  );
};

// 5. Total Inspections 3D Craft Bag Icon (KPI Card 1)
export const TotalInspectionsCardIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 14 L38 14 L42 42 L6 42 Z" fill="#D97706" />
      <path d="M10 14 L18 6 L30 6 L38 14 Z" fill="#B45309" />
      <rect x="14" y="20" width="20" height="16" rx="2" fill="#FAF7EE" />
      <path d="M18 24 L24 30 L30 24" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// 6. Compliant Green Shield Icon (KPI Card 2)
export const CompliantCardIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#D8F3DC" />
      <circle cx="24" cy="24" r="16" fill="#14532D" />
      <path d="M17 24 L22 29 L31 19" stroke="#FAF7EE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// 7. Review Required Yellow Document Icon (KPI Card 3)
export const ReviewRequiredCardIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="26" height="36" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      <line x1="14" y1="14" x2="26" y2="14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="24" y2="20" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="30" r="9" fill="#F59E0B" stroke="#FAF7EE" strokeWidth="2" />
      <path d="M25 27 L31 33" stroke="#FAF7EE" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// 8. Missing Declarations Red Warning Icon (KPI Card 4)
export const MissingInfoCardIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="26" height="36" rx="4" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
      <path d="M28 20 L40 40 L16 40 Z" fill="#DC2626" stroke="#FAF7EE" strokeWidth="2" />
      <text x="28" y="36" fill="#FAF7EE" fontSize="14" fontWeight="bold" textAnchor="middle">!</text>
    </svg>
  );
};

// 9. Botanical Leaf Branch Accent
export const BotanicalLeafAccent: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 Q 40 50 90 10" stroke="#52796F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 70 C 15 55, 20 40, 35 50 C 40 55, 35 65, 30 70 Z" fill="#D8F3DC" stroke="#2D6A4F" strokeWidth="1.5" />
      <path d="M50 50 C 35 35, 40 20, 55 30 C 60 35, 55 45, 50 50 Z" fill="#A3B18A" stroke="#2D6A4F" strokeWidth="1.5" />
      <path d="M70 30 C 55 15, 60 0, 75 10 C 80 15, 75 25, 70 30 Z" fill="#D8F3DC" stroke="#2D6A4F" strokeWidth="1.5" />
    </svg>
  );
};

// 10. Legal Rulebooks Graphic
export const LegalRuleBooksIllustration: React.FC<{ className?: string }> = ({ className = 'w-56 h-40' }) => {
  return (
    <div className={`relative flex flex-col justify-end ${className}`}>
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 p-3 rounded-lg shadow-lg border-l-4 border-amber-500 transform -rotate-1 mb-1">
        <div className="flex items-center justify-between border-b border-amber-700/50 pb-1 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">STATUTORY CODE</span>
          <span className="text-[10px] text-amber-300 font-semibold">2009</span>
        </div>
        <p className="text-xs font-serif font-bold text-amber-50 leading-tight">Legal Metrology Act, 2009</p>
        <p className="text-[9px] text-amber-300/80 mt-0.5">Department of Consumer Affairs, India</p>
      </div>

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

// 11. Package Inspection Visual Card Illustration
export const PackageInspectionIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <div className={`relative bg-gradient-to-b from-amber-50 to-ivory-200 p-4 rounded-2xl border border-amber-200/80 shadow-md ${className}`}>
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
      <div className="absolute -bottom-2 -right-2 bg-forest-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-emerald-400 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
        <span>SCREENED</span>
      </div>
    </div>
  );
};

// 12. Fair Trade Stamp Mark
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

// 13. Metrology Weighing Scale Graphic
export const MetrologyScaleIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="170" rx="45" ry="12" fill="#B45309" />
      <rect x="94" y="50" width="12" height="120" rx="3" fill="#B45309" />
      <path d="M40 70 L160 70" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="70" r="10" fill="#FBBF24" />
      <path d="M40 70 L25 120 M40 70 L55 120" stroke="#92400E" strokeWidth="2" />
      <path d="M15 120 C15 135, 65 135, 65 120 Z" fill="#FBBF24" />
      <path d="M160 70 L145 120 M160 70 L175 120" stroke="#92400E" strokeWidth="2" />
      <path d="M135 120 C135 135, 185 135, 185 120 Z" fill="#FBBF24" />
    </svg>
  );
};


