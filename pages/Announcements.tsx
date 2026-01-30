
import React, { useState } from 'react';
import { Announcement, Event } from '../types';
import { Megaphone, Calendar, Trash2, Plus, Send, X, MapPin, AlignLeft, Info } from 'lucide-react';

interface AnnouncementsProps {
  list: Announcement[];
  isAdmin: boolean;
  onAdd: (a: Announcement) => void;
  onAddEvent: (e: Event) => void;
  onDelete: (id: string) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ list, isAdmin, onAdd, onAddEvent, onDelete }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [postType, setPostType] = useState<'UPDATE' | 'EVENT'>('UPDATE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    
    if (postType === 'UPDATE') {
      onAdd({
        id,
        title,
        content,
        date: new Date().toISOString(),
        authorId: 'current' // Handled by App.tsx logic
      });
    } else {
      onAddEvent({
        id,
        title,
        description: content,
        date: date || new Date().toISOString(),
        location: location || 'TBA',
        attendees: []
      });
      // Optionally add a matching announcement
      onAdd({
        id: id + '_ann',
        title: `Event: ${title}`,
        content: `New event scheduled for ${date || 'soon'} at ${location || 'TBA'}.`,
        date: new Date().toISOString(),
        authorId: 'current'
      });
    }

    setIsPosting(false);
    setTitle('');
    setContent('');
    setLocation('');
    setDate('');
  };

  const confirmDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone on the server.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Community Feed</h2>
          <p className="text-slate-500 font-medium">Official bulletins and organization updates</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-3 bg-slate-900 text-white px-6 lg:px-8 py-4 rounded-[1.5rem] lg:rounded-[2rem] font-black text-xs lg:text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all transform hover:-translate-y-1 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create Entry
          </button>
        )}
      </div>

      {isPosting && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-sky-100/30 animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">New Publication</h3>
            <button 
              onClick={() => setIsPosting(false)} 
              className="p-3 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-2xl transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePost} className="space-y-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
              <button 
                type="button" 
                onClick={() => setPostType('UPDATE')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${postType === 'UPDATE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Bulletin
              </button>
              <button 
                type="button" 
                onClick={() => setPostType('EVENT')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${postType === 'EVENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Calendar
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Subject Heading"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-100 outline-none font-bold text-lg placeholder:text-slate-200"
                />
              </div>

              {postType === 'EVENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900" />
                    <input 
                      type="text" 
                      placeholder="Meeting Venue"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-100 outline-none font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-100 outline-none font-bold"
                    />
                  </div>
                </div>
              )}

              <textarea 
                required
                placeholder="Compose details..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-slate-100 outline-none h-48 resize-none font-medium text-lg placeholder:text-slate-200"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Send className="w-6 h-6" />
              Publish to Hub
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {list.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3.5rem] border border-slate-100 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <p className="text-slate-400 font-black text-xl tracking-tight uppercase">No bulletins</p>
              <p className="text-slate-300 text-sm mt-1 font-bold">Organization updates will appear here</p>
            </div>
          </div>
        ) : (
          list.map(ann => (
            <div key={ann.id} className="group relative bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 hover:border-sky-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-sky-50/50">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="p-4 bg-sky-50 text-sky-600 rounded-[1.5rem] group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">{ann.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(ann.date).toLocaleDateString()}
                        </p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1">
                          <Info className="w-3 h-3" /> Official
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium text-lg">{ann.content}</p>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => confirmDelete(ann.id, ann.title)} 
                    className="self-start p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
