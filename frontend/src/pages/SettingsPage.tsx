import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, Shield } from 'lucide-react';

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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400">Configure OCR fallback engines and Legal Metrology rule versions</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {saved && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>System preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Primary OCR Engine
            </label>
            <select
              value={ocrEngine}
              onChange={(e) => setOcrEngine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="paddleocr">PaddleOCR (Recommended for packaging labels)</option>
              <option value="easyocr">EasyOCR (PyTorch CPU/GPU fallback)</option>
              <option value="tesseract">Tesseract OCR Engine</option>
              <option value="cv_contour">CV Contour Reader (Fail-safe reader)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              SmartPack uses automatic pipeline fallback if the primary engine encounters low confidence.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Legal Metrology Rule Engine Version
            </label>
            <select
              value={ruleVersion}
              onChange={(e) => setRuleVersion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="2026.01">v2026.01 — Active Legal Metrology (Packaged Commodities) Rules 2011</option>
              <option value="2011.01">v2011.01 — Legacy Base Rules 2011</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all text-sm inline-flex items-center gap-2"
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
