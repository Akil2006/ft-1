import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, FileText, BookOpen, Info } from 'lucide-react';
import { LegalRuleBooksIllustration, MetrologyScaleIllustration } from '../components/BrandingAssets';

export const SettingsPage: React.FC = () => {
  const [ocrEngine, setOcrEngine] = useState('paddleocr');
  const [ruleVersion, setRuleVersion] = useState('2026.01');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-ivory-100 to-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-14 h-14 rounded-full bg-[#E6F4EA] border border-[#A7F3D0] flex items-center justify-center text-[#14532D] shadow-xs shrink-0">
            <SettingsIcon className="w-7 h-7 text-[#14532D]" />
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F392B] tracking-tight">
              System Settings
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Configure OCR fallback engines and Legal Metrology rule versions
            </p>
          </div>
        </div>

        {/* Right Decorative Graphic */}
        <div className="hidden md:flex items-center space-x-3 shrink-0 z-10">
          <LegalRuleBooksIllustration className="w-56 h-36" />
          <MetrologyScaleIllustration className="w-24 h-24 text-amber-700" />
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-8">
        {saved && (
          <div className="bg-[#E6F4EA] border border-[#A7F3D0] text-[#14532D] p-4 rounded-2xl flex items-center gap-2.5 font-bold text-xs sm:text-sm shadow-xs transition-all">
            <CheckCircle className="w-5 h-5 text-[#14532D] shrink-0" />
            <span>System preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Setting Section 1: Primary OCR Engine */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-[#14532D]" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-base font-sans">Primary OCR Engine</h2>
                <p className="text-xs text-slate-600 mt-0.5 font-sans">
                  Select the OCR engine to extract text from packaging labels
                </p>

                <div className="mt-3">
                  <select
                    value={ocrEngine}
                    onChange={(e) => setOcrEngine(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs cursor-pointer"
                  >
                    <option value="paddleocr">PaddleOCR (Recommended for packaging labels)</option>
                    <option value="easyocr">EasyOCR (PyTorch CPU/GPU fallback)</option>
                    <option value="tesseract">Tesseract OCR Engine</option>
                    <option value="cv_contour">CV Contour Reader (Fail-safe reader)</option>
                  </select>
                </div>

                {/* Info Callout Banner */}
                <div className="mt-3 bg-[#E6F4EA] border border-[#C8E6C9]/80 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#14532D] font-medium">
                  <Info className="w-4 h-4 text-[#14532D] shrink-0" />
                  <span>SmartPack uses automatic pipeline fallback if the primary engine encounters low confidence.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-sand-200/80 pt-6 space-y-3">
            {/* Setting Section 2: Legal Metrology Rule Engine Version */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-[#14532D]" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-base font-sans">Legal Metrology Rule Engine Version</h2>
                <p className="text-xs text-slate-600 mt-0.5 font-sans">
                  Select the rule set version for compliance checking
                </p>

                <div className="mt-3">
                  <select
                    value={ruleVersion}
                    onChange={(e) => setRuleVersion(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs cursor-pointer"
                  >
                    <option value="2026.01">v2026.01 — Active Legal Metrology (Packaged Commodities) Rules 2011</option>
                    <option value="2011.01">v2011.01 — Legacy Base Rules 2011</option>
                  </select>
                </div>

                {/* Info Callout Banner */}
                <div className="mt-3 bg-[#E6F4EA] border border-[#C8E6C9]/80 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#14532D] font-medium">
                  <Info className="w-4 h-4 text-[#14532D] shrink-0" />
                  <span>This version includes the latest amendments and rule mappings for packaged commodities.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Save Button */}
          <div className="pt-4 flex items-center">
            <button
              type="submit"
              className="bg-[#0F392B] hover:bg-[#16503d] text-white font-bold px-6 py-3 rounded-xl shadow-xs transition-all text-xs sm:text-sm inline-flex items-center gap-2 border border-[#0d3125] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
