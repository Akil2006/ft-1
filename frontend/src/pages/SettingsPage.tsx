import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, Sliders } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="border-b border-sand-300/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-slate-700 text-xs font-semibold mb-2 border border-sand-300">
          <Sliders className="w-3.5 h-3.5 text-forest-700" />
          <span>System Configuration</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Technical Preferences</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure OCR pipeline fallback engines and active Legal Metrology ruleset versions.
        </p>
      </div>

      <div className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-6">
        {saved && (
          <div className="bg-sage-100 border border-sage-300 text-forest-900 p-3.5 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-forest-700" />
            <span>System preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary OCR Pipeline Engine
            </label>
            <select
              value={ocrEngine}
              onChange={(e) => setOcrEngine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-sand-50/60 border border-sand-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700 font-sans"
            >
              <option value="paddleocr">PaddleOCR (Recommended for packaged commodity labels)</option>
              <option value="easyocr">EasyOCR (PyTorch CPU/GPU fallback)</option>
              <option value="tesseract">Tesseract OCR Engine</option>
              <option value="cv_contour">CV Contour Reader (Fail-safe reader)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
              SmartPack uses automatic multi-stage OCR fallback if confidence drops below target threshold.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Legal Metrology Rule Engine Version
            </label>
            <select
              value={ruleVersion}
              onChange={(e) => setRuleVersion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-sand-50/60 border border-sand-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700 font-sans"
            >
              <option value="2026.01">v2026.01 — Active Legal Metrology (Packaged Commodities) Rules 2011</option>
              <option value="2011.01">v2011.01 — Legacy Base Rules 2011</option>
            </select>
          </div>

          <div className="pt-4 border-t border-sand-200">
            <button
              type="submit"
              className="bg-forest-800 hover:bg-forest-900 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all text-sm inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

