
import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2, Key, Database } from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";
import { User } from '../types';
import { LOGO_URLS } from '../constants';

interface LoginProps {
  users: User[];
  db: any;
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ users, db, onLogin, onSwitchToRegister }) => {
  const [step, setStep] = useState(1); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');

  const sanitizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return cleaned;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const phoneToSearch = sanitizePhone(phone);
    const fullPhone = '+63' + phoneToSearch;
    const deterministicId = `user_${phoneToSearch}`;

    if (step === 1) {
      setIsVerifying(true);
      
      // Step A: Check local cache first
      let user = users.find(u => u.phone === fullPhone) || users.find(u => u.id === deterministicId);

      // Step B: RESTORATION - Query the Global Cloud Database (Crucial for new devices)
      if (!user && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", deterministicId));
          if (userDoc.exists()) {
            user = { id: userDoc.id, ...userDoc.data() } as User;
          }
        } catch (err: any) {
          if (err.message?.toLowerCase().includes('permission-denied') || err.code === 'permission-denied') {
            setError("Sync Required: Cloud Database API is disabled. Account restoration is currently limited.");
            setIsVerifying(false);
            return;
          }
        }
      }
      
      if (!user) {
        setError("Identity Not Found: Please register your number in the Hub first.");
        setIsVerifying(false);
        return;
      }

      // Identity Found -> Start Handshake
      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setIsVerifying(false);
        setStep(2);
      }, 1500); 
    } else {
      if (otp === generatedOtp && generatedOtp !== '') {
        const phoneToSearch = sanitizePhone(phone);
        const deterministicId = `user_${phoneToSearch}`;
        
        // Final restoration check
        const user = users.find(u => u.id === deterministicId);
        if (user) {
          onLogin(user);
        } else if (db) {
          // Rescue fetch if state is async
          const userDoc = await getDoc(doc(db, "users", deterministicId));
          if (userDoc.exists()) onLogin({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } else {
        setError('Verification Failure: Handshake code mismatch.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[4rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center -space-x-4 mb-8">
          {LOGO_URLS.map((url, i) => (
            <div key={i} className="w-20 h-20 bg-white rounded-3xl p-1.5 shadow-xl border border-slate-100 overflow-hidden transform transition-all hover:scale-110 hover:z-10 cursor-default flex items-center justify-center">
              <img src={url} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Access Portal</h2>
        <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-[10px]">Deterministic Account Restoration</p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4 animate-in shake">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
        </div>
      )}

      <form onSubmit={handlePhoneSubmit} className="space-y-8">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Mobile Phone Key</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">+63</span>
                <input 
                  type="tel" 
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="917 123 4567"
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2.2rem] focus:ring-4 focus:ring-sky-100 outline-none font-black text-xl transition-all"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Querying Global Hub...</>
              ) : (
                <>Open Account <ArrowRight className="w-6 h-6" /></>
              )}
            </button>

            <div className="p-5 bg-sky-50 rounded-[2rem] flex items-start gap-4 border border-sky-100">
              <Database className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-sky-800 leading-relaxed font-bold">
                Identity synchronization is active. You can log in on any device using this number to restore your full profile.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
            <div className="p-8 bg-sky-50 rounded-[2.5rem] border border-sky-100 text-center space-y-4 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-sky-600 mb-2">
                <Key className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hub Session Pin</span>
              </div>
              <div className="text-5xl font-black text-slate-900 tracking-[0.2em]">{generatedOtp}</div>
            </div>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="••••••" maxLength={6} className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center text-4xl font-black tracking-[0.6em] focus:ring-4 focus:ring-sky-100 outline-none" required />
            <button type="submit" className="w-full py-6 bg-sky-600 text-white rounded-[2.2rem] font-black text-lg shadow-2xl active:scale-95 transition-all">Verify & Link Account</button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-sky-600 transition-colors">Wrong number?</button>
          </div>
        )}
      </form>

      <div className="mt-12 text-center pt-8 border-t border-slate-50">
        <p className="text-sm font-bold text-slate-400">New Profile? <button onClick={onSwitchToRegister} className="text-sky-600 ml-2 hover:underline font-black">Register Identity</button></p>
      </div>
    </div>
  );
};

export default Login;
