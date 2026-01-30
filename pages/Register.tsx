
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LOGO_URLS } from '../constants';
import { doc, getDoc } from "firebase/firestore";
import { ArrowRight, AlertCircle, ChevronLeft, Loader2, User as UserIcon, Key } from 'lucide-react';

interface RegisterProps {
  users: User[];
  db: any;
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ users, db, onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');

  const sanitizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return cleaned;
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.name.trim().length < 2) {
      setError("Please enter your official name.");
      return;
    }

    const phoneToStore = sanitizePhone(formData.phone);
    const fullPhone = '+63' + phoneToStore;
    const deterministicId = `user_${phoneToStore}`;

    setIsSending(true);

    // GUARD: Check if identity already exists globally to prevent duplicates
    // Tier 1: Check current local directory
    const existsLocally = users.find(u => u.phone === fullPhone) || users.find(u => u.id === deterministicId);
    if (existsLocally) {
      setError('Registration Blocked: This number is already registered. Please go to the Access Portal to open your existing account.');
      setIsSending(false);
      return;
    }

    // Tier 2: Query the Global Cloud Database (Critical for cross-device prevention)
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, "users", deterministicId));
        if (userDoc.exists()) {
          setError('Global Identity Detected: You already have an account created on another device. Please use the Access Portal to log in.');
          setIsSending(false);
          return;
        }
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          // If Firestore is disabled, we warn but allow local if truly necessary (though we want API enabled)
        }
      }
    }

    // Procced with registration if number is unique
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSending(false);
      setStep(2);
    }, 1200);
  };

  const handleVerifyAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() === generatedOtp && generatedOtp !== '') {
      setIsFinishing(true);
      const phoneToStore = sanitizePhone(formData.phone);
      const deterministicId = `user_${phoneToStore}`;
      
      const newUser: User = {
        id: deterministicId,
        name: formData.name,
        phone: '+63' + phoneToStore,
        role: UserRole.USER,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      };
      
      onRegister(newUser);
    } else {
      setError('Verification Failed: Global Handshake code mismatch.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-10 bg-white rounded-[4rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onSwitchToLogin} className="p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">New Identity</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Registry Hub</p>
        </div>
      </div>

      <div className="text-center mb-10 px-6">
        <div className="flex justify-center items-center -space-x-3 mb-8">
          {LOGO_URLS.map((url, i) => (
            <div key={i} className="w-16 h-16 bg-white rounded-2xl p-1 shadow-lg border border-slate-100 overflow-hidden" style={{ transform: `rotate(${i === 0 ? '-8deg' : i === 2 ? '8deg' : '0deg'})` }}>
              <img src={url} referrerPolicy="no-referrer" className="w-full h-full object-contain" alt="Org Logo" />
            </div>
          ))}
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Join the Hub</h2>
        <p className="text-slate-400 font-medium">Create your unique organizational key. Your profile will automatically sync across all your devices.</p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-start gap-4 animate-in shake">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-600 font-bold leading-relaxed">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleStartVerification} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Official Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" required autoFocus value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] focus:ring-4 focus:ring-sky-100 outline-none font-bold text-lg" placeholder="Enter Full Name" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Mobile Phone Key</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4 border-r border-slate-200">
                  <span className="text-slate-400 font-black">+63</span>
                </div>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full pl-24 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] focus:ring-4 focus:ring-sky-100 outline-none font-bold text-lg" placeholder="917 123 4567" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSending} className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
            {isSending ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying Global Directory...</> : <>Register Profile <ArrowRight className="w-6 h-6" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndComplete} className="space-y-10">
          <div className="p-10 bg-sky-50 rounded-[3rem] border border-sky-100 text-center space-y-4">
            <Key className="w-6 h-6 text-sky-600 mx-auto" />
            <div className="text-6xl font-black text-slate-900 tracking-[0.25em]">{generatedOtp}</div>
            <p className="text-[10px] font-black text-sky-600/60 uppercase tracking-[0.3em]">Device Identity Handshake</p>
          </div>
          <input type="text" required autoFocus value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full p-10 text-5xl font-black tracking-[0.6em] text-center bg-slate-50 border border-slate-100 rounded-[3rem] focus:ring-4 focus:ring-sky-100 outline-none" placeholder="••••••" maxLength={6} />
          <button type="submit" disabled={isFinishing} className="w-full py-6 bg-sky-600 text-white rounded-[2.2rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50">
            {isFinishing ? <><Loader2 className="w-6 h-6 animate-spin" /> Securing Registry Profile...</> : <>Finalize Hub Account</>}
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
