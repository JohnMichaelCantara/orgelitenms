
import React from 'react';
import { Notification } from '../types';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, Trash2 } from 'lucide-react';

interface NotificationsProps {
  list: Notification[];
  onClear: () => void;
  onNotificationClick?: (targetPage: any, id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ list, onClear, onNotificationClick }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Notifications</h2>
          <p className="text-slate-500">Recent activity and system alerts</p>
        </div>
        {list.length > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-slate-400 font-semibold hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">Your inbox is empty</p>
          </div>
        ) : (
          list.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => onNotificationClick?.(notif.targetPage, notif.id)}
              className={`flex gap-4 p-5 bg-white rounded-2xl border ${notif.read ? 'border-slate-100' : 'border-indigo-100 shadow-sm'} transition-all ${notif.targetPage ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''}`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${
                notif.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 
                notif.type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {notif.type === 'SUCCESS' ? <CheckCircle className="w-5 h-5" /> : 
                 notif.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notif.read ? 'text-slate-500' : 'text-slate-800 font-semibold'}`}>{notif.message}</p>
                <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-[10px] font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
