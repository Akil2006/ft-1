import React, { useEffect, useState } from 'react';
import { rulesApi } from '../services/rules';
import { Rule } from '../types/compliance';

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Legal Metrology Compliance Rules</h1>
        <p className="text-xs text-slate-400">
          Deterministic compliance rules under Legal Metrology (Packaged Commodities) Rules, 2011 (v2026.01)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.rule_id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded border border-blue-800/50">
                  {rule.rule_id}
                </span>
                <h3 className="text-base font-bold text-white">{rule.rule_title}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {rule.severity}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  v{rule.rule_version}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{rule.requirement}</p>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Target Declaration: <strong className="text-slate-200 uppercase">{rule.field}</strong></span>
              <span className="font-mono text-slate-400">Source Doc: {rule.source_document}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
