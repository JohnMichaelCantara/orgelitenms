
import React, { useState, useRef } from 'react';
import { GalleryItem } from '../types';
import { Download, Lock, Trash2, FileText, Image as ImageIcon, Upload, Search } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpload: (item: GalleryItem) => void;
  onRequestDownload: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, isAdmin, onDelete, onUpload, onRequestDownload }) => {
  const [filter, setFilter] = useState<'ALL' | 'PHOTO' | 'DOCUMENT'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filteredItems = items.filter(item => filter === 'ALL' || item.type === filter);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: GalleryItem = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          title: file.name,
          type: file.type.startsWith('image/') ? 'PHOTO' : 'DOCUMENT',
          isPublic: true
        };
        onUpload(newItem);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Resource Center</h2>
          <p className="text-slate-500 text-sm lg:text-base font-medium">Community assets, media, and official files</p>
        </div>
        
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
          {(['ALL', 'PHOTO', 'DOCUMENT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f === 'PHOTO' ? 'Photos' : f === 'DOCUMENT' ? 'Files' : 'Everything'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {isAdmin && (
          <>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center gap-5 p-12 border-2 border-dashed border-slate-200 rounded-[3rem] hover:border-slate-900 hover:bg-slate-50 transition-all bg-white relative overflow-hidden"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                <Upload className="w-8 h-8 lg:w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-black text-slate-800 text-sm">Add Resource</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Image or PDF</p>
              </div>
            </button>
          </>
        )}

        {filteredItems.map(item => (
          <div key={item.id} className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2">
            {item.type === 'PHOTO' ? (
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {!item.isPublic && (
                  <div className="absolute top-4 right-4 p-2 bg-slate-900/60 backdrop-blur-md text-white rounded-xl">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-6 transition-colors group-hover:bg-slate-100">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                   <FileText className="w-10 h-10 stroke-[1.5px] text-slate-200" />
                </div>
                <div className="px-6 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block truncate w-full">{item.title}</span>
                  <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">Protected Document</p>
                </div>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-black text-slate-800 truncate text-sm">{item.title}</h3>
                <div className="shrink-0 p-2 bg-slate-50 rounded-xl">
                   {item.type === 'PHOTO' ? <ImageIcon className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              <div className="flex gap-3">
                {isAdmin ? (
                  <button 
                    onClick={() => onDelete(item.id)} 
                    className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <button 
                    onClick={() => item.isPublic ? alert('Download started...') : onRequestDownload(item.id)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-100 ${
                      item.isPublic ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {item.isPublic ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {item.isPublic ? 'Download' : 'Request Access'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !isAdmin && (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 opacity-30">
            <Search className="w-16 h-16 text-slate-200" />
            <p className="text-xl font-black uppercase tracking-widest">No matching resources</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
