
import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, Event, Announcement, GalleryItem, 
  UserRequest, Message, Notification, RequestStatus 
} from './types';
import { 
  MOCK_USERS, INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, 
  INITIAL_GALLERY, INITIAL_NOTIFICATIONS 
} from './constants';
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

const App: React.FC = () => {
  type Page = 'HOME' | 'GALLERY' | 'ANNOUNCEMENTS' | 'NOTIFICATIONS' | 'MESSAGES' | 'ADMIN' | 'LOGIN' | 'REGISTER' | 'PROFILE';
  const [currentPage, setCurrentPage] = useState<Page>('LOGIN');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNewUserSetup, setIsNewUserSetup] = useState(false);

  // Persistence logic
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('portal_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('portal_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('portal_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('portal_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [requests, setRequests] = useState<UserRequest[]>(() => {
    const saved = localStorage.getItem('portal_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('portal_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('portal_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('portal_users', JSON.stringify(users));
    localStorage.setItem('portal_events', JSON.stringify(events));
    localStorage.setItem('portal_announcements', JSON.stringify(announcements));
    localStorage.setItem('portal_gallery', JSON.stringify(gallery));
    localStorage.setItem('portal_requests', JSON.stringify(requests));
    localStorage.setItem('portal_notifications', JSON.stringify(notifications));
    localStorage.setItem('portal_messages', JSON.stringify(messages));
  }, [users, events, announcements, gallery, requests, notifications, messages]);

  useEffect(() => {
    const chatChannel = new BroadcastChannel('community_hub_chat');
    chatChannel.onmessage = (event) => {
      const newMessage = event.data as Message;
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      if (currentUser && newMessage.receiverId === currentUser.id) {
        const sender = users.find(u => u.id === newMessage.senderId);
        addNotification(currentUser.id, `New message from ${sender?.name || 'anonymized member'}`, 'INFO', 'MESSAGES');
      }
    };
    return () => chatChannel.close();
  }, [currentUser, users]);

  const addNotification = (userId: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO', targetPage?: Page, targetId?: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      targetPage,
      targetId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const notifyAll = (message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO', targetPage?: Page, targetId?: string) => {
    users.forEach(user => {
      addNotification(user.id, message, type, targetPage, targetId);
    });
  };

  const handleSendMessage = (text: string, receiverId: string) => {
    if (!currentUser) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, msg]);
    const chatChannel = new BroadcastChannel('community_hub_chat');
    chatChannel.postMessage(msg);
    chatChannel.close();
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('LOGIN');
    setIsNewUserSetup(false);
  };

  const handleAuthSuccess = (user: User, isNew: boolean = false) => {
    if (isNew) {
      setUsers(prev => {
        if (prev.find(u => u.phone === user.phone)) return prev;
        return [...prev, user];
      });
      setIsNewUserSetup(true);
      setCurrentPage('PROFILE');
    } else {
      setCurrentPage('HOME');
    }
    setCurrentUser(user);
  };

  const notifyAdmins = (message: string) => {
    const admins = users.filter(u => u.role === UserRole.ADMIN);
    admins.forEach(admin => addNotification(admin.id, message, 'INFO', 'ADMIN'));
  };

  const handleToggleJoinEvent = (eventId: string) => {
    if (!currentUser) return;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const isJoined = e.attendees.includes(currentUser.id);
        if (isJoined) {
          return { ...e, attendees: e.attendees.filter(id => id !== currentUser.id) };
        } else {
          return { ...e, attendees: [...e.attendees, currentUser.id] };
        }
      }
      return e;
    }));
  };

  const handleNotificationClick = (targetPage: Page | undefined, targetId: string | undefined, notificationId: string) => {
    if (targetPage) {
      setCurrentPage(targetPage);
      // Mark as read
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      
      // If there's a targetId, wait for page change then scroll
      if (targetId) {
        setTimeout(() => {
          const element = document.getElementById(targetId) || document.getElementById(`evt-${targetId}`) || document.getElementById(`ann-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-sky-500/50');
            setTimeout(() => element.classList.remove('ring-4', 'ring-sky-500/50'), 3000);
          }
        }, 100);
      }
    }
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentPage === 'REGISTER') return <Register users={users} onRegister={(u) => handleAuthSuccess(u, true)} onSwitchToLogin={() => setCurrentPage('LOGIN')} />;
      return <Login users={users} onLogin={(u) => handleAuthSuccess(u, false)} onSwitchToRegister={() => setCurrentPage('REGISTER')} />;
    }

    switch (currentPage) {
      case 'HOME': return (
        <Home 
          user={currentUser} 
          events={events} 
          announcements={announcements}
          gallery={gallery}
          onJoinRequest={handleToggleJoinEvent}
          isAdmin={currentUser.role === UserRole.ADMIN}
          onManage={() => setCurrentPage('ADMIN')}
          onExplore={() => setCurrentPage('GALLERY')}
          onQuickUpload={(item) => setGallery(prev => [item, ...prev])}
          onQuickAnnounce={(ann) => {
            setAnnouncements(prev => [ann, ...prev]);
            notifyAll(`New Bulletin: ${ann.title}`, 'INFO', 'HOME', ann.id);
          }}
        />
      );
      case 'GALLERY': return (
        <Gallery 
          items={gallery} 
          isAdmin={currentUser.role === UserRole.ADMIN}
          onDelete={(id) => setGallery(prev => prev.filter(i => i.id !== id))}
          onUpload={(item) => setGallery(prev => [item, ...prev])}
          onRequestDownload={(itemId) => {
            const newReq: UserRequest = {
              id: Math.random().toString(36).substr(2, 9),
              userId: currentUser.id,
              userName: currentUser.name,
              type: 'FILE_DOWNLOAD',
              targetId: itemId,
              status: RequestStatus.PENDING,
              timestamp: new Date().toISOString()
            };
            setRequests(prev => [...prev, newReq]);
            notifyAdmins(`${currentUser.name} requested file access.`);
          }}
        />
      );
      case 'ANNOUNCEMENTS': return (
        <Announcements 
          list={announcements} 
          isAdmin={currentUser.role === UserRole.ADMIN}
          onAdd={(ann) => {
            setAnnouncements(prev => [ann, ...prev]);
            notifyAll(`New Update posted: ${ann.title}`, 'INFO', 'HOME', ann.id);
          }}
          onAddEvent={(evt) => {
            setEvents(prev => [evt, ...prev]);
            notifyAll(`New Event Scheduled: ${evt.title}`, 'SUCCESS', 'HOME', evt.id);
          }}
          onDelete={(id) => setAnnouncements(prev => prev.filter(a => a.id !== id))}
        />
      );
      case 'NOTIFICATIONS': return (
        <Notifications 
          list={notifications.filter(n => n.userId === currentUser.id)} 
          onClear={() => setNotifications(prev => prev.filter(n => n.userId !== currentUser.id))}
          onNotificationClick={(target, id) => {
            const targetNotif = notifications.find(n => n.id === id);
            handleNotificationClick(target, targetNotif?.targetId, id);
          }}
        />
      );
      case 'MESSAGES': return (
        <Messages 
          currentUser={currentUser}
          messages={messages}
          users={users}
          onSendMessage={handleSendMessage}
        />
      );
      case 'PROFILE': return (
        <Profile 
          user={currentUser} 
          isInitialSetup={isNewUserSetup}
          onSave={(updated) => {
            setCurrentUser(updated);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setIsNewUserSetup(false);
            setCurrentPage('HOME');
          }} 
        />
      );
      case 'ADMIN': return (
        <AdminDashboard 
          requests={requests}
          onAction={(reqId, action) => {
            const req = requests.find(r => r.id === reqId);
            if (!req) return;
            setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: action } : r));
            addNotification(req.userId, `Your request has been ${action.toLowerCase()}.`, action === RequestStatus.APPROVED ? 'SUCCESS' : 'WARNING');
            if (action === RequestStatus.APPROVED && req.type === 'EVENT_JOIN') {
              setEvents(prev => prev.map(e => e.id === req.targetId ? { ...e, attendees: [...new Set([...e.attendees, req.userId])] } : e));
            }
          }}
          onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
          events={events}
          onAddEvent={(e) => {
            setEvents(prev => [e, ...prev]);
            notifyAll(`New Event Scheduled: ${e.title}`, 'SUCCESS', 'HOME', e.id);
          }}
          users={users}
          onRemoveAttendee={(eventId, userId) => {
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees.filter(id => id !== userId) } : e));
          }}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {currentUser && !isNewUserSetup && (
        <Navbar 
          user={currentUser}
          current={currentPage} 
          navigate={setCurrentPage} 
          logout={logout}
          notificationCount={notifications.filter(n => n.userId === currentUser.id && !n.read).length}
        />
      )}
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <footer className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-50">
        &copy; Nicolites Montessori School
      </footer>
    </div>
  );
};

export default App;
