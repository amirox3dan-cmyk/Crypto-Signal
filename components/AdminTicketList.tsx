
import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { SupportTicket, Language } from '../types';
import { TicketChat } from './TicketChat';
import { translations } from '../utils/translations';

interface AdminTicketListProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: SupportTicket[];
  onUpdateStatus: (id: string, status: SupportTicket['status']) => void;
  onAcceptTicket: (id: string) => void;
  onSendMessage: (ticketId: string, content: string) => void;
  language: Language;
}

export const AdminTicketList: React.FC<AdminTicketListProps> = ({ 
  isOpen, 
  onClose, 
  tickets, 
  onUpdateStatus,
  onAcceptTicket,
  onSendMessage,
  language
}) => {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const t = translations[language];

  if (!isOpen) return null;

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-danger bg-danger/10 border-danger/20';
      case 'IN_PROGRESS': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'CLOSED': return 'text-success bg-success/10 border-success/20';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return t.statusOpen;
      case 'IN_PROGRESS': return t.statusInProgress;
      case 'CLOSED': return t.statusClosed;
      default: return status;
    }
  };

  // If chat is active, show chat view
  if (activeTicket) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl h-[85vh] animate-in fade-in zoom-in-95">
          <TicketChat 
            ticket={activeTicket}
            currentUserRole="admin"
            onSendMessage={onSendMessage}
            onClose={() => setActiveTicketId(null)}
            language={language}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-brand-500" />
            {t.adminTicketTitle}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {tickets.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {t.noTicketsAdmin}
            </div>
          ) : (
            tickets.map((ticket) => {
              const lastMessage = ticket.messages[ticket.messages.length - 1];
              return (
                <div key={ticket.id} className="rounded-xl border border-white/5 bg-dark-900/50 p-5 transition-all hover:border-white/10 hover:shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg">{ticket.subject}</h3>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </div>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-xs text-gray-400 line-clamp-1 mb-3 max-w-xl leading-relaxed">
                        <span className={`font-bold ml-1 ${lastMessage?.sender === 'admin' ? 'text-brand-500' : 'text-gray-300'}`}>
                           {lastMessage?.sender === 'admin' ? t.yourReply : `${ticket.username}:`}
                        </span>
                        <span className="text-gray-500">{lastMessage?.content}</span>
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1">
                          <ShieldCheck size={10} />
                          {ticket.username}
                        </span>
                        <span>•</span>
                        <span>{new Date(ticket.timestamp).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-start md:mt-2">
                       {ticket.status === 'OPEN' ? (
                          <button 
                              onClick={() => onAcceptTicket(ticket.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-400 shadow-lg shadow-brand-500/20 transition-all animate-pulse"
                          >
                              <ShieldCheck size={14} />
                              {t.acceptTicket}
                          </button>
                       ) : (
                          <button 
                              onClick={() => setActiveTicketId(ticket.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 text-white text-xs font-bold border border-white/10 hover:bg-dark-600 transition-all"
                          >
                              <MessageSquare size={14} />
                              {t.enterChat}
                          </button>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 justify-end border-t border-white/5 pt-2">
                    {ticket.status !== 'CLOSED' && (
                       <button 
                          onClick={() => onUpdateStatus(ticket.id, 'CLOSED')}
                          className="text-xs text-gray-500 hover:text-success transition-colors flex items-center gap-1"
                       >
                          <CheckCircle size={12} />
                          {t.closeTicket}
                       </button>
                    )}
                    {ticket.status === 'CLOSED' && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock size={12} />
                            {t.statusClosed}
                        </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
