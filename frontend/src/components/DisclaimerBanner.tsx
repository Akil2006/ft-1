import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#FEF9EE] border-l-4 border-amber-500 p-4 rounded-xl shadow-xs border border-amber-200/80 my-4 relative transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3.5 pr-6">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5 shadow-xs">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1 font-sans">
              Mandatory Preliminary Screening Notice
            </p>
            <p className="text-xs text-amber-800 leading-relaxed font-sans">
              This analysis is an automated preliminary screening based on Legal Metrology (Packaged Commodities) Rules, 2011 and Legal Metrology Act, 2009. It does <strong className="font-bold text-amber-950">NOT</strong> constitute a final legal compliance determination or official enforcement order. Manual verification by an authorized Legal Metrology Inspector is required.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 p-1 rounded-md hover:bg-amber-100/60 transition-colors"
          title="Dismiss Notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
