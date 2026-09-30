import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Search,
  Scale,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lightbulb,
  BarChart2,
  Globe,
  Users,
  MessageSquare,
} from 'lucide-react';
import { regulatoryService } from '../services/regulatory';
import { RegulatoryQueryResponse } from '../types/regulatory';
import { MetrologyScaleIllustration, LegalRuleBooksIllustration } from '../components/BrandingAssets';

export const RegulatoryAssistantPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RegulatoryQueryResponse | null>(null);

  const suggestedQueries = [
    { text: 'What are the mandatory MRP declaration rules?', icon: Search },
    { text: 'Net quantity declaration metric requirements', icon: BarChart2 },
    { text: 'Country of Origin rules for imported packages', icon: Globe },
    { text: 'Consumer care contact details requirements', icon: Users },
    { text: 'Penalties under Section 36 of Legal Metrology Act', icon: Scale },
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery(searchQuery);
    try {
      const res = await regulatoryService.queryAssistant(searchQuery);
      setResponse(res);
    } catch (err) {
      console.error('Failed to query regulatory assistant', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2 font-sans">
      {/* Hero Header & Desk Section Container */}
      <div className="bg-gradient-to-r from-emerald-50/60 via-ivory-100 to-sand-100 rounded-3xl p-6 sm:p-10 border border-sand-300 shadow-xs relative overflow-hidden space-y-6">
        {/* Top Center Icon Circle */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#14532D] text-white flex items-center justify-center shadow-md mx-auto border-2 border-emerald-300 shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-center">
            <span className="text-slate-900">Grounded Legal Metrology </span>
            <span className="text-[#14532D]">Regulatory Assistant</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-600 text-center max-w-2xl mx-auto font-sans">
            Query statutory provisions from the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011 with direct legal section citations.
          </p>
        </div>

        {/* 5 Suggested Question Chips Grid */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto pt-2">
          {suggestedQueries.map((sq, idx) => {
            const IconComponent = sq.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSearch(sq.text)}
                className="bg-white hover:bg-emerald-50 text-[#14532D] border border-emerald-200/80 px-4 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition-all hover:border-emerald-400"
              >
                <IconComponent className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
                <span>{sq.text}</span>
              </button>
            );
          })}
        </div>

        {/* Query Input Search Box Form */}
        <div className="max-w-3xl mx-auto pt-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-2 border border-slate-300 shadow-md flex items-center gap-2 relative focus-within:ring-2 focus-within:ring-forest-600/30 focus-within:border-forest-600 transition-all"
          >
            <MessageSquare className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about Legal Metrology rules (e.g. MRP, Net Quantity, Expiry date format)..."
              className="w-full bg-transparent pl-2 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-[#0F392B] hover:bg-[#16503d] disabled:opacity-40 text-white p-3 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-2.5 font-sans">
            Get accurate, rule-based answers with section references from the Legal Metrology Act, 2009 and PCR, 2011.
          </p>
        </div>

        {/* Split Desk Layout: Left Metrology Books & Scale | Right 4 Feature Badges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-6 border-t border-sand-200/80">
          {/* Left Column: Leather Rulebooks Stack & Brass Metrology Scale */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-end justify-start gap-4">
            <LegalRuleBooksIllustration className="w-64 h-36" />
            <MetrologyScaleIllustration className="w-28 h-28 text-amber-700 shrink-0" />
          </div>

          {/* Right Column: 4 Feature Badges */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <FileText className="w-4 h-4 text-[#14532D]" />
              </div>
              <span>Authoritative Legal References</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#14532D]" />
              </div>
              <span>Rule-Based Guidance</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <Scale className="w-4 h-4 text-[#14532D]" />
              </div>
              <span>Direct Section Citations</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-sand-300/80 shadow-2xs flex items-center space-x-3 text-xs font-bold text-slate-900">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
                <Lightbulb className="w-4 h-4 text-[#14532D]" />
              </div>
              <span>Support Compliance Decisions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14532D]" />
        </div>
      )}

      {/* Response Display Section */}
      {response && !loading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#14532D] uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#14532D]" />
              <span>Grounded Statutory Answer</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-[#E6F4EA]/60 p-5 rounded-2xl border border-[#C8E6C9] font-sans">
              {response.answer}
            </p>
          </div>

          {/* Matched Legal Sections */}
          {response.matched_sections && response.matched_sections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                <span>Statutory Reference Citations</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {response.matched_sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-white border border-sand-300 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-[#14532D] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#14532D] bg-[#E6F4EA] px-3 py-1 rounded-full border border-[#A7F3D0]">
                        {sec.act_or_rule} — {sec.section_number}
                      </span>
                      <span className="text-[11px] text-[#14532D] font-mono font-bold">
                        {(sec.relevance_score * 100).toFixed(0)}% Relevance Match
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 font-sans">{sec.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{sec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
