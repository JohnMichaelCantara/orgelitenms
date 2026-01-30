
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { Send, Search, ArrowLeft, MessageSquare, Shield } from 'lucide-react';

interface MessagesProps {
  currentUser: User;
  messages: Message[];
  users: User[];
  onSendMessage: (text: string, receiverId: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, messages, users, onSendMessage }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // DIRECTORY LOGIC: Pull everyone from the global registry synced from Google Cloud
  // This ensures members can always see and message Admins from any device.
  const contacts = users
    .filter(u => u.id !== currentUser.id)
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone && u.phone.includes(searchQuery)));
  
  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
    (m.senderId === selectedUserId && m.receiverId === currentUser.id)
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && selectedUserId) {
      onSendMessage(inputText, selectedUserId);
      setInputText('');
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-3xl lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar Directory */}
      <div className={`w-full md:w-80 flex flex-col border-r border-slate-100 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 lg:p-8 border-b border-slate-50">
          <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Organization Inbox</h2>
          <div className="relative mt-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search members/admins..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/10">
          {contacts.length === 0 ? (
            <div className="p-10 text-center opacity-20">
              <MessageSquare className="w-10 h-10 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Registry Searching...</p>
            </div>
          ) : (
            contacts.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full flex items-center gap-4 p-4 lg:p-5 transition-all border-b border-slate-50/50 ${
                  selectedUserId === user.id ? 'bg-sky-50 shadow-inner' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                  {user.role === UserRole.ADMIN && (
                    <div className="absolute -top-1 -right-1 p-0.5 bg-blue-600 rounded-md text-white shadow-lg">
                      <Shield className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{user.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                    {user.role === UserRole.ADMIN ? 'ORGANIZATION ADMIN' : 'HUB MEMBER'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Space */}
      <div className={`flex-1 flex flex-col bg-slate-50/20 ${!selectedUserId ? 'hidden md:flex items-center justify-center p-12 text-center' : 'flex'}`}>
        {selectedUserId && selectedUser ? (
          <>
            <div className="p-4 lg:p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></button>
                <img src={selectedUser.avatar} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover" alt="" />
                <div>
                  <h3 className="font-black text-slate-800 text-sm lg:text-base">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Link Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-8 no-scrollbar">
              {activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                   <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8" />
                   </div>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em]">Communication Link Ready</p>
                </div>
              ) : (
                activeChatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[75%] px-6 py-4 rounded-3xl shadow-sm ${
                      msg.senderId === currentUser.id 
                        ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-2 block text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-10 bg-white border-t border-slate-100">
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-sky-50 transition-all">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Draft a message..." 
                  className="flex-1 bg-transparent px-6 py-3 lg:py-4 text-sm font-medium focus:outline-none"
                />
                <button type="submit" disabled={!inputText.trim()} className="p-4 lg:p-5 bg-slate-900 text-white rounded-[1.5rem] lg:rounded-[1.8rem] shadow-xl hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-10">
                  <Send className="w-5 h-5 lg:w-6 h-6" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 lg:w-28 lg:h-28 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200/50">
              <MessageSquare className="w-10 h-10 lg:w-14 lg:h-14 text-slate-300" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Organization Directory</h3>
            <p className="text-slate-400 mt-4 font-medium leading-relaxed">Choose an Admin or Member to sync messages across all linked devices.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
