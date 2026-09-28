import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        <div className="ml-3">
          <p className="text-xs text-amber-800 font-medium uppercase tracking-wider mb-0.5">
            Mandatory Preliminary Screening Notice
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            This analysis is an automated preliminary screening based on Legal Metrology (Packaged Commodities) Rules, 2011 and Legal Metrology Act, 2009. It does <strong>NOT</strong> constitute a final legal compliance determination or official enforcement order. Manual verification by an authorized Legal Metrology Inspector is required.
          </p>
        </div>
      </div>
    </div>
  );
};
