
import React, { useState, useEffect } from 'react';
import { UserRequest, RequestStatus, Event, User } from '../types';
import { 
  CheckCircle, XCircle, Users, Trash2, Plus, UserMinus, Search, Calendar, Inbox
} from 'lucide-react';

interface AdminDashboardProps {
  requests: UserRequest[];
  onAction: (id: string, action: RequestStatus) => void;
  onDeleteEvent: (id: string) => void;
  events: Event[];
  onAddEvent: (e: Event) => void;
  users: User[];
  onRemoveAttendee: (eventId: string, userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  requests, onAction, onDeleteEvent, events, onAddEvent, users, onRemoveAttendee 
}) => {
  const [tab, setTab] = useState<'REQUESTS' | 'EVENTS' | 'ATTENDEES'>('REQUESTS');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventAttendees = selectedEvent 
    ? users.filter(u => selectedEvent.attendees.includes(u.id))
    : [];
    
  const filteredAttendees = eventAttendees.filter(u => 
    u.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(attendeeSearch))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Organization Hub</h2>
          <p className="text-slate-500 text-sm lg:text-base font-medium mt-1">Command center for administrative operations</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
          {(['REQUESTS', 'EVENTS', 'ATTENDEES'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 lg:px-10 py-3 lg:py-4 rounded-xl lg:rounded-[1.5rem] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap active:scale-95 ${
                tab === t 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {tab === 'REQUESTS' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 lg:p-12 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h3 className="text-xl lg:text-2xl font-black text-slate-800">Review Inbox</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Authorization queue</p>
              </div>
              <div className="px-5 py-2 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black border border-sky-100">
                {requests.filter(r => r.status === RequestStatus.PENDING).length} PENDING
              </div>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    <th className="px-8 lg:px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">Identify Member</th>
                    <th className="px-8 lg:px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">Type</th>
                    <th className="px-8 lg:px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">Current Status</th>
                    <th className="px-8 lg:px-12 py-6 text-right text-[10px] font-black uppercase tracking-widest">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                           <Inbox className="w-12 h-12" />
                           <p className="text-[10px] font-black tracking-[0.3em] uppercase">No active requests to display</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 lg:px-12 py-8">
                           <p className="font-black text-slate-800 text-base">{req.userName}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Identity UID: {req.userId.slice(0, 8)}</p>
                        </td>
                        <td className="px-8 lg:px-12 py-8">
                           <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                             {req.type.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-8 lg:px-12 py-8">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${req.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : req.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                             <span className="text-[10px] font-black uppercase text-slate-400">{req.status}</span>
                           </div>
                        </td>
                        <td className="px-8 lg:px-12 py-8 text-right">
                          {req.status === RequestStatus.PENDING ? (
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => onAction(req.id, RequestStatus.APPROVED)} 
                                className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => onAction(req.id, RequestStatus.REJECTED)} 
                                className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'EVENTS' && (
          <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-slate-100 shadow-sm animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">Event Catalog</h3>
                <p className="text-slate-500 font-medium">Create and manage upcoming organization sessions</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt('Session Title:');
                  if (title) onAddEvent({
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    description: 'New official organization session.',
                    date: new Date().toISOString().split('T')[0],
                    location: 'To be announced',
                    attendees: []
                  });
                }} 
                className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Add Session</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full py-24 text-center opacity-20">
                   <Calendar className="w-20 h-20 mx-auto mb-6" />
                   <p className="text-2xl font-black uppercase tracking-widest">No active events</p>
                </div>
              ) : (
                events.map(e => (
                  <div key={e.id} className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-black text-slate-800 text-lg truncate leading-tight">{e.title}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {e.attendees.length} PARTICIPANTS
                      </p>
                    </div>
                    <button 
                      onClick={() => onDeleteEvent(e.id)} 
                      className="p-4 bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'ATTENDEES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm h-fit sticky top-24">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">Select Active Event</h3>
              <div className="space-y-3">
                {events.map(e => (
                  <button 
                    key={e.id} 
                    onClick={() => setSelectedEventId(e.id)} 
                    className={`w-full text-left p-5 rounded-[1.5rem] text-sm font-bold transition-all active:scale-[0.98] ${
                      selectedEventId === e.id 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate pr-2 font-black tracking-tight">{e.title}</span>
                      <span className={`text-[9px] px-2 py-1 rounded-lg font-black ${selectedEventId === e.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {e.attendees.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm min-h-[500px] animate-in slide-in-from-right-10">
              {selectedEvent ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-sky-50 rounded-2xl">
                          <Users className="w-7 h-7 text-sky-500" />
                        </div>
                        Participant Roster
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 ml-1">
                        CONFIRMED SEATS: {eventAttendees.length}
                      </p>
                    </div>
                    
                    <div className="relative group max-w-sm w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search roster..." 
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-8 focus:ring-slate-100 outline-none transition-all font-bold placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredAttendees.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.8rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100 group">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" />
                          <div>
                            <span className="text-sm font-black text-slate-800 block leading-none">{u.name}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 block">{u.phone || 'NO PHONE RECORDED'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => onRemoveAttendee(selectedEvent.id, u.id)} 
                          className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {filteredAttendees.length === 0 && (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-30 text-center">
                        <Search className="w-16 h-16 mb-6" />
                        <p className="text-xl font-black uppercase tracking-widest">No matching participants</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] gap-8">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                      <Users className="w-12 h-12 opacity-10" />
                   </div>
                   <span>Select an event catalog to view the roster</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
