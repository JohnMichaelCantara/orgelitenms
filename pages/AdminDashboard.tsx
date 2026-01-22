
import React, { useState, useEffect } from 'react';
import { UserRequest, RequestStatus, Event, User } from '../types';
import { 
  CheckCircle, XCircle, Users, Trash2, Plus, UserMinus, Search
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Admin Center</h2>
          <p className="text-slate-500 text-sm lg:text-base font-medium">Manage organization operations</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl lg:rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
          {(['REQUESTS', 'EVENTS', 'ATTENDEES'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                tab === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tab === 'REQUESTS' && (
          <div className="bg-white rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg lg:text-xl font-black text-slate-800">Pending Actions</h3>
              <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black">
                {requests.filter(r => r.status === RequestStatus.PENDING).length} NEW
              </span>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr>
                    <th className="px-6 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest">User</th>
                    <th className="px-6 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest">Type</th>
                    <th className="px-6 lg:px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-6 lg:px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-300 text-[10px] font-black tracking-widest uppercase">No Active Requests</td></tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 lg:px-8 py-5 font-bold text-slate-700 text-sm">{req.userName}</td>
                        <td className="px-6 lg:px-8 py-5"><span className="text-[10px] font-black uppercase text-sky-600">{req.type.split('_')[0]}</span></td>
                        <td className="px-6 lg:px-8 py-5"><span className="text-[10px] font-black uppercase text-slate-400">{req.status}</span></td>
                        <td className="px-6 lg:px-8 py-5 text-right">
                          {req.status === RequestStatus.PENDING && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => onAction(req.id, RequestStatus.APPROVED)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => onAction(req.id, RequestStatus.REJECTED)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><XCircle className="w-5 h-5" /></button>
                            </div>
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
          <div className="bg-white rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg lg:text-xl font-black text-slate-800">Event Catalog</h3>
              <button onClick={() => {
                const title = prompt('Event Title:');
                if (title) onAddEvent({
                  id: Math.random().toString(36).substr(2, 9),
                  title,
                  description: 'New organization event.',
                  date: new Date().toISOString().split('T')[0],
                  location: 'Venue TBA',
                  attendees: []
                });
              }} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(e => (
                <div key={e.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-sm truncate">{e.title}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{e.attendees.length} Participants</p>
                  </div>
                  <button onClick={() => onDeleteEvent(e.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ATTENDEES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Select Event</h3>
              <div className="space-y-2">
                {events.map(e => (
                  <button key={e.id} onClick={() => setSelectedEventId(e.id)} className={`w-full text-left p-4 rounded-xl text-xs font-bold transition-all ${
                    selectedEventId === e.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{e.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${selectedEventId === e.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {e.attendees.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm min-h-[300px]">
              {selectedEvent ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-sky-500" /> Member Roster
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Total Joined: {eventAttendees.length}
                      </p>
                    </div>
                    
                    <div className="relative group max-w-xs w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search joined members..." 
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-4 focus:ring-sky-50 focus:border-sky-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredAttendees.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="" />
                          <div>
                            <span className="text-xs font-bold text-slate-700 block leading-none">{u.name}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight">{u.phone || 'No Identity Phone'}</span>
                          </div>
                        </div>
                        <button onClick={() => onRemoveAttendee(selectedEvent.id, u.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><UserMinus className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {filteredAttendees.length === 0 && (
                      <div className="col-span-full text-center py-20 flex flex-col items-center justify-center opacity-40">
                        <Search className="w-8 h-8 mb-4 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No members matching search</p>
                      </div>
                    )}
                    {eventAttendees.length === 0 && !attendeeSearch && (
                      <div className="col-span-full text-center py-20 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No participants yet</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] gap-4">
                   <Users className="w-10 h-10 opacity-20" />
                   <span>Select an event to view roster</span>
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
