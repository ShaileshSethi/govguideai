"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type Document = {
  name: string;
  mandatory: boolean;
  purpose: string;
  where_to_get: string;
  issuing_authority: string;
  official_link: string;
};

type Service = {
  name: string;
  description: string;
  required_documents: Document[];
  application_steps: string[];
  processing_time: string;
  application_fee: string;
  official_apply_link: string;
  official_information_link: string;
};

type ActionPlan = {
  isClarificationNeeded?: boolean;
  clarificationMessage?: string;
  summary: string;
  services: Service[];
  next_steps: string[];
  tips: string[];
};

const SUGGESTED_QUESTIONS = [
  { icon: "🛂", text: 'search.passport' },
  { icon: "🪪", text: 'search.pan' },
  { icon: "🚗", text: 'search.driving' },
  { icon: "🔐", text: 'search.aadhaar' }
];

const LOADING_MESSAGES = [
  "Analyzing your request...",
  "Finding government services...",
  "Collecting required documents...",
  "Preparing your action plan..."
];

export default function Home() {
  const { language, t } = useLanguage();
  const [category, setCategory] = useState('General Issue');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [result, setResult] = useState<ActionPlan | null>(null);
  const [error, setError] = useState('');

  // Track checked state: serviceIndex -> documentIndex -> boolean
  const [checkedDocs, setCheckedDocs] = useState<Record<number, Record<number, boolean>>>({});

  // UI State
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({});
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setLoading(true);
    setError('');
    setResult(null);
    setCheckedDocs({});
    setExpandedServices({ 0: true }); // Auto-expand the first service

    try {
      const combinedQuery = `Language Request: ${language === 'hi' ? 'Hindi' : 'English'}. Category: ${category}. Problem: ${searchQuery}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: combinedQuery, language }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate action plan. Please try again.');
      }

      const data = await res.json();
      setResult(data);

      // Save to localStorage if not clarification
      if (!data.isClarificationNeeded && data.services) {
        const historyStr = localStorage.getItem('govguide_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        const newPlan = {
          id: Date.now().toString(),
          title: searchQuery.slice(0, 50) + (searchQuery.length > 50 ? '...' : ''),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          icon: SUGGESTED_QUESTIONS.find(q => q.text === searchQuery)?.icon || '📄',
          data: data
        };
        localStorage.setItem('govguide_history', JSON.stringify([newPlan, ...history].slice(0, 10)));
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (serviceIdx: number, docIdx: number) => {
    setCheckedDocs(prev => ({
      ...prev,
      [serviceIdx]: {
        ...(prev[serviceIdx] || {}),
        [docIdx]: !prev[serviceIdx]?.[docIdx]
      }
    }));
  };

  const toggleServiceExpand = (index: number) => {
    setExpandedServices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      {/* Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground bg-muted hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 className="text-2xl font-bold text-[#111827] mb-6 border-b border-[#E5E7EB] pb-4">{selectedDoc.name}</h3>

            <div className="space-y-5">
              <div>
                <span className="block text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-1">Why it is needed</span>
                <p className="text-foreground font-medium">{selectedDoc.purpose}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-1">Where to obtain it</span>
                <p className="text-foreground font-medium">{selectedDoc.where_to_get}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-1">Issuing Authority</span>
                  <p className="text-foreground font-medium">{selectedDoc.issuing_authority}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-1">Mandatory</span>
                  <p className="text-foreground font-medium">{selectedDoc.mandatory ? "Yes" : "No"}</p>
                </div>
              </div>
              {selectedDoc.official_link && (
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <a href={selectedDoc.official_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-[#EFF6FF] border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white font-bold py-3 rounded-xl transition-colors">
                    <span>Visit Official Source</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State / Search Header */}
      {!result && !loading && (
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#111827]">
            {t('home.title')}
          </h1>
          <h3 className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            {t('home.subtitle')}
          </h3>
        </div>
      )}

      {/* Search Section */}
      <div className={`transition-all duration-700 max-w-4xl mx-auto ${result ? 'mb-10' : 'mb-12'}`}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className={`relative flex flex-col md:flex-row items-center bg-card rounded-3xl md:rounded-full border-2 border-[#E5E7EB] shadow-lg hover:shadow-xl transition-all duration-300 focus-within:ring-4 focus-within:ring-[#DBEAFE] focus-within:border-[#2563EB] ${result ? 'shadow-md' : 'shadow-xl'}`}
        >
          <div className="flex w-full md:w-auto border-b-2 md:border-b-0 md:border-r-2 border-[#E5E7EB]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48 bg-transparent py-4 px-6 text-[#111827] font-bold focus:outline-none appearance-none cursor-pointer rounded-t-3xl md:rounded-l-full md:rounded-tr-none hover:bg-muted transition-colors"
              disabled={loading}
            >
              <option value="General Issue">{t('cat.general')}</option>
              <option value="Identity Documents">{t('cat.identity')}</option>
              <option value="Family & Marriage">{t('cat.family')}</option>
              <option value="Vehicles & Transport">{t('cat.vehicle')}</option>
              <option value="Property & Housing">{t('cat.property')}</option>
              <option value="Business & Taxes">{t('cat.business')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center">
            <div className="pl-6 pr-3 text-muted-foreground hidden lg:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('home.placeholder')}
              className="w-full bg-transparent py-4 md:py-5 pl-6 lg:pl-0 pr-4 text-lg text-[#111827] placeholder-gray-400 focus:outline-none rounded-b-3xl md:rounded-r-full md:rounded-bl-none"
              disabled={loading}
            />
          </div>

          <div className="p-2 w-full md:w-auto">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-8 py-3.5 md:py-4 rounded-2xl md:rounded-full transition-transform duration-200 active:scale-95 disabled:opacity-60 disabled:active:scale-100 whitespace-nowrap flex items-center justify-center shadow-md"
            >
              {loading ? '...' : t('home.button')}
            </button>
          </div>
        </form>

      </div>

      {/* Empty State / Loading State */}
      {!result && (
        <div className="mt-8 text-center flex flex-col items-center justify-center min-h-[20vh]">
          {loading ? (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <div className="relative w-16 h-16 mb-6">
                <svg className="animate-spin text-[#E5E7EB]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                </svg>
                <svg className="animate-spin absolute top-0 left-0 text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-lg text-muted-foreground font-bold">{LOADING_MESSAGES[loadingMessageIdx]}</p>
            </div>
          ) : error ? (
            <div className="bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] p-5 rounded-2xl flex items-center max-w-lg mx-auto">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div className="text-left">
                <span className="font-bold block">We didn't quite understand that.</span>
                <span className="font-medium text-sm">{error} Can you provide more details?</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Suggested Questions (Bottom of page when empty) */}
      {!result && !loading && (
        <div className="mt-16 text-center animate-in fade-in duration-1000 delay-150">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('home.suggestions')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(q.text)}
                className="flex items-center space-x-2 bg-card border border-[#E5E7EB] text-[#111827] px-4 py-2 rounded-full text-sm font-medium hover:border-[#2563EB] hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>{q.icon}</span>
                <span>{t(q.text)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clarification State */}
      {result && result.isClarificationNeeded && (
        <div className="mt-8 bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] p-8 rounded-3xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-500 shadow-sm">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#FDE68A]">
            <span className="text-3xl">🤔</span>
          </div>
          <h2 className="text-xl font-bold mb-2">We need a little more detail</h2>
          <p className="text-lg font-medium leading-relaxed">{result.clarificationMessage}</p>
        </div>
      )}

      {/* Results Dashboard */}
      {result && !result.isClarificationNeeded && result.services && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* 1. Summary Card */}
          <section className="bg-[#EFF6FF] border border-[#DBEAFE] p-8 rounded-3xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#111827] flex items-center">
                <span className="bg-card p-2 rounded-xl shadow-sm mr-3">🗺️</span>
                {t('plan.summary')}
              </h2>
            </div>
            <p className="text-lg text-[#1E3A8A] leading-relaxed font-bold">
              {result.summary}
            </p>
          </section>

          {/* 2. Government Service Cards */}
          <section>
            <h3 className="text-xl font-bold text-[#111827] mb-5 border-b border-[#E5E7EB] pb-2">{t('plan.services')}</h3>
            <div className="space-y-6">
              {result.services.map((service, serviceIdx) => (
                <div key={serviceIdx} className="bg-card border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
                  <div
                    className="p-6 md:p-8 cursor-pointer hover:bg-muted flex items-center justify-between"
                    onClick={() => toggleServiceExpand(serviceIdx)}
                  >
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center text-2xl mr-5 shadow-sm">🏛️</div>
                      <div>
                        <h4 className="text-2xl font-bold text-[#111827] mb-1">{service.name}</h4>
                        <p className="text-muted-foreground font-medium">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      <svg className={`w-6 h-6 transform transition-transform ${expandedServices[serviceIdx] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {expandedServices[serviceIdx] && (
                    <div className="bg-muted p-6 md:p-8 border-t border-[#E5E7EB] animate-in slide-in-from-top-4 duration-300">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-card p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
                          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('plan.time')}</span>
                          <span className="text-lg font-bold text-[#111827]">{service.processing_time}</span>
                        </div>
                        <div className="bg-card p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
                          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('plan.fee')}</span>
                          <span className="text-lg font-bold text-[#111827]">{service.application_fee}</span>
                        </div>
                      </div>

                      {/* Document Checklist for this service */}
                      <h5 className="text-lg font-bold text-[#111827] mb-4">{t('plan.docs')}</h5>
                      <div className="space-y-3 mb-8">
                        {service.required_documents.map((doc, docIdx) => (
                          <div
                            key={docIdx}
                            className={`bg-card border p-4 rounded-2xl transition-all duration-200 flex items-center justify-between shadow-sm ${checkedDocs[serviceIdx]?.[docIdx] ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#E5E7EB] hover:border-gray-300'}`}
                          >
                            <label className="flex items-center flex-grow cursor-pointer group">
                              <div className="flex-shrink-0 mr-4 relative">
                                <input
                                  type="checkbox"
                                  checked={!!checkedDocs[serviceIdx]?.[docIdx]}
                                  onChange={() => toggleCheck(serviceIdx, docIdx)}
                                  className={`w-6 h-6 rounded-md border-2 appearance-none cursor-pointer transition-colors focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${checkedDocs[serviceIdx]?.[docIdx] ? 'bg-[#22C55E] border-[#22C55E]' : 'bg-card border-gray-300 group-hover:border-gray-400'}`}
                                />
                                {checkedDocs[serviceIdx]?.[docIdx] && (
                                  <svg className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </div>
                              <div>
                                <h4 className={`text-lg font-bold transition-colors ${checkedDocs[serviceIdx]?.[docIdx] ? 'text-muted-foreground line-through' : 'text-[#111827]'}`}>
                                  {doc.name} {!doc.mandatory && <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">Optional</span>}
                                </h4>
                              </div>
                            </label>

                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="flex items-center text-[#2563EB] font-bold text-sm bg-[#EFF6FF] hover:bg-[#DBEAFE] px-4 py-2 rounded-xl transition-colors ml-4"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Info
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Step-by-Step Guide for this service */}
                      <h5 className="text-lg font-bold text-[#111827] mb-4">{t('plan.steps')}</h5>
                      <div className="bg-card border border-[#E5E7EB] p-6 rounded-2xl shadow-sm mb-6">
                        <div className="relative border-l-2 border-[#E5E7EB] ml-4 space-y-6">
                          {service.application_steps.map((step, idx) => (
                            <div key={idx} className="relative pl-8 group">
                              <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-card border-2 border-[#2563EB] flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors duration-300">
                                <span className="text-xs font-bold text-[#2563EB] group-hover:text-white">{idx + 1}</span>
                              </div>
                              <p className="text-foreground font-medium pt-1 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Official Link */}
                      <div className="flex gap-4">
                        <a href={service.official_apply_link} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-[#2563EB] text-white hover:bg-blue-700 font-bold py-3.5 rounded-xl transition-colors shadow-md">
                          {t('plan.visit')}
                        </a>
                        {service.official_information_link && service.official_information_link !== service.official_apply_link && (
                          <a href={service.official_information_link} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-card border border-[#E5E7EB] text-foreground hover:bg-muted font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                            {t('plan.more_info')}
                          </a>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Global Tips & Next Steps */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.next_steps && result.next_steps.length > 0 && (
              <div className="bg-card border border-[#E5E7EB] p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-[#111827] mb-5 flex items-center">
                  <span className="bg-muted p-1.5 rounded-lg mr-2">🚀</span> {t('plan.next')}
                </h3>
                <ul className="space-y-4">
                  {result.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start text-foreground">
                      <span className="mr-3 mt-1 text-[#2563EB] font-bold">{idx + 1}.</span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-[#B45309] mb-5 flex items-center">
                  <span className="bg-card/50 p-1.5 rounded-lg mr-2">💡</span> {t('plan.tips')}
                </h3>
                <ul className="space-y-4">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start text-[#92400E]">
                      <span className="mr-3 mt-1 text-[#F59E0B]">•</span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
