
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Camera, Save, Phone, User as UserIcon, Mail, Shield, Check, ArrowRight, Loader2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onSave: (user: User) => void;
  isInitialSetup?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onSave, isInitialSetup = false }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [isEditing, setIsEditing] = useState(isInitialSetup);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 pt-4">
      {isInitialSetup && (
        <div className="mb-12 text-center px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm mx-auto mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity Verification</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">Complete Your Identity</h2>
          <p className="text-slate-500 font-medium text-base lg:text-xl max-w-md mx-auto leading-relaxed">
            Personalize your presence within the organizational hub.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] lg:rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
        {/* Banner with radial gradient */}
        <div className="h-40 lg:h-56 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent)]" />
          
          {/* Avatar positioning fix: centered on mobile, inset on desktop */}
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 p-1.5 lg:p-2 bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl z-20">
            <div className="relative group rounded-[1.6rem] lg:rounded-[2.2rem] overflow-hidden w-28 h-28 lg:w-40 lg:h-40 bg-slate-50">
              <img 
                src={formData.avatar} 
                className={`w-full h-full object-cover transition-all duration-700 ${isUploading ? 'opacity-30 blur-sm' : 'group-hover:scale-110'}`} 
                alt="Profile" 
              />
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px] flex flex-col items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 lg:w-10 lg:h-10 mb-2" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Update</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="pt-20 lg:pt-32 px-6 lg:px-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 text-center lg:text-left">
            <div className="space-y-4">
              <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {formData.name || 'Set Your Name'}
              </h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${
                  formData.role === UserRole.ADMIN 
                  ? 'bg-blue-50 text-blue-700 border-blue-100' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {formData.role} Profile
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Identity</span>
                </div>
              </div>
            </div>
            {!isInitialSetup && (
              <button 
                type="button"
                onClick={() => {
                  if (isEditing) setFormData({ ...user });
                  setIsEditing(!isEditing);
                }} 
                className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  isEditing ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Identity'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            {isInitialSetup && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-px bg-slate-100 flex-1" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Role Selection</p>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, role: UserRole.USER })} 
                    className={`group p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-6 relative overflow-hidden ${
                      formData.role === UserRole.USER 
                        ? 'border-blue-500 bg-blue-50/40 shadow-2xl shadow-blue-100' 
                        : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.role === UserRole.USER ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <UserIcon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-2xl text-slate-900 block">Member</span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Access to resources, events, and community updates.</p>
                    </div>
                    {formData.role === UserRole.USER && (
                      <div className="absolute top-6 right-6 p-1.5 bg-blue-600 rounded-full text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, role: UserRole.ADMIN })} 
                    className={`group p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-6 relative overflow-hidden ${
                      formData.role === UserRole.ADMIN 
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-2xl shadow-emerald-100' 
                        : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.role === UserRole.ADMIN ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Shield className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-2xl text-slate-900 block">Administrator</span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Full control over organizational tools and members.</p>
                    </div>
                    {formData.role === UserRole.ADMIN && (
                      <div className="absolute top-6 right-6 p-1.5 bg-emerald-600 rounded-full text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-3">Identity Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" />
                  <input 
                    type="text" 
                    required 
                    disabled={!isEditing} 
                    value={formData.name || ''} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] text-base lg:text-lg font-bold focus:ring-8 focus:ring-blue-50/50 outline-none disabled:opacity-50 transition-all" 
                    placeholder="Full legal name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-3">Mobile Key</label>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" />
                  <input 
                    type="tel" 
                    disabled={!isEditing} 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] text-base lg:text-lg font-bold focus:ring-8 focus:ring-blue-50/50 outline-none disabled:opacity-50 transition-all" 
                    placeholder="+63 000 000 0000"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-3">Official Email</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-blue-500" />
                  <input 
                    type="email" 
                    disabled={!isEditing} 
                    value={formData.email || ''} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] text-base lg:text-lg font-bold focus:ring-8 focus:ring-blue-50/50 outline-none disabled:opacity-50 transition-all" 
                    placeholder="name@organization.edu"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-3">Member Biography</label>
                <textarea 
                  disabled={!isEditing} 
                  value={formData.bio || ''} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                  className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-base font-medium h-48 resize-none focus:ring-8 focus:ring-blue-50/50 outline-none disabled:opacity-50 transition-all leading-relaxed" 
                  placeholder="Share your role or goals within the community..." 
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-8 animate-in slide-in-from-bottom-4 duration-500">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg lg:text-xl uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-slate-800"
                >
                  {isInitialSetup ? (
                    <>Finalize Account Setup <ArrowRight className="w-6 h-6" /></>
                  ) : (
                    <>Commit Identity Changes <Save className="w-6 h-6" /></>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
