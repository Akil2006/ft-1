import React, { useState } from 'react';
import { BookOpen, Send, Sparkles, Scale, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { regulatoryService } from '../services/regulatory';
import { RegulatoryQueryResponse, RegulatorySection } from '../types/regulatory';

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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Grounded Legal Metrology Regulatory Assistant
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Query statutory provisions from the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011 with direct legal section citations.
        </p>
      </div>

      {/* Suggested Queries Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestedQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSearch(sq)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 px-3.5 py-1.5 rounded-full transition-colors font-medium flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{sq}</span>
          </button>
        ))}
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about Legal Metrology rules (e.g. MRP, Net Quantity, Expiry date format)..."
          className="w-full pl-5 pr-14 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-lg shadow transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Assistant Response grounded card */}
      {response && !loading && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Grounded Statutory Response</span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
              {response.answer}
            </p>
          </div>

          {/* Matched Legal Sections */}
          {response.matched_sections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Statutory Reference Citations</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {response.matched_sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/50">
                        {sec.act_or_rule} — {sec.section_number}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        {(sec.relevance_score * 100).toFixed(0)}% Relevance Match
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white pt-1">{sec.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{sec.text}</p>
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
