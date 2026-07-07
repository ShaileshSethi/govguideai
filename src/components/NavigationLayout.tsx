"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

import { signOut } from 'next-auth/react';

export default function NavigationLayout({ children, user }: { children: React.ReactNode, user?: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8] text-[#111827] font-sans selection:bg-[#DBEAFE] selection:text-[#2563EB]">

      {/* Sidebar Overlay (Mobile & Desktop) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Side Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] justify-between">
          <Link href="/" className="text-xl font-bold text-[#111827] hover:text-[#2563EB] transition-colors">
            {t('home.title')}
          </Link>
          <button className="text-gray-500 hover:text-gray-900 focus:outline-none bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/' ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {t('nav.home')}
          </Link>
          <Link
            href="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/profile' ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {t('nav.profile')}
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/settings' ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t('nav.settings')}
          </Link>
        </nav>
        <div className="p-6 border-t border-[#E5E7EB]">
          {user ? (
            <div className="flex flex-col space-y-4">
              <Link href="/profile" className="flex items-center group cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#2563EB] font-bold group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors truncate w-32">{user.name}</p>
                  <p className="text-xs text-gray-500">Premium Tier</p>
                </div>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-left font-medium text-red-600 hover:text-red-700 transition-colors w-full"
              >
                {t('nav.signout')}
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center justify-center space-x-2 bg-[#111827] text-white hover:bg-gray-800 py-3 rounded-xl transition-colors font-bold shadow-sm">
              {t('nav.signin')}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth w-full">

        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] h-16 flex items-center px-4 sm:px-6 justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] rounded-md p-1 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link href="/" className="ml-4 text-xl font-bold text-[#111827] hover:text-[#2563EB] transition-colors hidden sm:block">
              {t('home.title')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block p-2 font-medium cursor-pointer outline-none shadow-sm hidden md:block focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            <Link href="/feedback" className="hidden sm:block text-gray-600 hover:text-[#2563EB] text-sm font-bold transition-colors">
              {t('nav.feedback')}
            </Link>
            {!user && (
              <Link href="/login" className="bg-[#2563EB] text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                {t('nav.signin')}
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-12 pb-24">
          <div className="max-w-4xl mx-auto">
            {children}

            {/* Legal Disclaimer Footer */}
            <footer className="mt-16 pt-8 border-t border-[#E5E7EB] pb-8">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex items-start space-x-4">
                <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full mt-1">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827] mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    GovGuide AI is an independent, unofficial assistance tool designed to help citizens understand public procedures.
                    <strong> We are not affiliated with, endorsed by, or operated by any government entity.</strong> We do not store, own, or process any of your official documents. This platform is strictly for informational and guidance purposes. Always verify application processes and fees on official government websites.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
