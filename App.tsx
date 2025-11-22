
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SignalCard } from './components/SignalCard';
import { AdminSignalForm } from './components/AdminSignalForm';
import { LoginScreen } from './components/LoginScreen';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SupportTicketForm } from './components/SupportTicketForm';
import { AdminTicketList } from './components/AdminTicketList';
import { UserManagement } from './components/UserManagement';
import { TradingTips } from './components/TradingTips';
import { CoinData, MarketSignal, SignalType, SupportTicket, TicketMessage, User, UserRole, Language } from './types';
import { AlertTriangle, Plus, Zap, ListFilter, LogOut, CheckCircle, Trash2, ShieldCheck, MessageSquare, LifeBuoy, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from './utils/translations';

// Initial Market Data
const INITIAL_COINS: CoinData[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 96500, change24h: 2.5 },
  { symbol: 'ETH', name: 'Ethereum', price: 2850, change24h: -1.2 },
  { symbol: 'SOL', name: 'Solana', price: 145, change24h: 5.8 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45, change24h: 0.5 },
  { symbol: 'XRP', name: 'Ripple', price: 0.62, change24h: -0.8 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change24h: 8.4 },
];

// Initial Admin User
const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin', role: 'admin', createdAt: Date.now() }
];

const SIGNALS_PER_PAGE = 4;

