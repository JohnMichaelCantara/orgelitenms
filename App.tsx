
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, doc, 
  setDoc, updateDoc, deleteDoc, query, orderBy 
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
import { Loader2, CloudOff, CloudCheck, ExternalLink, RefreshCw, Database, AlertCircle, ShieldAlert, CheckCircle2, Circle, Wifi, WifiOff, Trash2, ShieldCheck, Zap } from 'lucide-react';

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
    db = getFirestore(app);
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

  // MASTER SYNC LOGIC
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    if (db) {
      const handleError = (err: any) => {
        console.error("Sync Error:", err);
        if (err.code === 'permission-denied') setDbStatus('ERROR');
      };
      
      try {
        setDbStatus('SYNCING');
        unsubs = [
          onSnapshot(collection(db, "users"), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
            setUsers(data);
            localStorage.setItem('db_users', JSON.stringify(data));
          }, handleError),
          onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
            setEvents(data);
            localStorage.setItem('db_events', JSON.stringify(data));
          }, handleError),
          onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
            setAnnouncements(data);
            localStorage.setItem('db_announcements', JSON.stringify(data));
          }, handleError),
          onSnapshot(collection(db, "gallery"), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
            setGallery(data);
            localStorage.setItem('db_gallery', JSON.stringify(data));
          }, handleError),
          onSnapshot(collection(db, "requests"), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRequest));
            setRequests(data);
            localStorage.setItem('db_requests', JSON.stringify(data));
          }, handleError),
          onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
            setMessages(data);
            localStorage.setItem('db_messages', JSON.stringify(data));
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
          // STEP 1: Burahin sa UI agad (Optimistic)
          const setters: any = { users: setUsers, events: setEvents, announcements: setAnnouncements, gallery: setGallery, requests: setRequests };
          if (setters[collectionName]) {
            setters[collectionName]((prev: any[]) => prev.filter(item => item.id !== targetId));
          }
          
          // STEP 2: Burahin sa Server
          await deleteDoc(docRef);
          console.log(`[CLOUD] Success delete: ${collectionName}/${targetId}`);
        } else if (action === 'ADD' || action === 'SET') {
          await setDoc(docRef, data);
        } else if (action === 'UPDATE') {
          await updateDoc(docRef, data);
        }
        
        setDbStatus('CONNECTED');
      } catch (err: any) {
        console.error(`[DB ERROR]`, err);
        setDbStatus('ERROR');
        setSyncError(err.message);
        
        if (err.code === 'permission-denied') {
          alert("ERROR: Permission Denied! Hindi nadelete sa server kaya babalik ang data. I-update ang Firebase Rules mo.");
          window.location.reload(); // Force reload to show actual server state
        }
      }
    }
  };

  const nuclearReset = () => {
    if (confirm("Nuclear Reset: Buburahin ang local cache at pipilitin ang app na kumuha ng fresh data mula sa Cloud. Itutuloy?")) {
      localStorage.clear();
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
        <div className="flex justify-end gap-2 mb-4">
           <button 
              onClick={nuclearReset}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
           >
              <Zap className="w-3.5 h-3.5" /> Nuclear Sync Reset
           </button>
           <button 
              onClick={() => setShowErrorModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                dbStatus === 'ERROR' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                dbStatus === 'SYNCING' ? 'bg-sky-50 text-sky-600 animate-pulse border border-sky-100' :
                'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
           >
              {dbStatus === 'ERROR' ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              {dbStatus === 'ERROR' ? 'Cloud Blocked' : dbStatus === 'SYNCING' ? 'Syncing...' : 'Cloud Active'}
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
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase">Sync Protocol Status</p>
              <p className="text-xs opacity-80 leading-relaxed">
                {dbStatus === 'ERROR' 
                  ? `Ang server ay tumanggi sa huling request (Error: ${syncError || 'Permission Denied'}). Siguraduhin na ang Rules mo ay 'allow write: if true' at napindot ang 'PUBLISH'.` 
                  : "Ang iyong connection sa cloud database ay established at healthy."}
              </p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
            <RefreshCw className="w-4 h-4" /> Force Hub Refresh
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
