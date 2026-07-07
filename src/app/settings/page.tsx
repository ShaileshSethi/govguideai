"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [textSize, setTextSize] = useState('Medium');

  const handleDownloadData = () => {
    const historyStr = localStorage.getItem('govguide_history');
    if (!historyStr || historyStr === '[]') {
      toast.error('No action plans to export.');
      return;
    }
    const blob = new Blob([historyStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `govguide_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Your data has been exported!');
  };

  const handleLogOutAll = () => {
    localStorage.clear();
    toast.success('Logged out of all devices');
    setTimeout(() => signOut({ callbackUrl: '/login' }), 1000);
  };

  const handleDeleteAccount = () => {
    if(confirm('Are you sure you want to permanently delete your account and all saved plans?')) {
      localStorage.clear();
      toast.success('Account deleted successfully.');
      setTimeout(() => signOut({ callbackUrl: '/login' }), 1000);
    }
  };

  const changeTextSize = (size: string) => {
    setTextSize(size);
    document.documentElement.classList.remove('text-[14px]', 'text-[16px]', 'text-[18px]');
    if (size === 'Small') document.documentElement.classList.add('text-[14px]');
    if (size === 'Medium') document.documentElement.classList.add('text-[16px]');
    if (size === 'Large') document.documentElement.classList.add('text-[18px]');
    toast.success(`Text size set to ${size}`);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'hi');
    toast.success(`Language set to ${lang === 'hi' ? 'Hindi' : 'English'}`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">
          Settings
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Manage your app preferences, security, and appearance.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Security & Privacy */}
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-background/50">
            <h2 className="text-lg font-bold text-foreground">Security & Privacy</h2>
          </div>
          
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
            </div>
            <button 
              onClick={() => {
                setTwoFactor(!twoFactor);
                toast.success(twoFactor ? '2FA Disabled' : '2FA Enabled');
              }}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${twoFactor ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${twoFactor ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="font-bold text-foreground">Active Sessions</h3>
              <p className="text-sm text-muted-foreground mt-1">You are currently logged in on 1 device.</p>
            </div>
            <button onClick={handleLogOutAll} className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
              Log out all devices
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-background/50">
            <h2 className="text-lg font-bold text-foreground">App Preferences</h2>
          </div>
          
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Push Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">Receive updates on your document statuses.</p>
            </div>
            <button 
              onClick={() => {
                setNotifications(!notifications);
                toast.success(notifications ? 'Notifications disabled' : 'Notifications enabled');
              }}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Language</h3>
              <p className="text-sm text-muted-foreground mt-1">Select your preferred language.</p>
            </div>
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-background border border-border text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 font-medium cursor-pointer outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Accessibility (Text Size)</h3>
              <p className="text-sm text-muted-foreground mt-1">Adjust the reading size of action plans.</p>
            </div>
            <select 
              value={textSize}
              onChange={(e) => changeTextSize(e.target.value)}
              className="bg-background border border-border text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 font-medium cursor-pointer outline-none"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-background/50">
            <h2 className="text-lg font-bold text-foreground">Data Management</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="font-bold text-foreground">Export Data</h3>
              <p className="text-sm text-muted-foreground mt-1">Download all your generated action plans as a JSON.</p>
            </div>
            <button onClick={handleDownloadData} className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Download</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-red-200 dark:border-red-900/50 bg-red-100/50 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-500">Danger Zone</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-500">Delete Account</h3>
              <p className="text-sm text-red-600/80 dark:text-red-500/80 mt-1">Permanently remove your profile and history.</p>
            </div>
            <button onClick={handleDeleteAccount} className="bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
