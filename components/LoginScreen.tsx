
import React, { useState } from 'react';
import { Lock, User, Key, ArrowLeft, Globe } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
  language?: Language; // Make optional for backward compatibility if needed, though App will pass it
  onToggleLanguage?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language = 'fa', onToggleLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const t = translations[language];

  // Telegram Config
  const supportTelegramId = "SupportAdmin"; 
  const supportMessage = language === 'fa' ? "سلام یوزر و پس سایت میخوام" : "Hi, I need username and password";
  const telegramUrl = `https://t.me/${supportTelegramId}?text=${encodeURIComponent(supportMessage)}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);

    if (!success) {
      setError(t.loginError);
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Language Toggle Absolute */}
      <button 
        onClick={onToggleLanguage}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-dark-800 border border-white/10 px-4 py-2 rounded-xl text-white text-xs font-bold hover:bg-dark-700 transition-all"
      >
        <Globe size={16} />
        {language.toUpperCase()}
      </button>

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-dark-800 p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-800/10 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 mb-4 border border-brand-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">{t.loginTitle}</h2>
          <p className="mt-2 text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
             {t.loginSubtitle}
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">{t.username}</label>
              <div className="relative">
                <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-500 ${language === 'fa' ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className={`block w-full rounded-xl border border-white/10 bg-dark-900 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all sm:text-sm ${language === 'fa' ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                  placeholder={t.username}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">{t.password}</label>
              <div className="relative">
                <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-500 ${language === 'fa' ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`block w-full rounded-xl border border-white/10 bg-dark-900 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all sm:text-sm ${language === 'fa' ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                  placeholder={t.password}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-danger text-xs text-center bg-danger/10 py-2 rounded-lg border border-danger/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-xl bg-brand-500 py-3 px-4 text-sm font-bold text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-900 transition-all shadow-lg shadow-brand-500/25"
          >
            <span className={`absolute inset-y-0 flex items-center ${language === 'fa' ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
               <ArrowLeft className={`h-5 w-5 text-brand-400 group-hover:text-white transition-colors ${language === 'en' ? 'rotate-180' : ''}`} />
            </span>
            {t.loginBtn}
          </button>
        </form>

        {/* Telegram Support Link */}
        <div className="relative z-10 mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-gray-500 mb-3">{t.needAccount}</p>
            <a 
              href={telegramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 p-3 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all duration-300 group"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current group-hover:scale-110 transition-transform">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="font-bold text-sm">{t.contactSupport}</span>
            </a>
        </div>
      </div>
    </div>
  );
};
