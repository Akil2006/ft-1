import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Send,
  Scale,
  CheckCircle2,
  ShieldCheck,
  FileText,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  Search,
  Globe,
  Users,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import { regulatoryService } from '../services/regulatory';
import { ChatMessage, RegulatorySection } from '../types/regulatory';
import { MetrologyScaleIllustration, LegalRuleBooksIllustration } from '../components/BrandingAssets';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `**Hello! I am your Legal Metrology & Packaging Compliance AI Assistant.** 🌿

I am trained on the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011**. 

Rather than just showing raw rules, I provide **direct, actionable answers** to your specific questions, explain what the law requires, detail statutory penalties under **Section 36 & 39**, and provide practical compliance steps.

### Ask me about:
- **Mandatory Label Declarations** (MRP, Net Quantity, Expiry, Origin, Consumer Care)
- **Eligibility & Permissions** ("Can I sell without MRP?", "Are sample packs exempt?")
- **Statutory Penalties & Fines** (Section 36 offenses, compounding, director liability)
- **Formatting Standards** (Permitted units like \`g\` vs \`gms\`, \`MM/YYYY\` date format, Rule 8 font heights)
- **E-Commerce & Imports** (Mandatory declarations for online marketplace listings and customs)

How can I help you today? Type a question below or pick a suggested topic to get started!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggested_followups: [
    'Can I sell a biscuit pack without MRP?',
    'What are the mandatory declarations on pre-packaged goods?',
    'What is the penalty under Section 36 for non-compliance?',
    'What are the rules for imported packages?',
    'How should net quantity be declared in grams?'
  ]
};

const SUGGESTED_PILLS = [
  { text: 'Can I sell without MRP?', icon: Search },
  { text: 'How to write net quantity in grams?', icon: BarChart2 },
  { text: 'Country of Origin rules for imported packages', icon: Globe },
  { text: 'Consumer care contact details requirements', icon: Users },
  { text: 'What is the penalty under Section 36?', icon: Scale },
  { text: 'What font size is required under Rule 8?', icon: FileText },
];

export const RegulatoryAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleCitation = (messageId: string) => {
    setExpandedCitations(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleCopy = (messageId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([{
      ...INITIAL_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setExpandedCitations({});
    setInputQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Prepare previous conversation history for the API
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await regulatoryService.queryAssistant(textToSend, conversationHistory);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matched_sections: res.matched_sections,
        suggested_followups: res.suggested_followups
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to query regulatory assistant', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**I encountered an issue connecting to the regulatory engine.**\n\nPlease ensure the backend service is running and try again, or ask a question regarding Legal Metrology declarations (MRP, Net Quantity, Expiry, Country of Origin, Consumer Care).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_followups: [
          'What are the mandatory declarations on pre-packaged goods?',
          'What is the penalty under Section 36?',
          'Can I sell without MRP?'
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1.5 font-serif flex items-center gap-1.5 border-b border-sand-200/60 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#14532D]" />
            <span>{formatInline(trimmed.replace(/^###\s+/, ''))}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-900 text-base mt-3.5 mb-2 font-serif">
            {formatInline(trimmed.replace(/^##\s+/, ''))}
          </h3>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-emerald-600 bg-emerald-50/70 pl-3.5 py-2 my-2 text-xs italic text-slate-800 rounded-r-xl">
            {formatInline(trimmed.replace(/^>\s+/, ''))}
          </blockquote>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 my-1 ml-1 leading-relaxed">
            <span className="text-[#14532D] font-bold text-base leading-none select-none">•</span>
            <span className="flex-1">{formatInline(trimmed.substring(2))}</span>
          </div>
        );
      }
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 my-1 ml-1 leading-relaxed">
            <span className="font-bold text-[#14532D] shrink-0 text-xs mt-0.5 bg-emerald-100/70 px-1.5 py-0.5 rounded select-none">
              {numberedMatch[1]}
            </span>
            <span className="flex-1">{formatInline(numberedMatch[2])}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-1 font-sans">
          {formatInline(trimmed)}
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-emerald-50 text-[#14532D] font-mono text-[11px] px-1.5 py-0.5 rounded border border-emerald-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-2 font-sans space-y-4">
      {/* Top Banner & Desk Illustration Header */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-ivory-100 to-sand-100 rounded-3xl p-5 sm:p-6 border border-sand-300 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#14532D] text-white flex items-center justify-center shadow-md border-2 border-emerald-300 shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Legal Metrology <span className="text-[#14532D]">AI Assistant</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Chatbot
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Answers your packaging compliance questions directly, grounded in the Legal Metrology Act, 2009 & PCR, 2011.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearChat}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-sand-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-sand-200/80">
          <div className="bg-white/80 rounded-xl p-2 border border-sand-300/80 shadow-2xs flex items-center gap-2 text-[11px] font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
            <span>Direct Answers</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-sand-300/80 shadow-2xs flex items-center gap-2 text-[11px] font-bold text-slate-800">
            <Scale className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
            <span>Section Citations</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-sand-300/80 shadow-2xs flex items-center gap-2 text-[11px] font-bold text-slate-800">
            <AlertTriangle className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
            <span>Penalties Guidance</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-sand-300/80 shadow-2xs flex items-center gap-2 text-[11px] font-bold text-slate-800">
            <FileText className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
            <span>Rule-Based Reasoning</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCitationsOpen = !!expandedCitations[msg.id];
            const hasCitations = msg.matched_sections && msg.matched_sections.length > 0;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-[#14532D] text-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-300 mt-1">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Bubble Content */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${isUser ? 'text-right' : 'text-left'}`}>
                  {/* Sender Name & Timestamp */}
                  <div className={`flex items-center gap-2 text-[11px] font-medium text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{isUser ? 'You' : 'Legal Metrology Assistant'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Bubble Box */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                      isUser
                        ? 'bg-[#0F392B] text-white rounded-tr-xs'
                        : 'bg-white border border-sand-300 text-slate-900 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap font-sans text-left leading-relaxed">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="space-y-1 font-sans">
                        {renderFormattedText(msg.content)}
                      </div>
                    )}
                  </div>

                  {/* Assistant Actions Bar: Copy + Citations Accordion */}
                  {!isUser && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-sand-200 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>

                        {/* Collapsible Citations Toggle */}
                        {hasCitations && (
                          <button
                            onClick={() => toggleCitation(msg.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#14532D] bg-[#E6F4EA] hover:bg-emerald-100 transition-colors border border-[#A7F3D0] cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#14532D]" />
                            <span>
                              {msg.matched_sections!.length} Statutory {msg.matched_sections!.length === 1 ? 'Reference' : 'References'}
                            </span>
                            {isCitationsOpen ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#14532D]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#14532D]" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Expanded Statutory Citations Drawer */}
                      {!isUser && hasCitations && isCitationsOpen && (
                        <div className="bg-[#FAF9F5] border border-sand-300 rounded-2xl p-3.5 sm:p-4 space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-sand-200">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                              Official Grounded Statutory Sections
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {msg.matched_sections!.map((sec: RegulatorySection) => (
                              <div
                                key={sec.id}
                                className="bg-white rounded-xl p-3 border border-sand-300/80 shadow-2xs space-y-1.5 text-left"
                              >
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                  <span className="text-[11px] font-mono font-bold text-[#14532D] bg-[#E6F4EA] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                                    {sec.act_or_rule} — {sec.section_number}
                                  </span>
                                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                                    {(sec.relevance_score * 100).toFixed(0)}% match
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 font-sans">{sec.title}</h5>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{sec.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Follow-up Questions Chips */}
                      {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#14532D]" />
                            Suggested Follow-up Questions:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggested_followups.map((followup, fIdx) => (
                              <button
                                key={fIdx}
                                onClick={() => handleSendMessage(followup)}
                                className="bg-white hover:bg-emerald-50 text-[#14532D] hover:text-[#0F392B] border border-emerald-200/90 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-2xs cursor-pointer text-left hover:border-emerald-400"
                              >
                                ↳ {followup}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Typing Indicator Bubble */}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-9 h-9 rounded-xl bg-[#14532D] text-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-300 mt-1">
                <Scale className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white border border-sand-300 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2 max-w-[80%]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#14532D]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Regulatory Assistant is analyzing Legal Metrology rules...</span>
                </div>
                <div className="flex gap-1.5 items-center pl-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Area */}
        <div className="p-4 bg-sand-50/60 border-t border-sand-300 space-y-3">
          {/* Quick Pill Suggestions Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-slate-600 shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-[#14532D]" /> Quick Topics:
            </span>
            {SUGGESTED_PILLS.map((pill, pIdx) => {
              const IconComp = pill.icon;
              return (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(pill.text)}
                  disabled={loading}
                  className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#14532D] border border-sand-300 hover:border-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconComp className="w-3 h-3 text-[#14532D]" />
                  <span>{pill.text}</span>
                </button>
              );
            })}
          </div>

          {/* Text Input Box Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-2 border border-slate-300 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-forest-600/30 focus-within:border-forest-600 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask any question about Legal Metrology, packaging rules, MRP, penalties, or compliance..."
              disabled={loading}
              className="w-full bg-transparent pl-3 pr-2 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-sans focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-[#0F392B] hover:bg-[#16503d] disabled:opacity-40 text-white p-3 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center"
              title="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center font-sans">
            AI Assistant answers are grounded in the official Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
          </p>
        </div>
      </div>
    </div>
  );
};
