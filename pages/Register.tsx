
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LOGO_URLS } from '../constants';
import { ArrowRight, AlertCircle, ChevronLeft, Loader2, User as UserIcon, Key } from 'lucide-react';

interface RegisterProps {
  users: User[];
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ users, onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');

  const sanitizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return cleaned;
  };

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.name.trim().length < 2) {
      setError("Please enter your full identity name.");
      return;
    }

    const phoneToStore = sanitizePhone(formData.phone);
    const fullPhone = '+63' + phoneToStore;

    const exists = users.find(u => u.phone === fullPhone);
    if (exists) {
      setError('This number is already registered. Logging in will restore all your data.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSending(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp && generatedOtp !== '') {
      const phoneToStore = sanitizePhone(formData.phone);
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        phone: '+63' + phoneToStore,
        role: UserRole.USER,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      };
      onRegister(newUser);
    } else {
      setError('The setup code you entered is incorrect. Verification failed.');
    }
  };

  const fallbacks = ["N", "M", "S"];

  return (
    <div className="max-w-xl mx-auto mt-12 p-10 bg-white rounded-[4rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onSwitchToLogin} className="p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">New Identity</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Portal Membership</p>
        </div>
      </div>

      <div className="text-center mb-10 px-6">
        <div className="flex justify-center items-center -space-x-3 mb-8">
          {LOGO_URLS.map((url, i) => (
            <div 
              key={i} 
              className="w-16 h-16 bg-white rounded-2xl p-1 shadow-lg border border-slate-100 overflow-hidden transform transition-all hover:scale-110 hover:z-10 hover:-translate-y-1 cursor-default" 
              style={{ transform: `rotate(${i === 0 ? '-8deg' : i === 2 ? '8deg' : '0deg'})` }}
            >
              <img 
                src={url} 
                alt={`Logo ${i + 1}`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${fallbacks[i]}&backgroundColor=f1f5f9&textColor=475569&fontSize=40`;
                }}
              />
            </div>
          ))}
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Register Phone</h2>
        <p className="text-slate-400 font-medium leading-relaxed">Your mobile number is your permanent identity key. Registering once allows you to restore your profile anytime.</p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-start gap-4 animate-in shake duration-500">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-600 font-bold leading-relaxed">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleStartVerification} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Identity Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-sky-500" />
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] focus:ring-4 focus:ring-sky-100 outline-none font-bold text-lg transition-all"
                  placeholder="Juan dela Cruz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Permanent Mobile Key</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4 border-r border-slate-200">
                  <span className="text-slate-400 font-black">+63</span>
                </div>
                <input 
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full pl-24 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] focus:ring-4 focus:ring-sky-100 outline-none font-bold text-lg transition-all"
                  placeholder="917 123 4567"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSending}
            className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {isSending ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Verifying Device...</>
            ) : (
              <>Register Identity & Get Code <ArrowRight className="w-6 h-6" /></>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndComplete} className="space-y-10">
          <div className="p-10 bg-sky-50 rounded-[3rem] border border-sky-100 text-center space-y-4 shadow-inner animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-center gap-2 text-sky-600 mb-2">
              <Key className="w-6 h-6" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em]">Your Setup Code</span>
            </div>
            <div className="text-6xl font-black text-slate-900 tracking-[0.25em]">
              {generatedOtp}
            </div>
            <p className="text-[10px] font-black text-sky-600/60 uppercase tracking-[0.3em] pt-4 border-t border-sky-200/50">Manually enter to verify identity</p>
          </div>

          <div className="space-y-6">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Enter the code shown above</label>
            <input 
              type="text" 
              required
              autoFocus
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full p-10 text-5xl font-black tracking-[0.6em] text-center bg-slate-50 border border-slate-100 rounded-[3rem] focus:ring-4 focus:ring-sky-100 outline-none"
              placeholder="••••••"
              maxLength={6}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-6 bg-sky-600 text-white rounded-[2.2rem] font-black text-lg shadow-2xl active:scale-95 transition-transform"
          >
            Finalize My Portal Account
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
