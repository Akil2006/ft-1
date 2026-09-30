import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ScanText,
  Scale,
  ArrowRight,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import {
  LegalRuleBooksIllustration,
  PackageInspectionIllustration,
  BotanicalLeafAccent,
  FairTradeStamp,
} from '../components/BrandingAssets';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12 py-6">
      {/* Editorial Hero Section */}
      <section className="relative bg-gradient-to-b from-ivory-50 via-ivory-100 to-sage-50 rounded-3xl p-6 sm:p-10 lg:p-12 border border-sand-300/80 shadow-sm overflow-hidden">
        {/* Background Botanical Overlay */}
        <div className="absolute top-0 right-0 opacity-25 pointer-events-none transform translate-x-6 -translate-y-6">
          <BotanicalLeafAccent className="w-64 h-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-forest-100/90 border border-forest-200 text-forest-800 text-xs font-semibold">
              <Scale className="w-4 h-4 text-forest-600" />
              <span>Legal Metrology (Packaged Commodities) Rules, 2011 Automated Screening</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900 leading-[1.15] tracking-tight">
              AI-Powered Packaging Compliance & Legal Metrology Inspection System
            </h1>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans max-w-xl">
              Upload package images to run multi-engine OCR, extract statutory declarations, verify bounding-box evidence, and execute deterministic Legal Metrology screening rules.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <RouterLink
                to="/register"
                className="flex items-center space-x-2 bg-forest-700 hover:bg-forest-600 text-white font-bold px-6 py-3.5 rounded-full shadow-md shadow-forest-900/20 transition-all hover:scale-[1.02] text-sm"
              >
                <span>Start Package Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </RouterLink>

              <RouterLink
                to="/login"
                className="flex items-center space-x-2 bg-white hover:bg-ivory-50 text-slate-800 font-semibold px-6 py-3.5 rounded-full border border-sand-300 shadow-xs transition-all text-sm"
              >
                <span>Inspector Login</span>
              </RouterLink>
            </div>

            {/* Hand-annotated annotation */}
            <div className="pt-3 flex items-center space-x-3 text-forest-800">
              <span className="font-handwriting text-xl font-bold text-forest-700">
                Scan Products. Check Declarations. Ensure Fair Markets.
              </span>
            </div>
          </div>

          {/* Right Hero Visual Column (Package + Magnifying Glass + Legal Books) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full max-w-sm">
              <PackageInspectionIllustration className="w-full shadow-lg" />
              <div className="absolute -bottom-4 -left-4">
                <FairTradeStamp className="w-20 h-20 shadow-xs" />
              </div>
            </div>

            {/* Legal Books Banner */}
            <div className="w-full max-w-sm pt-2">
              <LegalRuleBooksIllustration className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Capability Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shadow-2xs">
            <ScanText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-sans text-slate-900">Multi-Engine OCR & ROI Evidence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Extracts MRP, Net Quantity, Dates, Manufacturer details, and Country of Origin using fallback OCR engines with bounding box snippet crops.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shadow-2xs">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-sans text-slate-900">Deterministic Rule Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Runs 100% grounded legal metrology checks without LLM hallucinations, ensuring accurate preliminary compliance classification.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shadow-2xs">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-sans text-slate-900">ReportLab PDF Export</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generates downloadable multi-page PDF inspection reports complete with evidence crops, statutory rule traces, and preliminary disclaimers.
          </p>
        </div>
      </section>

      {/* Grounded Regulatory Assistant CTA Section */}
      <section className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-forest-700">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>STATUTORY KNOWLEDGE BASE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
            Grounded Legal Metrology Regulatory Assistant
          </h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Query official excerpts from the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011 with direct statutory citations.
          </p>
        </div>

        <RouterLink
          to="/regulatory"
          className="flex items-center space-x-2 bg-white hover:bg-ivory-100 text-forest-900 font-bold px-5 py-3 rounded-full transition-all text-xs whitespace-nowrap shadow-sm"
        >
          <span>Ask Legal Assistant</span>
          <ArrowRight className="w-4 h-4 text-forest-700" />
        </RouterLink>
      </section>
    </div>
  );
};
