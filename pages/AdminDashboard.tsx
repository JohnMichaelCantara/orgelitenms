import React, { useState, useEffect } from 'react';
import { UserRequest, RequestStatus, Event, User, UserRole } from '../types';
import { LOGO_URLS, DASHBOARD_BG } from '../constants';
import { 
  CheckCircle, XCircle, Trash2, Plus, UserMinus, Search, Inbox, Shield, ShieldOff, User as UserIcon, AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  requests: UserRequest[];
  onAction: (id: string, action: RequestStatus) => void;
  onDeleteEvent: (id: string) => void;
  events: Event[];
  onAddEvent: (e: Event) => void;
  users: User[];
  onRemoveAttendee: (eventId: string, userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  requests, onAction, onDeleteEvent, events, onAddEvent, users, onRemoveAttendee, onDeleteUser, onUpdateUserRole
}) => {
  const [tab, setTab] = useState<'REQUESTS' | 'EVENTS' | 'ATTENDEES' | 'MEMBERS'>('REQUESTS');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const filteredAttendees = selectedEvent 
    ? users.filter(u => selectedEvent.attendees.includes(u.id)).filter(u => u.name.toLowerCase().includes(attendeeSearch.toLowerCase()) || (u.phone && u.phone.includes(attendeeSearch)))
    : [];

  const filteredMembers = users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || (u.phone && u.phone.includes(memberSearch)));

  return (
    <div className="relative min-h-[85vh] p-4 lg:p-8 animate-in fade-in duration-500 overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl">
      <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat transition-opacity duration-1000" style={{ backgroundImage: `url(${DASHBOARD_BG})` }} />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-md z-0" />

      <div className="relative z-10 space-y-8 h-full overflow-y-auto no-scrollbar pb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white/80 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/50 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center -space-x-4 lg:-space-x-8">
              {LOGO_URLS.map((url, i) => (
                <div key={i} className="w-14 h-14 lg:w-24 lg:h-24 bg-white rounded-2xl lg:rounded-[2rem] p-1.5 lg:p-2.5 shadow-xl border border-white transition-all hover:scale-110 hover:z-10 flex items-center justify-center overflow-hidden">
                  <img src={url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight">Admin Console</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Global Identity Governance</p>
            </div>
          </div>
          <div className="flex bg-white/50 p-1.5 rounded-2xl lg:rounded-[2rem] shadow-sm border border-white/80 overflow-x-auto no-scrollbar">
            {(['REQUESTS', 'EVENTS', 'ATTENDEES', 'MEMBERS'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 lg:px-6 py-2 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${tab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>{t}</button>
            ))}
          </div>
        </div>

        {tab === 'MEMBERS' && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 lg:p-12 border-b border-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-slate-800">Organizational Registry</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Found {users.length} identity records</p>
              </div>
              <div className="relative group max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Search members..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs outline-none font-bold" />
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr>
                    <th className="px-12 py-6 text-left text-[9px] font-black uppercase tracking-widest">Identity</th>
                    <th className="px-12 py-6 text-left text-[9px] font-black uppercase tracking-widest">Phone Key</th>
                    <th className="px-12 py-6 text-left text-[9px] font-black uppercase tracking-widest">Access Role</th>
                    <th className="px-12 py-6 text-right text-[9px] font-black uppercase tracking-widest">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/30">
                  {filteredMembers.map(u => (
                    <tr key={u.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-12 py-8 flex items-center gap-4">
                         <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                         <div><p className="font-black text-slate-800">{u.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase">UID: {u.id}</p></div>
                      </td>
                      <td className="px-12 py-8 font-black text-slate-600 text-sm tracking-widest">{u.phone}</td>
                      <td className="px-12 py-8">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase ${u.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                           {u.role === UserRole.ADMIN ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                           {u.role}
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <div className="flex items-center justify-end gap-3">
                           <button onClick={() => onUpdateUserRole(u.id, u.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN)} className={`p-3 rounded-xl transition-all shadow-sm ${u.role === UserRole.ADMIN ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white'}`}>
                             {u.role === UserRole.ADMIN ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                           </button>
                           <button onClick={() => { if(confirm(`Permanently revoke access for ${u.name}? This cannot be undone.`)) onDeleteUser(u.id); }} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'REQUESTS' && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 lg:p-12 border-b border-slate-50/50 flex items-center justify-between">
              <div><h3 className="text-xl lg:text-2xl font-black text-slate-800">Review Queue</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pending organizational permissions</p></div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50/50 text-slate-400"><tr><th className="px-12 py-6 text-left text-[9px] font-black uppercase tracking-widest">Applicant</th><th className="px-12 py-6 text-left text-[9px] font-black uppercase tracking-widest">Type</th><th className="px-12 py-6 text-right text-[9px] font-black uppercase tracking-widest">Decision</th></tr></thead>
                <tbody className="divide-y divide-slate-100/30">
                  {requests.length === 0 ? (<tr><td colSpan={3} className="px-8 py-24 text-center opacity-20 flex flex-col items-center gap-4"><Inbox className="w-12 h-12" /><p className="text-[10px] font-black uppercase tracking-[0.3em]">No Pending Requests</p></td></tr>) : requests.map(req => (
                    <tr key={req.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-12 py-8"><p className="font-black text-slate-800">{req.userName}</p></td>
                      <td className="px-12 py-8"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase">{req.type}</span></td>
                      <td className="px-12 py-8 text-right">
                        {req.status === RequestStatus.PENDING ? (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => onAction(req.id, RequestStatus.APPROVED)} className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm"><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={() => onAction(req.id, RequestStatus.REJECTED)} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm"><XCircle className="w-5 h-5" /></button>
                          </div>
                        ) : (<span className="text-[9px] font-black uppercase text-slate-400">{req.status}</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;