
import React, { useState } from 'react';
import { Announcement, Event } from '../types';
import { Megaphone, Calendar, Trash2, Plus, UserCircle, Send, X, MapPin, AlignLeft } from 'lucide-react';

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
        authorId: 'admin-1'
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
      onAdd({
        id: id + '_ann',
        title: `New Event: ${title}`,
        content: `Check out our upcoming event at ${location || 'TBA'}!`,
        date: new Date().toISOString(),
        authorId: 'admin-1'
      });
    }

    setIsPosting(false);
    setTitle('');
    setContent('');
    setLocation('');
    setDate('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Organization Feed</h2>
          <p className="text-slate-500 font-medium">Updates, news, and official statements</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        )}
      </div>

      {isPosting && (
        <div className="bg-white p-8 rounded-[3rem] border-2 border-blue-50 aesthetic-shadow animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">New Publication</h3>
            <button onClick={() => setIsPosting(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePost} className="space-y-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
              <button 
                type="button" 
                onClick={() => setPostType('UPDATE')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${postType === 'UPDATE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Bulletin
              </button>
              <button 
                type="button" 
                onClick={() => setPostType('EVENT')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${postType === 'EVENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Event
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  placeholder="Subject Header"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                />
              </div>

              {postType === 'EVENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Venue"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              )}

              <textarea 
                required
                placeholder="Compose your message..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none h-40 resize-none font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Send className="w-6 h-6" />
              Publish Post
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {list.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3.5rem] border border-slate-100 aesthetic-shadow">
            <Megaphone className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-xl">The feed is currently empty</p>
          </div>
        ) : (
          list.map(ann => (
            <div key={ann.id} className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 aesthetic-shadow hover:border-blue-100 transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight">{ann.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(ann.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} • Faculty Post
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{ann.content}</p>
                </div>
                
                {isAdmin && (
                  <button onClick={() => onDelete(ann.id)} className="self-start p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
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
