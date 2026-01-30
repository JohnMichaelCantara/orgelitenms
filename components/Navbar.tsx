import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MAIN_LOGO } from '../constants';
import { 
  Home, Image, Bell, MessageSquare, 
  Megaphone, ShieldCheck, LogOut, Menu, X
} from 'lucide-react';

interface NavbarProps {
  user: User;
  current: string;
  navigate: (page: any) => void;
  logout: () => void;
  notificationCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, current, navigate, logout, notificationCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'GALLERY', label: 'Resources', icon: Image },
    { id: 'ANNOUNCEMENTS', label: 'Updates', icon: Megaphone },
    { id: 'NOTIFICATIONS', label: 'Alerts', icon: Bell, badge: notificationCount },
    { id: 'MESSAGES', label: 'Inbox', icon: MessageSquare },
  ];

  if (user.role === UserRole.ADMIN) {
    links.push({ id: 'ADMIN', label: 'Admin', icon: ShieldCheck });
  }

  const handleNav = (id: string) => {
    navigate(id);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-2 lg:gap-8">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden p-1 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                <img 
                  src={MAIN_LOGO} 
                  alt="NMS Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=NMS&backgroundColor=0f172a&textColor=ffffff`;
                  }}
                />
              </div>
            </div>
            <div className="hidden sm:block border-l border-slate-100 pl-4 lg:pl-6 cursor-pointer select-none" onClick={() => handleNav('HOME')}>
              <div className="flex flex-col">
                <h1 className="text-sm lg:text-base font-black text-slate-900 tracking-tighter leading-none">
                  "NMS ORGBRIDGE"
                </h1>
                <span className="text-sky-500 text-[8px] lg:text-[10px] tracking-widest uppercase font-bold mt-0.5">Student Organization Portal</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  current === link.id ? 'bg-slate-900 text-white font-black shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="text-xs">{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${current === link.id ? 'bg-sky-400 text-sky-900' : 'bg-emerald-500 text-white'}`}>
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-100 mx-3" />
            <button onClick={() => handleNav('PROFILE')} className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-slate-50 transition-all active:scale-95">
              <img src={user.avatar} className="w-8 h-8 rounded-lg object-cover border border-slate-100" alt="" />
              <span className="text-xs font-black">{user.name.split(' ')[0]}</span>
            </button>
            <button onClick={logout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button className="lg:hidden p-2 text-slate-600 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-1 animate-in slide-in-from-top-2">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                current === link.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <link.icon className="w-5 h-5" />
                <span className="font-bold text-sm">{link.label}</span>
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">{link.badge}</span>
              )}
            </button>
          ))}
          <button onClick={() => handleNav('PROFILE')} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${current === 'PROFILE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <img src={user.avatar} className="w-6 h-6 rounded-md object-cover border border-white/20" alt="" />
            <span className="font-bold text-sm">Profile Identity</span>
          </button>
          <button onClick={logout} className="flex items-center gap-4 px-4 py-3 text-rose-500 font-bold text-sm border-t border-slate-50 mt-1 hover:bg-rose-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
