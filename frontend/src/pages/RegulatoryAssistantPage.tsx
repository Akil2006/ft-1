import React, { useState } from 'react';
import { BookOpen, Send, Sparkles, Scale, CheckCircle2, ShieldCheck, FileText, Lightbulb } from 'lucide-react';
import { regulatoryService } from '../services/regulatory';
import { RegulatoryQueryResponse } from '../types/regulatory';
import { MetrologyScaleIllustration, LegalRuleBooksIllustration } from '../components/BrandingAssets';

export const RegulatoryAssistantPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RegulatoryQueryResponse | null>(null);

  const suggestedQueries = [
    'What are the mandatory MRP declaration rules?',
    'Net quantity declaration metric requirements',
    'Country of Origin rules for imported packages',
    'Consumer care contact details requirements',
    'Penalties under Section 36 of Legal Metrology Act',
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
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-ivory-100 via-sand-100 to-sage-50 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-md">
          <BookOpen className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold font-serif text-slate-900">
          Grounded Legal Metrology Regulatory Assistant
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto font-sans">
          Query statutory provisions from the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011 with direct legal section citations.
        </p>
      </div>

      {/* Main Research Desk Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Visual Illustrations & Side Badges */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-xs text-center space-y-4">
            <MetrologyScaleIllustration className="w-40 h-40 mx-auto" />
            <LegalRuleBooksIllustration className="w-full" />
          </div>

          <div className="bg-ivory-50 rounded-2xl p-4 border border-sand-300 space-y-3">
            <div className="flex items-center space-x-2.5 text-xs text-slate-800">
              <FileText className="w-4 h-4 text-forest-700 shrink-0" />
              <span className="font-bold">Authoritative Legal References</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-800">
              <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
              <span className="font-bold">Rule-Based Statutory Guidance</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-800">
              <Scale className="w-4 h-4 text-forest-700 shrink-0" />
              <span className="font-bold">Direct Section & Clause Citations</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-800">
              <Lightbulb className="w-4 h-4 text-forest-700 shrink-0" />
              <span className="font-bold">Supports Compliance Decisions</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Query Box & Responses */}
        <div className="lg:col-span-8 space-y-6">
          {/* Suggested Query Chips */}
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(sq)}
                className="text-xs bg-white hover:bg-forest-50 text-forest-800 border border-sand-300 px-3.5 py-2 rounded-full transition-all font-semibold flex items-center gap-1.5 shadow-2xs hover:border-forest-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                <span>{sq}</span>
              </button>
            ))}
          </div>

          {/* Query Form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about Legal Metrology rules (e.g. MRP, Net Quantity, Expiry date format)..."
              className="w-full pl-5 pr-14 py-3.5 bg-white border border-sand-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-sm font-sans"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1.5 bg-forest-700 hover:bg-forest-600 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
            </div>
          )}

          {/* Response Display */}
          {response && !loading && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-forest-700 uppercase tracking-wider">
                  <Scale className="w-4 h-4" />
                  <span>Grounded Statutory Answer</span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed bg-ivory-50 p-4 rounded-xl border border-sand-200 font-sans">
                  {response.answer}
                </p>
              </div>

              {/* Matched Legal Sections */}
              {response.matched_sections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Reference Citations</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {response.matched_sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-white border border-sand-300 rounded-2xl p-5 space-y-2 shadow-xs hover:border-forest-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-forest-800 bg-forest-100 px-3 py-1 rounded-full border border-forest-200">
                            {sec.act_or_rule} — {sec.section_number}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-mono font-bold">
                            {(sec.relevance_score * 100).toFixed(0)}% Relevance Match
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 pt-1 font-sans">{sec.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{sec.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
