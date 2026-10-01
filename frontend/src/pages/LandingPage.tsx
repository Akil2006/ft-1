import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ScanText,
  Scale,
  ArrowRight,
  BookOpen,
  FileCheck2,
  User,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  LegalRuleBooksIllustration,
  DashboardHeaderProductsGraphic,
  AshokaEmblemIllustration,
} from '../components/BrandingAssets';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-8 py-2 font-sans max-w-7xl mx-auto">
      {/* Hero Presentation Header Section */}
      <section className="bg-gradient-to-r from-emerald-50/60 via-ivory-100 to-sand-100 rounded-3xl p-6 sm:p-10 border border-sand-300 shadow-xs relative overflow-hidden space-y-6">
        {/* Top Centered Pill Tag */}
        <div className="text-center space-y-3">
          <div className="bg-[#E6F4EA] text-[#14532D] font-semibold text-xs px-4 py-1.5 rounded-full border border-[#A7F3D0] inline-flex items-center gap-2 shadow-2xs">
            <Scale className="w-4 h-4 text-[#14532D]" />
            <span>Legal Metrology (Packaged Commodities) Rules, 2011 Automated Screening</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight text-center max-w-4xl mx-auto">
            AI-Powered Packaging Compliance
            <br />
            <span className="text-[#14532D]">& Legal Metrology Inspection System</span>
          </h1>

          <div className="w-36 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-[#14532D] rounded-full mx-auto my-2 opacity-80" />

          <p className="text-xs sm:text-sm font-medium text-slate-600 text-center max-w-2xl mx-auto font-sans">
            Upload package images to run multi-engine OCR, extract statutory declarations, verify bounding-box evidence, and execute deterministic Legal Metrology screening rules.
          </p>

          {/* Hero Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <RouterLink
              to="/inspections/new"
              className="bg-[#0F392B] hover:bg-[#16503d] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md text-xs sm:text-sm inline-flex items-center gap-2 transition-all border border-[#0d3125] cursor-pointer"
            >
              <span>Start Package Inspection</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </RouterLink>

            <RouterLink
              to="/login"
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold py-3.5 px-6 rounded-2xl border border-slate-300 shadow-2xs text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-[#14532D]" />
              <span>Inspector Login</span>
            </RouterLink>
          </div>
        </div>

        {/* Split Hero Graphics Section (Left Product Jars & Books | Right Magnifier OCR Snippet) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-6 border-t border-sand-200/80">
          {/* Left Column: Cursive Tagline + Product Jars + Leather Rulebooks */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-1">
              <p className="font-handwriting text-xl font-bold text-[#14532D]">
                Scan Products. Check Declarations. Ensure Fair Markets.
              </p>
              <div className="w-36 h-1 bg-amber-400 rounded-full" />
            </div>

            <div className="flex items-end gap-4">
              <DashboardHeaderProductsGraphic className="w-64 h-32" />
              <LegalRuleBooksIllustration className="w-48 h-32 shrink-0" />
            </div>
          </div>

          {/* Right Column: Magnifying Glass Inspection Snippet & Cursive Motto */}
          <div className="md:col-span-6 space-y-4 text-right">
            <div className="inline-block text-left bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-xl space-y-2 max-w-sm ml-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Label Inspection</span>
                <Search className="w-4 h-4 text-[#14532D]" />
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-800 bg-sand-50 p-2.5 rounded-lg border border-sand-200">
                <p><strong className="text-slate-600">Net Quantity :</strong> <span className="font-bold text-[#14532D]">500 g</span></p>
                <p><strong className="text-slate-600">MRP :</strong> <span className="font-bold text-[#14532D]">₹ 120.00</span> (Incl. of all taxes)</p>
                <p><strong className="text-slate-600">Mfg. Date :</strong> 15/08/2026</p>
                <p><strong className="text-slate-600">Best Before :</strong> 15/02/2027</p>
              </div>
            </div>

            <div className="inline-block text-right pt-2">
              <p className="font-handwriting text-lg font-bold text-slate-800 leading-tight">
                "AI reads labels. Rules check compliance.
                <br />
                You get clear insights."
              </p>
              <div className="w-28 h-1 bg-amber-400 rounded-full ml-auto mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Capability Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Multi-Engine OCR & ROI Evidence */}
        <div className="bg-[#F0FBF4] border border-[#C8E6C9] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#A7F3D0] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border border-[#A7F3D0] text-[#14532D] flex items-center justify-center shadow-2xs">
                <ScanText className="w-6 h-6 text-[#14532D]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#14532D] bg-white px-2.5 py-1 rounded-md border border-[#A7F3D0]">
                OCR EVIDENCE
              </span>
            </div>

            <h3 className="text-lg font-bold font-sans text-slate-900">Multi-Engine OCR & ROI Evidence</h3>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Extracts MRP, Net Quantity, Dates, Manufacturer details, and Country of Origin using fallback OCR engines with bounding box snippet crops.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#14532D]">Explore Evidence</span>
            <div className="w-8 h-8 rounded-full bg-[#14532D] text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Deterministic Rule Engine */}
        <div className="bg-[#F0F7FF] border border-[#BAE6FD] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#7DD3FC] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shadow-2xs">
                <Scale className="w-6 h-6 text-[#0284C7]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0284C7] bg-white px-2.5 py-1 rounded-md border border-[#BAE6FD]">
                100% GROUNDED
              </span>
            </div>

            <h3 className="text-lg font-bold font-sans text-slate-900">Deterministic Rule Engine</h3>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Runs 100% grounded legal metrology checks without LLM hallucinations, ensuring accurate preliminary compliance classification.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#0284C7]">View Rule Definitions</span>
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: ReportLab PDF Export */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#FCD34D] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] flex items-center justify-center shadow-2xs">
                <FileCheck2 className="w-6 h-6 text-[#D97706]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#D97706] bg-white px-2.5 py-1 rounded-md border border-[#FDE68A]">
                PDF EXPORT
              </span>
            </div>

            <h3 className="text-lg font-bold font-sans text-slate-900">ReportLab PDF Export</h3>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Generates downloadable multi-page PDF inspection reports complete with evidence crops, statutory rule traces, and preliminary disclaimers.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#D97706]">Sample PDF Reports</span>
            <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Grounded Regulatory Assistant CTA Section */}
      <section className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#E9D5FF] border border-[#D8B4FE] text-[#7E22CE] flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-7 h-7 text-[#7E22CE]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 leading-tight">
              Grounded Legal Metrology Regulatory Assistant
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-xl">
              Query official excerpts from the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011 with direct statutory citations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 z-10 shrink-0">
          <RouterLink
            to="/regulatory"
            className="bg-white hover:bg-slate-50 text-[#7E22CE] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-[#D8B4FE] shadow-2xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Ask Legal Assistant</span>
            <ArrowRight className="w-4 h-4 text-[#7E22CE]" />
          </RouterLink>

          <AshokaEmblemIllustration className="w-10 h-14 opacity-75 shrink-0" />
        </div>
      </section>
    </div>
  );
};
