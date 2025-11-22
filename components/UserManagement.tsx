
import React, { useState, useEffect } from 'react';
import { User, UserRole, Language } from '../types';
import { X, UserPlus, RefreshCw, Trash2, Shield, ShieldAlert, User as UserIcon, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../utils/translations';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (username: string, role: UserRole) => void;
  onDeleteUser: (id: string) => void;
  language: Language;
}

const ITEMS_PER_PAGE = 10;

export const UserManagement: React.FC<UserManagementProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
  language
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const t = translations[language];

  // Reset page if users list shrinks and current page becomes empty
  useEffect(() => {
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [users.length, currentPage]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      onAddUser(newUsername, newRole);
      setNewUsername('');
      setNewRole('user');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return t.roleAdmin;
      case 'support': return t.roleSupport;
      case 'user': return t.roleUser;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'text-brand-500 bg-brand-500/10 border-brand-500/20';
      case 'support': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'user': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield size={14} />;
      case 'support': return <ShieldAlert size={14} />;
      case 'user': return <UserIcon size={14} />;
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="text-brand-500" />
            {t.userManagement}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b border-white/5 bg-dark-900/30">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="mb-1 block text-xs text-gray-400">{t.username}</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.newUsername}
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-xs text-gray-400">{t.userRole}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none text-sm"
              >
                <option value="user">{t.roleUser}</option>
                <option value="support">{t.roleSupport}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-400 shadow-lg shadow-brand-500/20 transition-all"
            >
              <UserPlus size={18} />
              {t.createUser}
            </button>
          </form>
          <p className="mt-3 text-[10px] text-gray-500 flex items-center gap-1">
            <RefreshCw size={10} />
            {t.autoPasswordMsg}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {currentUsers.map((user) => (
            <div key={user.id} className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-white/5 bg-dark-900/50 p-4 transition-all hover:border-white/10">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleColor(user.role).split(' ')[1]}`}>
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{user.username}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t.createdAt} {new Date(user.createdAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-dark-800/50 p-2 rounded-lg border border-white/5">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[8px] text-gray-500 uppercase">Password</span>
                  <span className="font-mono text-sm font-bold text-brand-400">{user.password}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(user.password, user.id)}
                  className="p-2 rounded-md bg-dark-700 text-gray-300 hover:bg-white/10 hover:text-white transition-colors relative"
                  title={t.copyPassword}
                >
                  {copiedId === user.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
                {user.role !== 'admin' || user.username !== 'admin' ? (
                   <div className="w-px h-8 bg-white/10 mx-1"></div>
                ) : null}
                
                {(user.username !== 'admin') && (
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                    title={t.deleteUser}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
             <div className="text-center text-gray-500 py-10">{t.noUsersFound}</div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-dark-800 flex items-center justify-between">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                >
                    {language === 'fa' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    {t.prev}
                </button>
                
                <span className="text-xs font-bold text-gray-400">
                    {t.page} <span className="text-white mx-1">{currentPage}</span> {t.of} <span className="text-white mx-1">{totalPages}</span>
                </span>

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                >
                    {t.next}
                    {language === 'fa' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