export const App: React.FC = () => {
  // Language State
  const [language, setLanguage] = useState<Language>('fa');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // App Data State
  const [coins, setCoins] = useState<CoinData[]>(INITIAL_COINS);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  // UI State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<MarketSignal | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isTradingTipsOpen, setIsTradingTipsOpen] = useState(false);
  const [currentSignalPage, setCurrentSignalPage] = useState(1);
  
  // Ticket UI State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAdminTicketsOpen, setIsAdminTicketsOpen] = useState(false);

  // Delete Confirmation State
  const [signalToDelete, setSignalToDelete] = useState<string | null>(null);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const t = translations[language];
  const TELEGRAM_CHANNEL_URL = "https://t.me/CryptoSignal_VIP"; 

  // Update HTML dir and lang attributes when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Request Notification Permission on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Logic to update Notification Count for Support Users
  useEffect(() => {
    if (currentUser?.role === 'support' || currentUser?.role === 'admin') {
        const openTickets = tickets.filter(t => t.status === 'OPEN').length;
        if (currentUser.role === 'support') {
            setNotificationCount(openTickets);
        }
    }
  }, [tickets, currentUser]);

  // Pagination Logic Fix: Ensure currentPage is valid when signals are deleted
  useEffect(() => {
    const totalSignalPages = Math.ceil(signals.length / SIGNALS_PER_PAGE);
    if (currentSignalPage > totalSignalPages && totalSignalPages > 0) {
      setCurrentSignalPage(totalSignalPages);
    } else if (totalSignalPages === 0 && currentSignalPage !== 1) {
       setCurrentSignalPage(1);
    }
  }, [signals.length, currentSignalPage]);

  // Simulate Live Price Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => prevCoins.map(coin => {
        const volatility = 0.002; 
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        const newPrice = coin.price * change;
        return { ...coin, price: newPrice };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // --- Permissions Logic ---
  const isSuperAdmin = currentUser?.role === 'admin';
  const isSupport = currentUser?.role === 'support';
  
  const canCreateEditSignals = isSuperAdmin;
  const canDeleteSignals = isSuperAdmin || isSupport;
  const canManageTickets = isSuperAdmin || isSupport;
  const canManageUsers = isSuperAdmin;

  // --- Helper Functions ---

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fa' ? 'en' : 'fa');
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001356.png',
        dir: language === 'fa' ? 'rtl' : 'ltr',
        lang: language
      });
    }
  };

  const generateSecurePassword = (length: number = 10): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  // --- Actions ---

  const handleAddUser = (username: string, role: UserRole) => {
    if (users.some(u => u.username === username)) {
      showNotification(t.usernameExists, 'error');
      return;
    }

    const password = generateSecurePassword();
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      createdAt: Date.now()
    };
    
    setUsers(prev => [...prev, newUser]);
    showNotification(t.userCreatedSuccess.replace('{username}', username));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showNotification(t.userDeleted, 'error');
  };

  const handleLogin = (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setNotificationCount(0);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSaveSignal = (signal: MarketSignal) => {
    setSignals(prev => {
      const exists = prev.some(s => s.id === signal.id);
      if (exists) {
        return prev.map(s => s.id === signal.id ? signal : s);
      }
      if (currentUser?.role !== 'support') {
          setNotificationCount(c => c + 1);
      }
      return [signal, ...prev];
    });
    
    const msg = editingSignal ? t.signalEditedSuccess : t.signalCreatedSuccess;
    showNotification(msg);

    if (!editingSignal) {
        const typeStr = signal.type === SignalType.BUY ? 'Long' : 'Short';
        sendBrowserNotification('New Signal 🚀', `${signal.symbol} - ${typeStr}\nEntry: ${signal.entryPrices[0]}`);
    }

    setEditingSignal(null);
  };

  const handleEditSignal = (signal: MarketSignal) => {
    setEditingSignal(signal);
    setIsAdminOpen(true);
  };

  const executeDeleteSignal = useCallback((id: string) => {
    setSignals(prevSignals => {
      const newSignals = prevSignals.filter(s => s.id !== id);
      return newSignals;
    });
    
    showNotification(t.signalDeleted, 'error');
    
    if (editingSignal?.id === id) {
        setIsAdminOpen(false);
        setEditingSignal(null);
    }
  }, [editingSignal, t.signalDeleted]);

  const requestDeleteSignal = (id: string) => {
    setSignalToDelete(id);
  };

  const handleNotificationClick = () => {
      setIsNotificationDrawerOpen(true);
      if (currentUser?.role !== 'support') {
          setNotificationCount(0);
      }
  };

  const handleCreateTicket = (ticketData: { username: string; subject: string; message: string }) => {
    const initialMessage: TicketMessage = {
        id: Date.now().toString() + '_0',
        sender: 'user',
        content: ticketData.message,
        timestamp: Date.now()
    };

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      username: ticketData.username,
      subject: ticketData.subject,
      status: 'OPEN',
      timestamp: Date.now(),
      messages: [initialMessage]
    };
    setTickets(prev => [newTicket, ...prev]);
    showNotification(t.ticketSentSuccess);
  };

  const handleUpdateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    showNotification(t.ticketStatusUpdated);
  };

  const handleAcceptTicket = (id: string) => {
    const autoMessage: TicketMessage = {
        id: Date.now().toString() + '_system',
        sender: 'admin', 
        content: t.supportAutoReply,
        timestamp: Date.now()
    };

    setTickets(prev => prev.map(t => {
        if (t.id === id) {
            return {
                ...t,
                status: 'IN_PROGRESS',
                messages: [...t.messages, autoMessage]
            };
        }
        return t;
    }));
    showNotification(t.ticketAccepted);
  };

  const handleSendTicketMessage = (ticketId: string, content: string) => {
    const newMessage: TicketMessage = {
        id: Date.now().toString(),
        sender: (isSuperAdmin || isSupport) ? 'admin' : 'user',
        content: content,
        timestamp: Date.now()
    };

    setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
            return {
                ...t,
                messages: [...t.messages, newMessage]
            };
        }
        return t;
    }));
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} language={language} onToggleLanguage={toggleLanguage} />;
  }

  const signalToDeleteData = signals.find(s => s.id === signalToDelete);
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;
  const myTickets = tickets.filter(t => t.username === currentUser?.username).sort((a, b) => b.timestamp - a.timestamp);
  const totalSignalPages = Math.ceil(signals.length / SIGNALS_PER_PAGE);
  const paginatedSignals = signals.slice(
    (currentSignalPage - 1) * SIGNALS_PER_PAGE,
    currentSignalPage * SIGNALS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-dark-900 pb-20 relative overflow-x-hidden" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <Header 
        notificationCount={notificationCount} 
        onNotificationClick={handleNotificationClick}
        onTipsClick={() => setIsTradingTipsOpen(true)}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen} 
        onClose={() => setIsNotificationDrawerOpen(false)} 
        signals={signals} 
        language={language}
      />

      <TradingTips 
        isOpen={isTradingTipsOpen}
        onClose={() => setIsTradingTipsOpen(false)}
        language={language}
      />

      <main className="container mx-auto px-4 pt-8 max-w-4xl">
        
        {/* Action Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Zap className="text-brand-500 fill-brand-500/20" />
                {t.vipSignals}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {currentUser?.role === 'admin' ? t.adminPanel : currentUser?.role === 'support' ? t.supportPanel : t.viewSignals}
              </p>
           </div>

           <div className="flex flex-wrap items-center gap-3">
             {/* User Management Button (Admin Only) */}
             {canManageUsers && (
                <button
                  onClick={() => setIsUserManagementOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-dark-800 border border-white/10 px-4 py-3 font-bold text-white shadow-sm transition-all hover:bg-dark-700 hover:border-white/20"
                >
                  <Users className="h-5 w-5 text-brand-400" />
                  {t.users}
                </button>
             )}

             {/* Support Ticket Buttons */}
             {canManageTickets ? (
               <button
                onClick={() => setIsAdminTicketsOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-dark-800 border border-white/10 px-4 py-3 font-bold text-white shadow-sm transition-all hover:bg-dark-700 hover:border-white/20 relative"
               >
                 <MessageSquare className="h-5 w-5 text-brand-400" />
                 {t.manageTickets}
                 {openTicketsCount > 0 && (
                   <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white border-2 border-dark-900 animate-bounce">
                     {openTicketsCount}
                   </span>
                 )}
               </button>
             ) : (
               <button
                onClick={() => setIsTicketModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-dark-800 border border-brand-500/30 px-4 py-3 font-bold text-brand-400 shadow-sm transition-all hover:bg-dark-700 hover:text-brand-300"
               >
                 <LifeBuoy className="h-5 w-5" />
                 {t.support}
               </button>
             )}

             {canCreateEditSignals && (
                <button
                  onClick={() => {
                    setEditingSignal(null);
                    setIsAdminOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-400 hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  {t.manualEntry}
                </button>
             )}
           </div>
        </div>

        {/* Capital Management Tips - Grid Layout Fixed */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-dark-800 p-6 border-2 border-brand-500/50 shadow-[0_0_30px_-10px_rgba(217,4,41,0.3)]">
             <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500 shadow-inner border border-brand-500/20 shrink-0">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">{t.capitalManagement}</h3>
                        <p className="text-xs text-brand-400 font-bold mt-1">{t.capitalSubtitle}</p>
                    </div>
                 </div>
                 
                 {/* Using GRID for alignment */}
                 <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-center md:justify-start gap-2 bg-dark-900/80 px-3 py-3 rounded-lg border border-brand-500/20 hover:border-brand-500/50 transition-colors h-full">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse shrink-0"></div>
                        <span className="text-xs font-bold text-white text-center md:text-start">{t.rule_volume}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 bg-dark-900/80 px-3 py-3 rounded-lg border border-brand-500/20 hover:border-brand-500/50 transition-colors h-full">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse shrink-0"></div>
                        <span className="text-xs font-bold text-white text-center md:text-start">{t.rule_stoploss}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 bg-dark-900/80 px-3 py-3 rounded-lg border border-brand-500/20 hover:border-brand-500/50 transition-colors h-full">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse shrink-0"></div>
                        <span className="text-xs font-bold text-white text-center md:text-start">{t.rule_saveprofit}</span>
                    </div>
                 </div>
             </div>
        </div>

        {/* Signals List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-gray-300">
                <ListFilter size={18} />
                <span className="font-bold text-sm">{t.positionsList}</span>
              </div>
              <span className="bg-dark-800 text-white text-xs font-bold px-2 py-1 rounded-md border border-white/10">
                {signals.length} {t.items}
              </span>
          </div>
          
          <div className="space-y-4">
            {signals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-dark-800/50 p-16 text-center">
                    <div className="bg-dark-800 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{t.emptyList}</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
                      {canCreateEditSignals ? t.emptyListAdmin : t.emptyListUser}
                    </p>
                </div>
            ) : (
                paginatedSignals.map((signal) => (
                  <SignalCard 
                    key={signal.id} 
                    signal={signal} 
                    isAdmin={canCreateEditSignals || canDeleteSignals}
                    onEdit={canCreateEditSignals ? handleEditSignal : undefined}
                    onDelete={canDeleteSignals ? requestDeleteSignal : undefined}
                    language={language}
                  />
                ))
            )}
          </div>

          {/* Signals Pagination Controls */}
          {signals.length > 0 && totalSignalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5">
                <button 
                    onClick={() => setCurrentSignalPage(p => Math.max(1, p - 1))}
                    disabled={currentSignalPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 text-white text-sm border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-all shadow-sm"
                >
                    {language === 'fa' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {t.prevPage}
                </button>
                
                <span className="text-sm font-bold text-gray-400">
                    {t.page} <span className="text-brand-500 mx-1">{currentSignalPage}</span> {t.of} <span className="text-white mx-1">{totalSignalPages}</span>
                </span>

                <button 
                    onClick={() => setCurrentSignalPage(p => Math.min(totalSignalPages, p + 1))}
                    disabled={currentSignalPage === totalSignalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 text-white text-sm border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-all shadow-sm"
                >
                    {t.nextPage}
                    {language === 'fa' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>
          )}
        </div>

        {/* Footer with Telegram CTA */}
        <footer className="mt-16 border-t border-white/5 pt-8 pb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#229ED9]/20 to-dark-800 p-8 text-center border border-[#229ED9]/30">
              <div className="absolute -top-24 -right-24 h-48 w-48 bg-[#229ED9]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-[#229ED9]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-3">
                  {t.telegramTitle}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                  {t.telegramDesc}
                </p>
                
                <a 
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#229ED9] px-8 py-4 text-white shadow-lg shadow-[#229ED9]/25 transition-all hover:bg-[#1e8bbd] hover:scale-105 active:scale-95 group"
                >
                  <svg viewBox="0 0 24 24" width="28" height="28" className="fill-white group-hover:animate-wiggle">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="font-bold text-lg">{t.joinChannel}</span>
                </a>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <p className="text-[10px] text-gray-600">
                 © 2025 Signal Master. All rights reserved.
               </p>
            </div>
        </footer>

      </main>

      {/* Notification Toast */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-xl bg-dark-800 p-4 border border-brand-500/30 shadow-2xl shadow-brand-500/10 animate-in ${language === 'fa' ? 'slide-in-from-right-10' : 'slide-in-from-left-10'}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toastType === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {toastType === 'success' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              {toastMessage}
            </h4>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminSignalForm 
        isOpen={isAdminOpen} 
        onClose={() => {
          setIsAdminOpen(false);
          setEditingSignal(null);
        }} 
        onSave={handleSaveSignal} 
        onDelete={canDeleteSignals ? executeDeleteSignal : undefined}
        initialData={editingSignal}
        language={language}
      />

      <SupportTicketForm 
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
        username={currentUser?.username || ''}
        userTickets={myTickets}
        onSendMessage={handleSendTicketMessage}
        language={language}
      />

      <AdminTicketList
        isOpen={isAdminTicketsOpen}
        onClose={() => setIsAdminTicketsOpen(false)}
        tickets={tickets}
        onUpdateStatus={handleUpdateTicketStatus}
        onAcceptTicket={handleAcceptTicket}
        onSendMessage={handleSendTicketMessage}
        language={language}
      />

      {canManageUsers && (
         <UserManagement 
           isOpen={isUserManagementOpen}
           onClose={() => setIsUserManagementOpen(false)}
           users={users}
           onAddUser={handleAddUser}
           onDeleteUser={handleDeleteUser}
           language={language}
         />
      )}

      {signalToDelete && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200 border-t-4 border-t-danger relative">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 text-danger ring-4 ring-danger/5">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{t.deleteSignal}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {t.deleteConfirm} <span className="text-white font-bold mx-1">{signalToDeleteData?.symbol}</span>
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setSignalToDelete(null)}
                        className="flex-1 py-3 rounded-xl bg-dark-700 text-gray-300 font-bold hover:bg-dark-600 hover:text-white transition-colors"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={() => {
                            if (signalToDelete) executeDeleteSignal(signalToDelete);
                            setSignalToDelete(null);
                        }}
                        className="flex-1 py-3 rounded-xl bg-danger text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-danger/20 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        {t.confirmDelete}
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
