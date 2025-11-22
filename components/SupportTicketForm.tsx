
import React, { useState } from 'react';
import { X, Send, MessageSquare, LifeBuoy, Plus, Clock, ChevronRight } from 'lucide-react';
import { SupportTicket, Language } from '../types';
import { TicketChat } from './TicketChat';
import { translations } from '../utils/translations';

interface SupportTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Omit<SupportTicket, 'id' | 'status' | 'timestamp' | 'messages'>) => void;
  username: string;
  userTickets?: SupportTicket[];
  onSendMessage: (ticketId: string, content: string) => void;
  language: Language;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  username, 
  userTickets = [],
  onSendMessage,
  language
}) => {
  const [view, setView] = useState<'list' | 'create' | 'chat'>('list');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    onSubmit({
      username,
      subject,
      message: message // This will be used as the first message
    });
    
    setSubject('');
    setMessage('');
    setView('list');
  };

  const activeTicket = userTickets.find(t => t.id === activeTicketId);

  // Render Chat View
  if (view === 'chat' && activeTicket) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md h-[600px] animate-in fade-in zoom-in-95">
             <TicketChat 
                ticket={activeTicket}
                currentUserRole="user"
                onSendMessage={onSendMessage}
                onClose={() => {
                    setActiveTicketId(null);
                    setView('list');
                }}
                language={language}
             />
          </div>
        </div>
      );
  }

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'OPEN': return t.statusOpen;
          case 'IN_PROGRESS': return t.statusAnswered;
          case 'CLOSED': return t.statusClosed;
          default: return status;
      }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
             {view === 'create' && (
                 <button onClick={() => setView('list')} className="mr-2 text-gray-400 hover:text-white">
                     <ChevronRight size={20} className={language === 'fa' ? '' : 'rotate-180'} />
                 </button>
             )}
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LifeBuoy className="text-brand-500" size={20} />
                {view === 'create' ? t.newTicket : t.supportTitle}
             </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            
            {view === 'list' && (
                <div className="space-y-4">
                    <button 
                        onClick={() => setView('create')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/50 py-4 font-bold text-brand-500 transition-all hover:bg-brand-500 hover:text-white"
                    >
                        <Plus size={18} />
                        {t.sendNewTicket}
                    </button>

                    <div className="pt-2">
                        <h3 className="text-xs text-gray-500 mb-3 font-bold">{t.yourTickets}</h3>
                        {userTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">
                                {t.noTicketsUser}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {userTickets.map(ticket => (
                                    <div 
                                        key={ticket.id}
                                        onClick={() => {
                                            setActiveTicketId(ticket.id);
                                            setView('chat');
                                        }}
                                        className="bg-dark-900/50 p-4 rounded-xl border border-white/5 hover:border-brand-500/30 cursor-pointer transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white text-sm group-hover:text-brand-400 transition-colors">
                                                {ticket.subject}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                ticket.status === 'OPEN' ? 'border-danger text-danger' :
                                                ticket.status === 'IN_PROGRESS' ? 'border-yellow-400 text-yellow-400' :
                                                'border-success text-success'
                                            }`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                                            {ticket.messages[ticket.messages.length - 1]?.content || '...'}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                            <Clock size={10} />
                                            {new Date(ticket.timestamp).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'create' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs text-gray-400">{t.ticketSubject}</label>
                        <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t.ticketSubjectPlaceholder}
                        className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-xs text-gray-400">{t.ticketMessage}</label>
                        <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.ticketMessagePlaceholder}
                        rows={8}
                        className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-bold text-white transition-all hover:bg-brand-400 shadow-lg shadow-brand-500/20"
                    >
                        <Send size={18} className={language === 'fa' ? 'rotate-180' : ''} />
                        {t.submitTicket}
                    </button>
                </form>
            )}

        </div>
      </div>
    </div>
  );
};
