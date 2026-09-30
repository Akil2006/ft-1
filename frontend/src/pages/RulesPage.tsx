import React, { useEffect, useState } from 'react';
import { rulesApi } from '../services/rules';
import { Rule } from '../types/compliance';
import { BookOpen, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { LegalRuleBooksIllustration } from '../components/BrandingAssets';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await rulesApi.listRules();
        setRules(data);
      } catch (err) {
        console.error('Failed to load rules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-sand-300/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold border border-sage-300">
            <BookOpen className="w-3.5 h-3.5 text-forest-700" />
            <span>Statutory Rule Register</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
            Legal Metrology Compliance Rules
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Deterministic statutory screening rule definitions governed by the Legal Metrology (Packaged Commodities) Rules, 2011 (Ruleset v2026.01).
          </p>
        </div>

        <div className="hidden md:flex flex-shrink-0 w-36 h-28 items-center justify-center">
          <LegalRuleBooksIllustration className="w-full h-full text-forest-800" />
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-5">
        {rules.map((rule) => (
          <div
            key={rule.rule_id}
            className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-4 hover:border-sand-400 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-forest-800 bg-sage-100 px-3 py-1 rounded-lg border border-sage-300">
                  {rule.rule_id}
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900">{rule.rule_title}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-sand-200 text-slate-700 px-2.5 py-1 rounded-md border border-sand-300 font-semibold">
                  Severity: {rule.severity}
                </span>
                <span className="text-[10px] font-mono font-semibold text-forest-700 bg-sage-50 px-2.5 py-1 rounded-md border border-sage-200">
                  v{rule.rule_version}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-sans">{rule.requirement}</p>

            <div className="pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Target Declaration:{' '}
                <strong className="text-slate-900 font-mono uppercase bg-sand-100 px-2 py-0.5 rounded border border-sand-200">
                  {rule.field}
                </strong>
              </span>
              <span className="font-mono text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                Source: {rule.source_document}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

