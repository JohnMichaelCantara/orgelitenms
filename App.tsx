
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, doc, 
  setDoc, updateDoc, deleteDoc, query, orderBy,
  initializeFirestore, memoryLocalCache, terminate
} from "firebase/firestore";

import { 
  User, UserRole, Event, Announcement, GalleryItem, 
  UserRequest, Message, Notification, RequestStatus 
} from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Modal from './components/Modal';
import { Loader2, RefreshCw, AlertCircle, Wifi, WifiOff, Activity, Zap } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyCsr48rSLUsMYVRxaIGD6gjLJ1vd5dAMWY",
  authDomain: "elite-35cbd.firebaseapp.com",
  projectId: "elite-35cbd",
  storageBucket: "elite-35cbd.firebasestorage.app",
  messagingSenderId: "431904094345",
  appId: "1:431904094345:web:287e0e57d3e80f26bc6e58",
  measurementId: "G-L8BGE8S8T9"
};

const isCloudConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

let db: any = null;
if (isCloudConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    // CRITICAL FIX: Use memoryLocalCache to prevent ghost data from returning after refresh
    db = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

const App: React.FC = () => {
  type Page = 'HOME' | 'GALLERY' | 'ANNOUNCEMENTS' | 'NOTIFICATIONS' | 'MESSAGES' | 'ADMIN' | 'LOGIN' | 'REGISTER' | 'PROFILE';
  const [currentPage, setCurrentPage] = useState<Page>('LOGIN');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNewUserSetup, setIsNewUserSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'ERROR' | 'SYNCING'>('SYNCING');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Local States
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('nms_auth_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setCurrentPage('HOME');
      } catch (e) {
        localStorage.removeItem('nms_auth_user');
      }
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => setLoading(false);
  }, []);

  // MASTER SYNC LOGIC - Laging nakikinig sa Cloud
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    if (db) {
      const handleError = (err: any) => {
        console.error("Sync Error:", err);
        if (err.code === 'permission-denied') {
          setDbStatus('ERROR');
          setSyncError("Cloud Permission Denied: Please check your Firebase Security Rules.");
        }
      };
      
      try {
        setDbStatus('SYNCING');
        // Ang onSnapshot dito ay diretso na sa Cloud dahil naka-memory cache tayo
        unsubs = [
          onSnapshot(collection(db, "users"), snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
          }, handleError),
          onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), snap => {
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
          }, handleError),
          onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), snap => {
            setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
          }, handleError),
          onSnapshot(collection(db, "gallery"), snap => {
            setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
          }, handleError),
          onSnapshot(collection(db, "requests"), snap => {
            setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRequest)));
          }, handleError),
          onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), snap => {
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
          }, handleError)
        ];
        setDbStatus('CONNECTED');
      } catch (err) { setDbStatus('ERROR'); }
    }
    return () => unsubs.forEach(u => u());
  }, []);

  const dbAction = async (collectionName: string, action: 'ADD' | 'SET' | 'UPDATE' | 'DELETE', data?: any, id?: string) => {
    const targetId = id || (data && data.id);
    if (!targetId && action !== 'ADD') return;

    if (db) {
      try {
        setDbStatus('SYNCING');
        const docRef = doc(db, collectionName, targetId);
        
        if (action === 'DELETE') {
          // STEP 1: Burahin sa server at maghintay ng confirmation
          await deleteDoc(docRef);
          console.log(`[STRICT DELETE] Permanently removed from cloud: ${collectionName}/${targetId}`);
        } else if (action === 'ADD' || action === 'SET') {
          await setDoc(docRef, data);
        } else if (action === 'UPDATE') {
          await updateDoc(docRef, data);
        }
        
        setDbStatus('CONNECTED');
      } catch (err: any) {
        console.error(`[DB ACTION FAILED]`, err);
        setDbStatus('ERROR');
        setSyncError(err.message);
        
        if (err.code === 'permission-denied') {
          alert("DELETE FAILED: Tinanggihan ng Firebase Rules ang pag-delete. Hindi ito mabubura hangga't hindi inaayos ang rules sa console. Kaya ito bumabalik.");
          window.location.reload(); // Force refresh to show server truth
        }
        throw err;
      }
    }
  };

  const nuclearReset = async () => {
    if (confirm("GHOST DATA CLEANUP: Buburahin ang lahat ng browser memory para siguradong fresh data lang mula sa server ang makikita. Itutuloy?")) {
      localStorage.clear();
      if (db) await terminate(db);
      window.location.reload();
    }
  };

  const handleAuthSuccess = async (user: User, isNew: boolean = false) => {
    await dbAction("users", "SET", user, user.id);
    if (isNew) {
      setIsNewUserSetup(true);
      setCurrentPage('PROFILE');
    } else {
      setCurrentPage('HOME');
    }
    setCurrentUser(user);
    localStorage.setItem('nms_auth_user', JSON.stringify(user));
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentPage === 'REGISTER') return <Register users={users} db={db} onRegister={(u) => handleAuthSuccess(u, true)} onSwitchToLogin={() => setCurrentPage('LOGIN')} />;
      return <Login users={users} db={db} onLogin={(u) => handleAuthSuccess(u, false)} onSwitchToRegister={() => setCurrentPage('REGISTER')} onTroubleshoot={() => setShowErrorModal(true)} />;
    }

    switch (currentPage) {
      case 'HOME': return <Home user={currentUser} events={events} announcements={announcements} gallery={gallery} onJoinRequest={(id) => {
          const event = events.find(e => e.id === id);
          if (event) {
            const isJoined = event.attendees.includes(currentUser.id);
            const newAttendees = isJoined ? event.attendees.filter(a => a !== currentUser.id) : [...event.attendees, currentUser.id];
            dbAction("events", "UPDATE", { attendees: newAttendees }, id);
          }
      }} isAdmin={currentUser.role === UserRole.ADMIN} onManage={() => setCurrentPage('ADMIN')} onExplore={() => setCurrentPage('GALLERY')} onQuickUpload={(item) => dbAction("gallery", "ADD", item)} onQuickAnnounce={(ann) => dbAction("announcements", "ADD", ann)} />;
      case 'GALLERY': return <Gallery items={gallery} isAdmin={currentUser.role === UserRole.ADMIN} onDelete={(id) => dbAction("gallery", "DELETE", null, id)} onUpload={(item) => dbAction("gallery", "ADD", item)} onRequestDownload={(id) => dbAction("requests", "ADD", { id: `req_${Date.now()}`, userId: currentUser.id, userName: currentUser.name, type: 'FILE_DOWNLOAD', targetId: id, status: RequestStatus.PENDING, timestamp: new Date().toISOString() })} />;
      case 'ANNOUNCEMENTS': return <Announcements list={announcements} isAdmin={currentUser.role === UserRole.ADMIN} onAdd={(ann) => dbAction("announcements", "ADD", { ...ann, authorId: currentUser.id })} onAddEvent={(evt) => dbAction("events", "ADD", evt)} onDelete={(id) => dbAction("announcements", "DELETE", null, id)} />;
      case 'NOTIFICATIONS': return <Notifications list={notifications.filter(n => n.userId === currentUser.id)} onClear={() => notifications.filter(n => n.userId === currentUser.id).forEach(n => dbAction("notifications", "DELETE", null, n.id))} onNotificationClick={(p, id) => { if(p) setCurrentPage(p); dbAction("notifications", "UPDATE", { read: true }, id); }} />;
      case 'MESSAGES': return <Messages currentUser={currentUser} messages={messages} users={users} onSendMessage={(txt, rid) => dbAction("messages", "ADD", { id: `msg_${Date.now()}`, senderId: currentUser.id, receiverId: rid, text: txt, timestamp: new Date().toISOString() })} />;
      case 'PROFILE': return <Profile user={currentUser} isInitialSetup={isNewUserSetup} onSave={(u) => { dbAction("users", "UPDATE", u, u.id); setCurrentUser(u); localStorage.setItem('nms_auth_user', JSON.stringify(u)); setIsNewUserSetup(false); setCurrentPage('HOME'); }} onSyncCloud={() => dbAction("users", "SET", currentUser, currentUser.id)} />;
      case 'ADMIN': return <AdminDashboard requests={requests} onAction={(id, s) => dbAction("requests", "UPDATE", { status: s }, id)} onDeleteEvent={(id) => dbAction("events", "DELETE", null, id)} events={events} onAddEvent={(e) => dbAction("events", "ADD", e)} users={users} onRemoveAttendee={(eid, uid) => { const ev = events.find(e => e.id === eid); if(ev) dbAction("events", "UPDATE", { attendees: ev.attendees.filter(a => a !== uid) }, eid); }} onDeleteUser={(uid) => dbAction("users", "DELETE", null, uid)} onUpdateUserRole={(uid, role) => dbAction("users", "UPDATE", { role }, uid)} dbStatus={dbStatus} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {currentUser && !isNewUserSetup && (
        <Navbar 
          user={currentUser} current={currentPage} navigate={setCurrentPage} 
          logout={() => { setCurrentUser(null); setCurrentPage('LOGIN'); localStorage.removeItem('nms_auth_user'); }}
          notificationCount={notifications.filter(n => n.userId === currentUser.id && !n.read).length}
        />
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-end items-center gap-3 mb-8">
           <button 
              onClick={() => setShowErrorModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all shadow-sm ${
                dbStatus === 'ERROR' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                dbStatus === 'SYNCING' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
           >
              <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'ERROR' ? 'bg-rose-500 animate-pulse' : dbStatus === 'SYNCING' ? 'bg-sky-500 animate-ping' : 'bg-emerald-500'}`} />
              Cloud Health
           </button>

           <button 
              onClick={nuclearReset}
              className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 rounded-lg shadow-sm transition-all"
              title="Fix Ghost Data"
           >
              <Zap className="w-3.5 h-3.5" />
           </button>
        </div>

        {loading && currentPage === 'LOGIN' ? (
           <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
             <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Handshaking Global Registry...</p>
           </div>
        ) : renderContent()}
      </main>

      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="System Diagnostics">
        <div className="space-y-6">
          <div className={`p-6 rounded-[2rem] border flex items-start gap-4 ${dbStatus === 'ERROR' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
            <Activity className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase">Protocol Diagnostics</p>
              <p className="text-xs opacity-80 leading-relaxed">
                {dbStatus === 'ERROR' 
                  ? `Napigilan ang pag-delete dahil sa permission error (${syncError}). Mangyaring i-update ang Security Rules sa Firebase.` 
                  : "Ang iyong app ay direkta nang kumukuha ng data mula sa Cloud (Memory-Only Cache). Wala nang dapat bumalik na ghost data."}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Persistence</span>
                <span className="text-rose-600">DISABLED (Strict Mode)</span>
             </div>
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Latency Control</span>
                <span className="text-sky-600">CLOUD-FIRST</span>
             </div>
          </div>

          <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
            <RefreshCw className="w-4 h-4" /> Hard Refresh Session
          </button>
        </div>
      </Modal>

      <footer className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-50">
        &copy; NMS ORGBRIDGE • Global Cloud Registry Protocol
      </footer>
    </div>
  );
};

export default App;
