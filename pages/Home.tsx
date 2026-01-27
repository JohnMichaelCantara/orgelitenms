
import React, { useState, useEffect } from 'react';
import { User, Event, UserRole, Announcement, GalleryItem } from '../types';
import { LOGO_URLS } from '../constants';
import { 
  Calendar, ArrowRight, Upload, 
  Megaphone, Image as ImageIcon,
  Sparkles, Check, X, Users, LayoutDashboard, Compass
} from 'lucide-react';

interface HomeProps {
  user: User;
  events: Event[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  onJoinRequest: (id: string) => void;
  isAdmin: boolean;
  onManage: () => void;
  onExplore: () => void;
  onQuickUpload: (item: GalleryItem) => void;
  onQuickAnnounce: (ann: Announcement) => void;
}

const Home: React.FC<HomeProps> = ({ 
  user, events, announcements, gallery, onJoinRequest, isAdmin, onManage, onExplore, onQuickUpload, onQuickAnnounce 
}) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleLocalUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onQuickUpload({
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            title: file.name,
            type: file.type.startsWith('image/') ? 'PHOTO' : 'DOCUMENT',
            isPublic: true
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleQuickAnnounce = () => {
    const title = prompt('Post Headline:');
    const content = prompt('Content:');
    if (title && content) {
      onQuickAnnounce({
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        date: new Date().toISOString(),
        authorId: user.id
      });
    }
  };

  const fallbacks = ["N", "M", "S"];

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <section className="relative overflow-hidden gradient-pastel rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-24 text-slate-900 shadow-2xl shadow-emerald-100/50">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center -space-x-4">
              {LOGO_URLS.map((url, i) => (
                <div 
                  key={i} 
                  className="w-14 h-14 lg:w-20 lg:h-20 bg-white rounded-2xl lg:rounded-[2.5rem] p-1.5 lg:p-3 shadow-2xl border border-white/50 transition-all hover:scale-110 hover:z-10 transform cursor-default flex items-center justify-center overflow-hidden" 
                  style={{ transform: `rotate(${i === 0 ? '-10deg' : i === 2 ? '10deg' : '0deg'}) translateY(${i === 1 ? '-4px' : '0px'})` }}
                >
                   <img 
                    src={url} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-contain" 
                    alt={`Logo ${i + 1}`} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${fallbacks[i]}&backgroundColor=${i === 2 ? '0f172a' : 'f1f5f9'}&textColor=${i === 2 ? 'ffffff' : '475569'}&fontSize=40`;
                    }}
                   />
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/40 rounded-full border border-white/50 backdrop-blur-xl">
              <Sparkles className="w-3 h-3 lg:w-4 h-4 text-sky-700" />
              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-sky-900">System Ready</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-7xl font-black mb-6 leading-tight tracking-tighter text-slate-900">
            {greeting}, <br className="hidden sm:block"/> {user.name.split(' ')[0]}.
          </h1>
          <p className="text-base lg:text-xl text-slate-700 mb-10 max-w-md font-medium leading-relaxed opacity-80">
            Explore the organizational hub. Access documentation, stay updated on events, and communicate with the community.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onExplore} 
              className="px-8 lg:px-12 py-4 lg:py-5 bg-slate-900 text-white rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-lg flex items-center gap-2 transform transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-500/30 active:scale-95"
            >
              Explore Assets <Compass className="w-4 h-4 lg:w-6 h-6" />
            </button>
            {isAdmin && (
              <button 
                onClick={onManage} 
                className="px-8 lg:px-12 py-4 lg:py-5 bg-white/40 text-slate-900 border border-white/60 rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-lg backdrop-blur-md transition-all hover:bg-white/70 hover:shadow-xl active:scale-95 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 lg:w-6 h-6" />
                Management Hub
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-white/40 rounded-full blur-[60px] lg:blur-[120px]"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8 lg:space-y-12">
          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <button 
                onClick={handleQuickAnnounce} 
                className="p-6 lg:p-10 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-xl hover:border-sky-100 active:scale-[0.98] group"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-all">
                  <Megaphone className="w-6 h-6 lg:w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg lg:text-xl font-black text-slate-800">New Bulletin</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Broadcast to community</p>
                </div>
              </button>
              <button 
                onClick={handleLocalUpload} 
                className="p-6 lg:p-10 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-xl hover:border-emerald-100 active:scale-[0.98] group"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Upload className="w-6 h-6 lg:w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg lg:text-xl font-black text-slate-800">Shared Asset</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Upload documentation</p>
                </div>
              </button>
            </div>
          )}

          <section>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-6 lg:mb-8">Latest Updates</h2>
            {announcements.length === 0 ? (
              <div className="bg-white py-16 lg:py-24 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 text-center shadow-sm flex flex-col items-center gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <Megaphone className="w-8 h-8 lg:w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Feed is Clear</p>
                  <p className="text-slate-300 text-[10px] mt-1">Check back later for official statements</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} id={`ann-${ann.id}`} className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:border-sky-50 scroll-mt-24">
                    <div className="flex items-start gap-4 lg:gap-6">
                      <div className="p-3 lg:p-4 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
                        <Megaphone className="w-5 h-5 lg:w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-black text-slate-800 mb-2">{ann.title}</h3>
                        <p className="text-sm lg:text-base text-slate-600 leading-relaxed line-clamp-2 font-medium">{ann.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8 lg:space-y-12">
          <section>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800 mb-6">Upcoming Events</h2>
            {events.length === 0 ? (
              <div className="p-10 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                <Calendar className="w-8 h-8 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Nothing Scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 4).map(event => {
                  const isJoined = event.attendees.includes(user.id);
                  return (
                    <div key={event.id} id={`evt-${event.id}`} className="p-4 lg:p-6 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-sky-50 scroll-mt-24">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 ${isJoined ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'} rounded-xl flex items-center justify-center shrink-0 transition-colors`}>
                            <Calendar className="w-5 h-5 lg:w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-800 truncate text-sm lg:text-base">{event.title}</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(event.date).toLocaleDateString()}</p>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Users className="w-2.5 h-2.5" />
                                    {event.attendees.length}
                                </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onJoinRequest(event.id)}
                          className={`p-2 lg:px-4 lg:py-3 rounded-xl transition-all active:scale-90 flex items-center gap-2 ${
                            isJoined 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 group' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                          }`}
                        >
                          {isJoined ? (
                            <>
                              <Check className="w-4 h-4 group-hover:hidden" />
                              <X className="w-4 h-4 hidden group-hover:block" />
                              <span className="text-[10px] font-black uppercase tracking-tight hidden lg:block group-hover:hidden">Joined</span>
                              <span className="text-[10px] font-black uppercase tracking-tight hidden group-hover:block">Leave</span>
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-tight hidden lg:block">Participate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800 mb-6">Gallery Preview</h2>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {gallery.length === 0 ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-slate-100" />
                  </div>
                ))
              ) : (
                gallery.slice(0, 4).map(item => (
                  <div 
                    key={item.id} 
                    className="aspect-square bg-white rounded-2xl border border-slate-100 overflow-hidden relative shadow-sm transition-transform hover:scale-105 group cursor-pointer"
                    onClick={onExplore}
                  >
                    {item.type === 'PHOTO' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ArrowRight className="text-white w-6 h-6" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {gallery.length > 0 && (
              <button 
                onClick={onExplore}
                className="w-full mt-6 py-4 border border-slate-100 bg-white text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
              >
                View Full Repository
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
