
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react';

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

  const contacts = users
    .filter(u => u.id !== currentUser.id)
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
    (m.senderId === selectedUserId && m.receiverId === currentUser.id)
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && selectedUserId) {
      onSendMessage(inputText, selectedUserId);
      setInputText('');
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex bg-white rounded-3xl lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      {/* Sidebar - Hidden on mobile if a chat is selected */}
      <div className={`w-full md:w-80 flex flex-col border-r border-slate-100 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 lg:p-8 border-b border-slate-50">
          <h2 className="text-xl lg:text-2xl font-black text-slate-800">Inbox</h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {contacts.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full flex items-center gap-4 p-4 lg:p-5 transition-all ${
                selectedUserId === user.id ? 'bg-sky-50' : 'hover:bg-slate-50'
              }`}
            >
              <img src={user.avatar} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
              <div className="flex-1 text-left min-w-0">
                <p className="font-black text-slate-800 text-sm truncate">{user.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area - Occupies full space on mobile if selected */}
      <div className={`flex-1 flex flex-col bg-slate-50/20 ${!selectedUserId ? 'hidden md:flex items-center justify-center p-12 text-center' : 'flex'}`}>
        {selectedUserId && selectedUser ? (
          <>
            <div className="p-4 lg:p-6 bg-white border-b border-slate-100 flex items-center gap-4">
              <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-slate-400"><ArrowLeft className="w-5 h-5" /></button>
              <img src={selectedUser.avatar} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover" alt="" />
              <div>
                <h3 className="font-black text-slate-800 text-sm lg:text-base">{selectedUser.name}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Chat</span>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 no-scrollbar">
              {activeChatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.senderId === currentUser.id ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-50'
                  }`}>
                    <p className="font-medium">{msg.text}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mt-1 block">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 lg:p-8 bg-white border-t border-slate-100">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Your message..." 
                  className="flex-1 px-5 lg:px-8 py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-2xl lg:rounded-[2rem] text-sm focus:outline-none"
                />
                <button type="submit" disabled={!inputText.trim()} className="p-3 lg:p-4 bg-slate-900 text-white rounded-xl lg:rounded-2xl shadow-lg disabled:opacity-20"><Send className="w-5 h-5 lg:w-6 h-6" /></button>
              </div>
            </form>
          </>
        ) : (
          <div className="max-w-xs">
            <div className="w-16 h-16 lg:w-20 lg:h-20 gradient-pastel rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageSquare className="w-8 h-8 lg:w-10 h-10 text-slate-800" />
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Messages</h3>
            <p className="text-slate-400 mt-2 text-sm font-medium">Select a contact to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
