
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { SupportTicket, Language } from '../types';
import { translations } from '../utils/translations';

interface TicketChatProps {
  ticket: SupportTicket;
  currentUserRole: 'admin' | 'user';
  onSendMessage: (ticketId: string, content: string) => void;
  onClose: () => void;
  language: Language;
}

export const TicketChat: React.FC<TicketChatProps> = ({ ticket, currentUserRole, onSendMessage, onClose, language }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(ticket.id, newMessage);
    setNewMessage('');
  };

  const getStatusText = (status: string) => {
    switch(status) {
        case 'OPEN': return t.waitingForReview;
        case 'IN_PROGRESS': return t.inChat;
        case 'CLOSED': return t.statusClosed;
        default: return status;
    }
  };

  const chatHeaderTitle = currentUserRole === 'admin' 
    ? t.chatUser.replace('{username}', ticket.username) 
    : t.chatSupport;

  return (
    <div className="flex flex-col h-full bg-dark-800 rounded-2xl overflow-hidden border border-white/10" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-dark-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowRight size={20} className={`text-gray-400 ${language === 'fa' ? '' : 'rotate-180'}`} />
          </button>
          <div>
            <h3 className="font-bold text-white text-sm">{ticket.subject}</h3>
            <span className="text-xs text-gray-500">
              {chatHeaderTitle}
            </span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${
          ticket.status === 'OPEN' ? 'border-danger text-danger' : 
          ticket.status === 'IN_PROGRESS' ? 'border-yellow-400 text-yellow-400' : 
          'border-success text-success'
        }`}>
          {getStatusText(ticket.status)}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/50">
        {ticket.messages.map((msg) => {
          const isMe = (currentUserRole === 'admin' && msg.sender === 'admin') || (currentUserRole === 'user' && msg.sender === 'user');
          const isSystem = msg.sender === 'system';
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-white/5 text-gray-400 text-[10px] px-3 py-1 rounded-full border border-white/5">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                isMe 
                  ? 'bg-brand-500 text-white rounded-tr-none' 
                  : 'bg-dark-700 text-gray-200 border border-white/5 rounded-tl-none'
              }`}>
                {!isMe && (
                  <div className="flex items-center gap-1 mb-1 text-[10px] opacity-50">
                    {msg.sender === 'admin' ? <ShieldCheck size={10} /> : <User size={10} />}
                    <span>{msg.sender === 'admin' ? t.supportLabel : t.userLabel}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className={`text-[10px] mt-1 flex justify-end ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={handleSend} className="p-3 bg-dark-900 border-t border-white/10">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.writeMessage}
              className="w-full bg-dark-800 text-white text-sm rounded-xl border border-white/10 pl-4 pr-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-500/20"
            >
              <Send size={18} className={newMessage.trim() ? (language === 'fa' ? 'rotate-180' : '') : ''} />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-dark-900 border-t border-white/10 text-center text-sm text-gray-500">
          {t.ticketClosedMsg}
        </div>
      )}
    </div>
  );
};
