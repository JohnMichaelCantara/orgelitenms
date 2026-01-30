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
import { Loader2, CloudOff, CloudCheck, ExternalLink, RefreshCw, Database, AlertCircle, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';

// --- DATABASE CONFIGURATION ---
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
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(() => {
    return !isCloudConfigured || sessionStorage.getItem('fb_fallback') === 'true';
  });

  // Checklist states for diagnostics
  const [apiEnabled, setApiEnabled] = useState(false);
  const [rulesConfigured, setRulesConfigured] = useState(false);

  // Local state tracking
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('db_users') || '[]'));
  const [events, setEvents] = useState<Event[]>(() => JSON.parse(localStorage.getItem('db_events') || '[]'));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => JSON.parse(localStorage.getItem('db_announcements') || '[]'));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => JSON.parse(localStorage.getItem('db_gallery') || '[]'));
  const [requests, setRequests] = useState<UserRequest[]>(() => JSON.parse(localStorage.getItem('db_requests') || '[]'));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('db_notifications') || '[]'));
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('db_messages') || '[]'));

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
    return () => clearTimeout(timer);
  }, []);

  const activateFallback = useCallback((reason: string) => {
    setIsFallbackMode(true);
    sessionStorage.setItem('fb_fallback', 'true');
    
    if (reason.includes("API")) setApiEnabled(false);
    if (reason.includes("rules") || reason.includes("denied")) setRulesConfigured(false);
  }, []);

  const dbAction = (collectionName: string, action: 'ADD' | 'SET' | 'UPDATE' | 'DELETE', data?: any, id?: string) => {
    const storageKey = `db_${collectionName}`;
    const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let updatedData = [...localData];
    let generatedId = id || Math.random().toString(36).substr(2, 9);
    
    if (action === 'ADD' || action === 'SET') {
      const newEntry = { ...data, id: generatedId };
      const idx = updatedData.findIndex(i => i.id === generatedId);
      if (idx !== -1) updatedData[idx] = newEntry;
      else updatedData.push(newEntry);
    } else if (action === 'UPDATE' && generatedId) {
      updatedData = updatedData.map(item => item.id === generatedId ? { ...item, ...data } : item);
    } else if (action === 'DELETE' && generatedId) {
      updatedData = updatedData.filter(item => item.id !== generatedId);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    if (collectionName === 'users') setUsers(updatedData as User[]);
    else if (collectionName === 'events') setEvents(updatedData as Event[]);
    else if (collectionName === 'announcements') setAnnouncements(updatedData as Announcement[]);
    else if (collectionName === 'gallery') setGallery(updatedData as GalleryItem[]);
    else if (collectionName === 'requests') setRequests(updatedData as UserRequest[]);
    else if (collectionName === 'notifications') setNotifications(updatedData as Notification[]);
    else if (collectionName === 'messages') setMessages(updatedData as Message[]);

    if (!isFallbackMode && db) {
      (async () => {
        try {
          if (action === 'ADD' || action === 'SET') await setDoc(doc(db, collectionName, generatedId), data);
          else if (action === 'UPDATE' && generatedId) await updateDoc(doc(db, collectionName, generatedId), data);
          else if (action === 'DELETE' && generatedId) await deleteDoc(doc(db, collectionName, generatedId));
          setRulesConfigured(true);
          setApiEnabled(true);
        } catch (err: any) {
          if (err.message?.toLowerCase().includes('permission-denied') || err.code === 'permission-denied') {
            activateFallback("Cloud Registry Access Denied: Check API and Security Rules.");
          }
        }
      })();
    }
    return generatedId;
  };

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    if (!isFallbackMode && db) {
      const handleError = (err: any) => {
        if (err.message?.toLowerCase().includes('permission-denied') || err.code === 'permission-denied') {
          activateFallback("Connection blocked. Check API settings.");
        }
      };
      try {
        unsubs = [
          onSnapshot(collection(db, "users"), { 
            next: snap => {
              setApiEnabled(true);
              setRulesConfigured(true);
              const cloudUsers = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
              setUsers(prev => {
                const merged = [...cloudUsers];
                prev.forEach(p => { if(!merged.find(m => m.id === p.id)) merged.push(p); });
                localStorage.setItem('db_users', JSON.stringify(merged));
                return merged;
              });
            }, 
            error: handleError 
          }),
          onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event))), handleError),
          onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), snap => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement))), handleError),
          onSnapshot(collection(db, "gallery"), snap => setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem))), handleError),
          onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))), handleError)
        ];
        return () => unsubs.forEach(u => u());
      } catch (err) { handleError(err); }
    }
  }, [isFallbackMode, activateFallback]);

  const handleAuthSuccess = async (user: User, isNew: boolean = false) => {
    dbAction("users", "SET", user, user.id);
    if (isNew) {
      setIsNewUserSetup(true);
      setCurrentPage('PROFILE');
    } else {
      setCurrentPage('HOME');
    }
    setCurrentUser(user);
    localStorage.setItem('nms_auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('LOGIN');
    localStorage.removeItem('nms_auth_user');
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentPage === 'REGISTER') return <Register users={users} db={db} onRegister={(u) => handleAuthSuccess(u, true)} onSwitchToLogin={() => setCurrentPage('LOGIN')} />;
      return <Login users={users} db={db} onLogin={(u) => handleAuthSuccess(u, false)} onSwitchToRegister={() => setCurrentPage('REGISTER')} />;
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
      case 'GALLERY': return <Gallery items={gallery} isAdmin={currentUser.role === UserRole.ADMIN} onDelete={(id) => dbAction("gallery", "DELETE", null, id)} onUpload={(item) => dbAction("gallery", "ADD", item)} onRequestDownload={(id) => dbAction("requests", "ADD", { userId: currentUser.id, userName: currentUser.name, type: 'FILE_DOWNLOAD', targetId: id, status: RequestStatus.PENDING, timestamp: new Date().toISOString() })} />;
      case 'ANNOUNCEMENTS': return <Announcements list={announcements} isAdmin={currentUser.role === UserRole.ADMIN} onAdd={(ann) => dbAction("announcements", "ADD", { ...ann, authorId: currentUser.id })} onAddEvent={(evt) => dbAction("events", "ADD", evt)} onDelete={(id) => dbAction("announcements", "DELETE", null, id)} />;
      case 'NOTIFICATIONS': return <Notifications list={notifications.filter(n => n.userId === currentUser.id)} onClear={() => notifications.filter(n => n.userId === currentUser.id).forEach(n => dbAction("notifications", "DELETE", null, n.id))} onNotificationClick={(p, id) => { if(p) setCurrentPage(p); dbAction("notifications", "UPDATE", { read: true }, id); }} />;
      case 'MESSAGES': return <Messages currentUser={currentUser} messages={messages} users={users} onSendMessage={(txt, rid) => dbAction("messages", "ADD", { senderId: currentUser.id, receiverId: rid, text: txt, timestamp: new Date().toISOString() })} />;
      case 'PROFILE': return <Profile user={currentUser} isInitialSetup={isNewUserSetup} onSave={(u) => { dbAction("users", "UPDATE", u, u.id); setCurrentUser(u); localStorage.setItem('nms_auth_user', JSON.stringify(u)); setIsNewUserSetup(false); setCurrentPage('HOME'); }} />;
      case 'ADMIN': return <AdminDashboard requests={requests} onAction={(id, s) => dbAction("requests", "UPDATE", { status: s }, id)} onDeleteEvent={(id) => dbAction("events", "DELETE", null, id)} events={events} onAddEvent={(e) => dbAction("events", "ADD", e)} users={users} onRemoveAttendee={(eid, uid) => { const ev = events.find(e => e.id === eid); if(ev) dbAction("events", "UPDATE", { attendees: ev.attendees.filter(a => a !== uid) }, eid); }} onDeleteUser={(uid) => dbAction("users", "DELETE", null, uid)} onUpdateUserRole={(uid, role) => dbAction("users", "UPDATE", { role }, uid)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {currentUser && !isNewUserSetup && (
        <Navbar 
          user={currentUser} current={currentPage} navigate={setCurrentPage} 
          logout={handleLogout}
          notificationCount={notifications.filter(n => n.userId === currentUser.id && !n.read).length}
        />
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4 mr-2">
           <button 
              onClick={() => setShowErrorModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                isFallbackMode ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
           >
              {isFallbackMode ? <ShieldAlert className="w-4 h-4" /> : <CloudCheck className="w-4 h-4" />}
              {isFallbackMode ? 'Action Needed: Global Sync' : 'Identity Hub Linked'}
           </button>
        </div>

        {loading && currentPage === 'LOGIN' ? (
           <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
             <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying Global Identity...</p>
           </div>
        ) : renderContent()}
      </main>

      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="System Health Checklist">
        <div className="space-y-6">
          <div className={`p-6 rounded-[2rem] border flex items-start gap-4 ${isFallbackMode ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
            <Database className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-tight">{isFallbackMode ? 'Cloud Registry Offline' : 'Universal Sync Active'}</p>
              <p className="text-xs opacity-80 leading-relaxed">
                {isFallbackMode 
                  ? "Your identity cannot be restored on other devices until the two steps below are completed in the Firebase Console." 
                  : "All accounts are globally linked. Restoration via phone number identity pinning is operational."}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Deployment Steps</h4>
            
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {apiEnabled ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
                <div className="text-xs">
                  <p className="font-black text-slate-800">1. Enable Firestore API</p>
                  <p className="text-[10px] text-slate-400">Google Cloud Platform switch</p>
                </div>
              </div>
              {!apiEnabled && (
                <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=elite-35cbd" target="_blank" className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-600 hover:text-white transition-all">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {rulesConfigured ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
                <div className="text-xs">
                  <p className="font-black text-slate-800">2. Set Security Rules</p>
                  <p className="text-[10px] text-slate-400">Set 'allow read, write' in Firebase</p>
                </div>
              </div>
              {!rulesConfigured && (
                <a href="https://console.firebase.google.com/project/elite-35cbd/firestore/rules" target="_blank" className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-600 hover:text-white transition-all">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => {
              sessionStorage.removeItem('fb_fallback');
              window.location.reload();
            }} className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
              <RefreshCw className="w-4 h-4" /> Re-check Hub Status
            </button>
          </div>
        </div>
      </Modal>

      <footer className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-50">
        &copy; NMS ORGBRIDGE • Global Identity Protocol
      </footer>
    </div>
  );
};

export default App;