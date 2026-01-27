
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, doc, 
  setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, 
  where 
} from "firebase/firestore";

import { 
  User, UserRole, Event, Announcement, GalleryItem, 
  UserRequest, Message, Notification, RequestStatus 
} from './types';
import { LOGO_URLS } from './constants';
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
import { Loader2, CloudOff, CloudCheck, AlertTriangle, ExternalLink, RefreshCw, Database } from 'lucide-react';

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
  
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(() => {
    return !isCloudConfigured || sessionStorage.getItem('fb_fallback') === 'true';
  });

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const activateFallback = (reason: string) => {
    setFirebaseError(reason);
    setIsFallbackMode(true);
    sessionStorage.setItem('fb_fallback', 'true');
    syncLocalData();
  };

  /**
   * dbAction: Optimistic Updates
   * 1. Updates LocalStorage immediately (Sync)
   * 2. Triggers UI refresh via custom event
   * 3. Attempts Cloud Sync in background (Async, Non-blocking)
   */
  const dbAction = async (collectionName: string, action: 'ADD' | 'SET' | 'UPDATE' | 'DELETE', data?: any, id?: string) => {
    const localData = JSON.parse(localStorage.getItem(`db_${collectionName}`) || '[]');
    let updatedData = [...localData];
    let generatedId = id || Math.random().toString(36).substr(2, 9);
    
    // --- Step 1: IMMEDIATE LOCAL WRITE ---
    if (action === 'ADD' || action === 'SET') {
      const newEntry = { ...data, id: generatedId };
      if (action === 'SET') {
        const idx = updatedData.findIndex(i => i.id === generatedId);
        if (idx !== -1) updatedData[idx] = newEntry;
        else updatedData.push(newEntry);
      } else {
        updatedData.push(newEntry);
      }
    } else if (action === 'UPDATE' && generatedId) {
      updatedData = updatedData.map(item => item.id === generatedId ? { ...item, ...data } : item);
    } else if (action === 'DELETE' && generatedId) {
      updatedData = updatedData.filter(item => item.id !== generatedId);
    }
    
    localStorage.setItem(`db_${collectionName}`, JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage_update'));

    // --- Step 2: BACKGROUND CLOUD SYNC (Do not await this for UI speed) ---
    if (!isFallbackMode && db) {
      const runCloudSync = async () => {
        try {
          const colRef = collection(db, collectionName);
          if (action === 'ADD') await addDoc(colRef, { ...data, id: generatedId });
          else if (action === 'SET' && generatedId) await setDoc(doc(db, collectionName, generatedId), data);
          else if (action === 'UPDATE' && generatedId) await updateDoc(doc(db, collectionName, generatedId), data);
          else if (action === 'DELETE' && generatedId) await deleteDoc(doc(db, collectionName, generatedId));
        } catch (err: any) {
          console.warn(`Cloud Sync Background Fail (${collectionName}):`, err.message);
          if (err.code === 'permission-denied' || err.message?.includes('disabled') || err.message?.includes('not been used')) {
            activateFallback("Cloud API access restricted. Portal running in Local Mode.");
          }
        }
      };
      // Trigger background task without 'await'ing it here
      runCloudSync();
    }
    
    return generatedId;
  };

  const syncLocalData = useCallback(() => {
    setUsers(JSON.parse(localStorage.getItem('db_users') || '[]'));
    setEvents(JSON.parse(localStorage.getItem('db_events') || '[]'));
    setAnnouncements(JSON.parse(localStorage.getItem('db_announcements') || '[]'));
    setGallery(JSON.parse(localStorage.getItem('db_gallery') || '[]'));
    setRequests(JSON.parse(localStorage.getItem('db_requests') || '[]'));
    setMessages(JSON.parse(localStorage.getItem('db_messages') || '[]'));
    setNotifications(JSON.parse(localStorage.getItem('db_notifications') || '[]'));
    setLoading(false);
  }, []);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    if (!isFallbackMode && db) {
      const handleError = (err: any) => {
        if (err.code === 'permission-denied' || err.message?.includes('disabled')) {
          activateFallback("Cloud connection rejected by Google Services.");
        }
      };
      try {
        unsubs = [
          onSnapshot(collection(db, "users"), { next: snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User))), error: handleError }),
          onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), { next: snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event))), error: handleError }),
          onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), { next: snap => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement))), error: handleError }),
          onSnapshot(collection(db, "gallery"), { next: snap => setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem))), error: handleError }),
          onSnapshot(query(collection(db, "requests"), orderBy("timestamp", "desc")), { next: snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRequest))), error: handleError }),
          onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), { next: snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))), error: handleError }),
          onSnapshot(collection(db, "notifications"), { next: snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))), error: handleError })
        ];
        const timeout = setTimeout(() => setLoading(false), 2500);
        return () => { clearTimeout(timeout); unsubs.forEach(u => u()); };
      } catch (err) { handleError(err); }
    } else {
      syncLocalData();
      window.addEventListener('storage_update', syncLocalData);
      return () => window.removeEventListener('storage_update', syncLocalData);
    }
  }, [isFallbackMode, syncLocalData]);

  const addNotification = async (userId: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO', targetPage?: Page, targetId?: string) => {
    await dbAction("notifications", "ADD", {
      userId, message, type, read: false,
      timestamp: new Date().toISOString(),
      targetPage: targetPage || null,
      targetId: targetId || null
    });
  };

  const handleSendMessage = async (text: string, receiverId: string) => {
    if (!currentUser) return;
    await dbAction("messages", "ADD", { senderId: currentUser.id, receiverId, text, timestamp: new Date().toISOString() });
    addNotification(receiverId, `New message from ${currentUser.name}`, 'INFO', 'MESSAGES');
  };

  const handleAuthSuccess = async (user: User, isNew: boolean = false) => {
    if (isNew) {
      await dbAction("users", "SET", user, user.id);
      setIsNewUserSetup(true);
      setCurrentPage('PROFILE');
    } else {
      setCurrentPage('HOME');
    }
    setCurrentUser(user);
  };

  const handleToggleJoinEvent = async (eventId: string) => {
    if (!currentUser) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const isJoined = event.attendees.includes(currentUser.id);
    const newAttendees = isJoined 
      ? event.attendees.filter(id => id !== currentUser.id)
      : [...event.attendees, currentUser.id];
    await dbAction("events", "UPDATE", { attendees: newAttendees }, eventId);
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentPage === 'REGISTER') return <Register users={users} onRegister={(u) => handleAuthSuccess(u, true)} onSwitchToLogin={() => setCurrentPage('LOGIN')} />;
      return <Login users={users} onLogin={(u) => handleAuthSuccess(u, false)} onSwitchToRegister={() => setCurrentPage('REGISTER')} />;
    }

    switch (currentPage) {
      case 'HOME': return <Home user={currentUser} events={events} announcements={announcements} gallery={gallery} onJoinRequest={handleToggleJoinEvent} isAdmin={currentUser.role === UserRole.ADMIN} onManage={() => setCurrentPage('ADMIN')} onExplore={() => setCurrentPage('GALLERY')} onQuickUpload={async (item) => await dbAction("gallery", "ADD", item)} onQuickAnnounce={async (ann) => { await dbAction("announcements", "ADD", ann); users.forEach(u => addNotification(u.id, `New Bulletin: ${ann.title}`, 'INFO', 'HOME', ann.id)); }} />;
      case 'GALLERY': return <Gallery items={gallery} isAdmin={currentUser.role === UserRole.ADMIN} onDelete={async (id) => await dbAction("gallery", "DELETE", null, id)} onUpload={async (item) => await dbAction("gallery", "ADD", item)} onRequestDownload={async (itemId) => { await dbAction("requests", "ADD", { userId: currentUser.id, userName: currentUser.name, type: 'FILE_DOWNLOAD', targetId: itemId, status: RequestStatus.PENDING, timestamp: new Date().toISOString() }); }} />;
      case 'ANNOUNCEMENTS': return <Announcements list={announcements} isAdmin={currentUser.role === UserRole.ADMIN} onAdd={async (ann) => { await dbAction("announcements", "ADD", { ...ann, authorId: currentUser.id }); users.forEach(u => addNotification(u.id, `Announcement: ${ann.title}`, 'INFO', 'HOME', ann.id)); }} onAddEvent={async (evt) => { await dbAction("events", "ADD", evt); users.forEach(u => addNotification(u.id, `New Event: ${evt.title}`, 'SUCCESS', 'HOME', evt.id)); }} onDelete={async (id) => await dbAction("announcements", "DELETE", null, id)} />;
      case 'NOTIFICATIONS': return <Notifications list={notifications.filter(n => n.userId === currentUser.id)} onClear={async () => { const userNotifs = notifications.filter(n => n.userId === currentUser.id); for (const n of userNotifs) { await dbAction("notifications", "DELETE", null, n.id); } }} onNotificationClick={async (target, id) => { if (target) setCurrentPage(target); await dbAction("notifications", "UPDATE", { read: true }, id); }} />;
      case 'MESSAGES': return <Messages currentUser={currentUser} messages={messages} users={users} onSendMessage={handleSendMessage} />;
      case 'PROFILE': return <Profile user={currentUser} isInitialSetup={isNewUserSetup} onSave={async (updated) => { 
          // Use non-blocking local update
          dbAction("users", "UPDATE", updated, updated.id); 
          setIsNewUserSetup(false); 
          setCurrentPage('HOME'); 
        }} />;
      case 'ADMIN': return <AdminDashboard requests={requests} onAction={async (reqId, action) => { await dbAction("requests", "UPDATE", { status: action }, reqId); const req = requests.find(r => r.id === reqId); if (req) addNotification(req.userId, `Request ${action.toLowerCase()}`, action === RequestStatus.APPROVED ? 'SUCCESS' : 'WARNING'); }} onDeleteEvent={async (id) => await dbAction("events", "DELETE", null, id)} events={events} onAddEvent={async (e) => await dbAction("events", "ADD", e)} users={users} onRemoveAttendee={async (eventId, userId) => { const event = events.find(e => e.id === eventId); if (event) await dbAction("events", "UPDATE", { attendees: event.attendees.filter(id => id !== userId) }, eventId); }} />;
      default: return null;
    }
  };

  if (loading && currentPage === 'LOGIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Portal Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {currentUser && !isNewUserSetup && (
        <Navbar 
          user={currentUser} current={currentPage} navigate={setCurrentPage} 
          logout={() => { setCurrentUser(null); setCurrentPage('LOGIN'); }}
          notificationCount={notifications.filter(n => n.userId === currentUser.id && !n.read).length}
        />
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4 mr-2">
           <button 
              onClick={() => setShowErrorModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                isFallbackMode 
                ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
           >
              {isFallbackMode ? <CloudOff className="w-4 h-4" /> : <CloudCheck className="w-4 h-4" />}
              {isFallbackMode ? 'Local Mode' : 'Cloud Active'}
              {firebaseError && <AlertTriangle className="w-3.5 h-3.5 ml-1 animate-pulse" />}
           </button>
        </div>
        {renderContent()}
      </main>

      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Persistence Status">
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border flex items-start gap-4 ${isFallbackMode ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
            {isFallbackMode ? <Database className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" /> : <CloudCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-tight">{isFallbackMode ? 'Safe Local Storage' : 'Cloud Active'}</p>
              <p className="text-xs font-medium leading-relaxed opacity-80">{isFallbackMode ? "Changes are saved locally to this browser because the Cloud API is disabled or unreachable." : "Your data is being synced across all devices in real-time."}</p>
            </div>
          </div>
          {firebaseError && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Cloud Diagnostic</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{firebaseError}"</p>
              <p className="text-[11px] text-slate-500">Ensure the <b>Firestore API</b> is enabled in the Google Console for project <b>{firebaseConfig.projectId}</b>.</p>
              <a href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${firebaseConfig.projectId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl text-sky-600 hover:bg-sky-50 transition-all font-bold text-xs">
                Open Console <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
          <button onClick={() => { sessionStorage.removeItem('fb_fallback'); setIsFallbackMode(false); setFirebaseError(null); setShowErrorModal(false); setLoading(true); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
            <RefreshCw className="w-4 h-4" /> Retry Sync
          </button>
        </div>
      </Modal>

      <footer className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-50">
        &copy; Nicolites Montessori School • Community Portal
      </footer>
    </div>
  );
};

export default App;
