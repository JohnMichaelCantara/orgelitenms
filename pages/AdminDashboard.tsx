
import React, { useState, useEffect } from 'react';
import { UserRequest, RequestStatus, Event, User, UserRole } from '../types';
import { LOGO_URLS, DASHBOARD_BG } from '../constants';
import { 
  CheckCircle, XCircle, Trash2, Plus, UserMinus, Search, Inbox, 
  Shield, ShieldOff, User as UserIcon, AlertCircle, Lock, Copy, Check, Terminal, ShieldCheck, ShieldAlert, ExternalLink, RefreshCw, Wifi, WifiOff, Beaker, Zap, Loader2
} from 'lucide-react';
import { doc, setDoc, deleteDoc, getFirestore } from 'firebase/firestore';

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
  dbStatus?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  requests, onAction, onDeleteEvent, events, onAddEvent, users, onRemoveAttendee, onDeleteUser, onUpdateUserRole, dbStatus
}) => {
  const [tab, setTab] = useState<'REQUESTS' | 'EVENTS' | 'MEMBERS' | 'DIAGNOSTICS'>('REQUESTS');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [testMsg, setTestMsg] = useState('');

  const runHardTest = async () => {
    setTestStatus('TESTING');
    setTestMsg('Attempting cloud write and delete...');
    const db = getFirestore();
    const testId = `test_entry_${Date.now()}`;
    const testRef = doc(db, "system_test", testId);

    try {
      // Test Write
      await setDoc(testRef, { active: true, timestamp: new Date().toISOString() });
      setTestMsg('Write Success! Now testing delete...');
      
      // Test Delete
      await deleteDoc(testRef);
      setTestStatus('SUCCESS');
      setTestMsg('CLOUD VERIFIED: Permanent delete is working. Pag bumabalik pa rin, i-pindot ang "NUCLEAR RESET" sa main screen.');
    } catch (err: any) {
      setTestStatus('FAIL');
      setTestMsg(`FAILED: ${err.code === 'permission-denied' ? 'Permission Denied! I-check ang Rules sa Firebase Console.' : err.message}`);
    }
  };

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  const filteredMembers = users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || (u.phone && u.phone.includes(memberSearch)));
  const securityRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write, create, update, delete: if true; 
    }
  }
}`;

  return (
    <div className="relative min-h-[85vh] p-4 lg:p-8 animate-in fade-in duration-500 overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl">
      <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${DASHBOARD_BG})` }} />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-md z-0" />

      <div className="relative z-10 space-y-8 h-full overflow-y-auto no-scrollbar pb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white/80 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/50 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center -space-x-4 lg:-space-x-8">
              {LOGO_URLS.map((url, i) => (
                <div key={i} className="w-14 h-14 lg:w-24 lg:h-24 bg-white rounded-2xl lg:rounded-[2rem] p-1.5 lg:p-2.5 shadow-xl border border-white flex items-center justify-center overflow-hidden">
                  <img src={url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter">Admin Hub</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${dbStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {dbStatus === 'CONNECTED' ? 'Live Sync' : 'Sync Blocked'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex bg-white/50 p-1.5 rounded-2xl shadow-sm border border-white/80 overflow-x-auto no-scrollbar">
            {(['REQUESTS', 'EVENTS', 'MEMBERS', 'DIAGNOSTICS'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 lg:px-6 py-2 lg:py-3.5 rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${tab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>
                {t === 'DIAGNOSTICS' ? 'Cloud Health' : t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'DIAGNOSTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6">
            <div className="bg-white/90 backdrop-blur-md p-8 lg:p-12 rounded-[2.5rem] border border-white/50 shadow-2xl space-y-8">
              <div className="space-y-4">
                <ShieldCheck className="w-12 h-12 text-sky-600" />
                <h3 className="text-2xl font-black text-slate-900">Permission Audit</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  I-verify natin kung ang iyong Firebase ay handang tumanggap ng "DELETE" commands.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                 <button 
                  onClick={runHardTest}
                  disabled={testStatus === 'TESTING'}
                  className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-sky-500 transition-all disabled:opacity-50"
                 >
                   {testStatus === 'TESTING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                   Run Cloud Deletion Test
                 </button>

                 {testStatus !== 'IDLE' && (
                   <div className={`p-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest leading-relaxed flex items-start gap-3 ${
                    testStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    testStatus === 'FAIL' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-sky-50 text-sky-600 border-sky-100'
                   }`}>
                      {testStatus === 'SUCCESS' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      {testMsg}
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 px-2">Solution Steps</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px]">1</span>
                    I-copy ang rules sa kanan.
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px]">2</span>
                    I-paste sa Firebase Console.
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600">
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px]">3</span>
                    Pindutin ang <b>PUBLISH</b> (Matingkad na Asul).
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Firebase Security Rules</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(securityRulesCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-sky-200/80 leading-relaxed overflow-x-auto p-6 bg-black/40 rounded-3xl border border-white/5">
                {securityRulesCode}
              </pre>
            </div>
          </div>
        )}

        {/* REQUESTS Tab */}
        {tab === 'REQUESTS' && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 lg:p-12 border-b border-slate-50/50 flex items-center justify-between">
              <div><h3 className="text-xl lg:text-2xl font-black text-slate-800">Pending Actions</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Awaiting admin decision</p></div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50/50 text-slate-400"><tr><th className="px-12 py-6 text-left text-[9px] font-black uppercase">User</th><th className="px-12 py-6 text-left text-[9px] font-black uppercase">Type</th><th className="px-12 py-6 text-right text-[9px] font-black uppercase">Status</th><th className="px-12 py-6 text-right text-[9px] font-black uppercase">Control</th></tr></thead>
                <tbody className="divide-y divide-slate-100/30">
                  {requests.length === 0 ? (<tr><td colSpan={4} className="px-8 py-24 text-center opacity-20"><Inbox className="w-12 h-12 mx-auto mb-4" /><p className="text-[10px] font-black uppercase">No records found</p></td></tr>) : requests.map(req => (
                    <tr key={req.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-12 py-8"><p className="font-black text-slate-800">{req.userName}</p></td>
                      <td className="px-12 py-8"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase">{req.type}</span></td>
                      <td className="px-12 py-8 text-right"><span className="text-[9px] font-black uppercase text-slate-400">{req.status}</span></td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === RequestStatus.PENDING && (
                            <>
                              <button onClick={() => onAction(req.id, RequestStatus.APPROVED)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => onAction(req.id, RequestStatus.REJECTED)} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                          <button onClick={() => onAction(req.id, RequestStatus.REJECTED)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MEMBERS Tab */}
        {tab === 'MEMBERS' && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 lg:p-12 border-b border-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div><h3 className="text-xl lg:text-2xl font-black text-slate-800">Global Registry</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{users.length} identity records</p></div>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Search identity..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold" />
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr><th className="px-12 py-6 text-left text-[9px] font-black uppercase">Name</th><th className="px-12 py-6 text-left text-[9px] font-black uppercase">Role</th><th className="px-12 py-6 text-right text-[9px] font-black uppercase">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100/30">
                  {filteredMembers.map(u => (
                    <tr key={u.id} className="hover:bg-white/50 transition-colors group">
                      <td className="px-12 py-8 flex items-center gap-4">
                         <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                         <div><p className="font-black text-slate-800">{u.name}</p><p className="text-[9px] text-slate-400 uppercase">{u.phone}</p></div>
                      </td>
                      <td className="px-12 py-8">
                         <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase ${u.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500'}`}>
                           {u.role}
                         </span>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => onUpdateUserRole(u.id, u.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN)} className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl"><Shield className="w-5 h-5" /></button>
                           <button onClick={() => { if(confirm(`Delete ${u.name}?`)) onDeleteUser(u.id); }} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl"><Trash2 className="w-5 h-5" /></button>
                         </div>
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
