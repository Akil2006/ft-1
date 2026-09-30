import React, { useEffect, useState } from 'react';
import { rulesApi } from '../services/rules';
import { Rule } from '../types/compliance';
import { Scale, Search, Filter, ArrowRight, BookOpen, ShieldCheck, X } from 'lucide-react';
import { LegalRuleBooksIllustration, MetrologyScaleIllustration } from '../components/BrandingAssets';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  // Default fallback rules matching reference screenshot exactly
  const defaultRules: Rule[] = [
    {
      rule_id: 'LM-NAME-001',
      rule_title: 'Common or Generic Commodity Name Declaration',
      requirement: 'Every package shall bear the generic or common name of the commodity contained within.',
      field: 'PRODUCT_NAME',
      severity: 'HIGH',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'TEXT_REGEX',
      exceptions: [],
    },
    {
      rule_id: 'LM-NQ-001',
      rule_title: 'Net Quantity Declaration',
      requirement: 'Every package shall declare the net quantity in terms of standard unit of weight, measure, or number.',
      field: 'NET_QUANTITY',
      severity: 'CRITICAL',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'UNIT_CHECK',
      exceptions: [],
    },
    {
      rule_id: 'LM-DATE-001',
      rule_title: 'Month and Year of Manufacture / Packing',
      requirement: 'Every package shall state the month and year in which the commodity is manufactured or packed.',
      field: 'MANUFACTURING_DATE',
      severity: 'HIGH',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'DATE_FORMAT',
      exceptions: [],
    },
    {
      rule_id: 'LM-MRP-001',
      rule_title: 'Maximum Retail Price (MRP) Declaration',
      requirement: 'Declaration of Maximum Retail Price (MRP) inclusive of all taxes.',
      field: 'MRP',
      severity: 'CRITICAL',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'CURRENCY_CHECK',
      exceptions: [],
    },
    {
      rule_id: 'LM-ADDR-001',
      rule_title: 'Manufacturer / Packer Name and Address',
      requirement: 'Name and complete address of the manufacturer, packer, or importer must be clearly declared.',
      field: 'MANUFACTURER_ADDRESS',
      severity: 'HIGH',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'ADDRESS_CHECK',
      exceptions: [],
    },
    {
      rule_id: 'LM-COO-001',
      rule_title: 'Country of Origin Declaration for Imported Goods',
      requirement: 'Country of Origin must be explicitly declared on packages containing imported commodities.',
      field: 'COUNTRY_OF_ORIGIN',
      severity: 'MEDIUM',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'COUNTRY_MATCH',
      exceptions: [],
    },
    {
      rule_id: 'LM-CC-001',
      rule_title: 'Consumer Care Contact Details',
      requirement: 'Name, address, telephone number, and email ID of the person/office to be contacted in case of consumer complaints.',
      field: 'CONSUMER_CARE',
      severity: 'HIGH',
      rule_version: '2026.01',
      source_document: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      applicability: {},
      validation_method: 'CONTACT_CHECK',
      exceptions: [],
    },
  ];

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await rulesApi.listRules();
        if (data && data.length > 0) {
          setRules(data);
        } else {
          setRules(defaultRules);
        }
      } catch (err) {
        console.error('Failed to load rules, using statutory fallbacks', err);
        setRules(defaultRules);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  // Filter rules based on search query, severity, and category
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchQuery === '' ||
      rule.rule_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.field.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || rule.severity.toUpperCase() === severityFilter.toUpperCase();

    return matchesSearch && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14532D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-ivory-100 to-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-14 h-14 rounded-full bg-[#E6F4EA] border border-[#A7F3D0] flex items-center justify-center text-[#14532D] shadow-xs shrink-0">
            <Scale className="w-7 h-7 text-[#14532D]" />
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-slate-900">Legal Metrology </span>
              <span className="text-[#14532D]">Compliance Rules</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1 font-sans">
              Deterministic compliance rules under Legal Metrology (Packaged Commodities) Rules, 2011 (v2026.01)
            </p>
          </div>
        </div>

        {/* Right Decorative Graphic */}
        <div className="hidden md:flex items-center space-x-3 shrink-0 z-10">
          <LegalRuleBooksIllustration className="w-56 h-36" />
          <MetrologyScaleIllustration className="w-24 h-24 text-amber-700" />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-sand-300 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search Field */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules by name, code, or declaration..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Severity Filter Dropdown */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="w-full sm:w-44 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-sans font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-forest-600/30 cursor-pointer"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {/* Category Filter Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-44 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-sans font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-forest-600/30 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="MANDATORY">Mandatory Declarations</option>
          <option value="DIMENSIONS">Dimensions & Font Size</option>
          <option value="IMPORTER">Importer Details</option>
          <option value="QUANTITY">Net Quantity & Units</option>
        </select>

        {/* Filter Icon Button */}
        <button
          onClick={() => {
            setSearchQuery('');
            setSeverityFilter('ALL');
            setCategoryFilter('ALL');
          }}
          title="Reset Filters"
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer flex items-center justify-center shrink-0 transition-colors"
        >
          <Filter className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.rule_id}
            className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3.5 hover:border-forest-400 transition-all"
          >
            {/* Top Row: Code Tag + Title | Severity + Version + View Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="bg-[#E0F2FE] text-[#0284C7] font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-[#BAE6FD] shrink-0">
                  {rule.rule_id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-sans leading-snug">
                  {rule.rule_title}
                </h3>
              </div>

              <div className="flex items-center space-x-2.5 shrink-0">
                {/* Severity Pill */}
                <span
                  className={`font-sans font-bold text-[10px] uppercase px-3 py-1 rounded-md border ${
                    rule.severity.toUpperCase() === 'CRITICAL'
                      ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                      : 'bg-[#E2E8F0] text-[#334155] border-slate-300'
                  }`}
                >
                  {rule.severity}
                </span>

                {/* Version Pill */}
                <span className="bg-[#14532D] text-white font-mono font-bold text-[10px] px-3 py-1 rounded-md">
                  v{rule.rule_version || '2026.01'}
                </span>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedRule(rule)}
                  className="bg-[#E6F4EA] hover:bg-[#D4EDDA] text-[#14532D] font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row: Rule Requirement Description */}
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              {rule.requirement}
            </p>

            {/* Bottom Row: Target Declaration Badge & Source Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-sand-200/80 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Target Declaration:</span>
                <span className="bg-[#D8F3DC] text-[#14532D] font-mono font-bold text-[10px] uppercase px-2.5 py-0.5 rounded border border-[#B7E4C7]">
                  {rule.field}
                </span>
              </div>

              <div className="text-slate-500 text-xs font-sans">
                Source Doc:{' '}
                <span className="text-slate-700 font-medium">{rule.source_document}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-sand-300 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedRule(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <span className="bg-[#E0F2FE] text-[#0284C7] font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-[#BAE6FD]">
                {selectedRule.rule_id}
              </span>
              <span className="bg-[#14532D] text-white font-mono font-bold text-[10px] px-3 py-1 rounded-md">
                v{selectedRule.rule_version || '2026.01'}
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-slate-900">{selectedRule.rule_title}</h3>

            <div className="bg-ivory-50 rounded-2xl p-4 border border-sand-200 space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
              <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-[#14532D]">
                Statutory Requirement:
              </p>
              <p>{selectedRule.requirement}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Target Field</span>
                <span className="font-mono font-bold text-[#14532D]">{selectedRule.field}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Severity Level</span>
                <span className="font-bold text-slate-900">{selectedRule.severity}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-sand-200">
              <strong>Source Authority:</strong> {selectedRule.source_document}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
