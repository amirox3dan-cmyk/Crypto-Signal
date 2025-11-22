
import React, { useState, useEffect } from 'react';
import { Activity, Bell, BookOpen, LogOut, Globe } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
  onTipsClick: () => void;
  onLogout: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  notificationCount, 
  onNotificationClick, 
  onTipsClick, 
  onLogout,
  language,
  onToggleLanguage
}) => {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-b ${
        scrolled 
          ? 'bg-dark-900/95 backdrop-blur-xl border-brand-500/20 shadow-[0_8px_30px_-10px_rgba(217,4,41,0.15)] py-3' 
          : 'bg-gradient-to-b from-dark-900 to-transparent backdrop-blur-none border-transparent py-6'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        
        {/* Logo Group */}
        <div className={`flex items-center gap-3 group cursor-default select-none transition-all duration-500 ${scrolled ? 'gap-2' : 'gap-3'}`}>
          <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-red-600 to-dark-900 shadow-lg shadow-brand-500/30 transition-all duration-500 ${
            scrolled 
              ? 'h-10 w-10 rotate-0' 
              : 'h-12 w-12 group-hover:rotate-6'
          }`}>
            <Activity className={`text-white relative z-10 drop-shadow-md transition-all duration-500 ${scrolled ? 'h-5 w-5' : 'h-6 w-6'}`} />
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-brand-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500"></div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h1 className={`font-black text-white tracking-tighter transition-all duration-500 group-hover:text-brand-400 ${scrolled ? 'text-lg' : 'text-2xl'}`}>
              {t.appTitle}
            </h1>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${scrolled ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100 mt-1'}`}>
              <p className="text-[10px] font-bold text-brand-500/80 uppercase tracking-[0.25em]">
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center justify-center p-2 rounded-2xl border bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              title="تغییر زبان / Change Language"
            >
              <Globe size={20} />
              <span className="ml-1 text-xs font-bold uppercase">{language}</span>
            </button>

            {/* Trading Tips Button */}
            <div 
              onClick={onTipsClick}
              className="hidden md:block relative group rounded-2xl p-2 md:p-3 transition-all duration-300 cursor-pointer border bg-white/5 border-white/5 text-gray-400 hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/40 active:scale-95"
              title={t.tradingTips}
            >
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* Notification Bell */}
            <div 
              onClick={onNotificationClick}
              className={`relative group rounded-2xl p-2 md:p-3 transition-all duration-300 cursor-pointer border ${
                notificationCount > 0 
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-500 hover:bg-brand-500 hover:text-white hover:shadow-[0_0_20px_rgba(217,4,41,0.4)]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              } active:scale-90`}
              title={t.notifications}
            >
              <Bell className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:rotate-12 ${notificationCount > 0 ? 'animate-wiggle' : ''}`} />
              
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-white text-brand-600 text-[9px] md:text-[10px] font-black shadow-sm animate-bounce border-2 border-dark-900">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Logout Button */}
            <div 
              onClick={onLogout}
              className="relative group rounded-2xl p-2 md:p-3 transition-all duration-300 cursor-pointer border bg-white/5 border-white/5 text-gray-400 hover:bg-danger/10 hover:text-danger hover:border-danger/40 active:scale-95"
              title={t.logout}
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:-translate-x-1" />
            </div>
        </div>
      </div>
    </header>
  );
};
