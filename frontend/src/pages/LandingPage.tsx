import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ShieldCheck,
  ScanText,
  Scale,
  FileCheck,
  Search,
  ArrowRight,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Legal Metrology (Packaged Commodities) Rules, 2011 Automated Screening</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          AI-Powered Packaging Compliance & Legal Metrology Inspection System
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload package images to run multi-engine OCR, extract statutory declarations, verify bounding-box evidence, and execute deterministic Legal Metrology screening rules.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <RouterLink
            to="/register"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all text-base"
          >
            <span>Start Package Inspection</span>
            <ArrowRight className="w-5 h-5" />
          </RouterLink>

          <RouterLink
            to="/login"
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-6 py-3 rounded-lg border border-slate-700 transition-all text-base"
          >
            <span>Inspector Login</span>
          </RouterLink>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-blue-900/50 border border-blue-700/40 flex items-center justify-center text-blue-400">
            <ScanText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Multi-Engine OCR & ROI Evidence</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Extracts MRP, Net Quantity, Dates, Manufacturer details, and Country of Origin using fallback OCR engines with bounding box snippet crops.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Deterministic Rule Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Runs 100% grounded legal metrology checks without LLM hallucinations, ensuring accurate preliminary compliance classification.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-amber-900/50 border border-amber-700/40 flex items-center justify-center text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">ReportLab PDF Export</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Generates downloadable multi-page PDF inspection reports complete with evidence crops, statutory rule traces, and preliminary disclaimers.
          </p>
        </div>
      </section>

      {/* Statutory Rules Reference Banner */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>Grounded Legal Metrology Regulatory Assistant</span>
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Query official excerpts from the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011 with direct statutory citations.
          </p>
        </div>

        <RouterLink
          to="/regulatory"
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold px-5 py-2.5 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
        >
          <span>Ask Legal Assistant</span>
          <Search className="w-4 h-4" />
        </RouterLink>
      </section>
    </div>
  );
};
