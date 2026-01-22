
import React, { useState, useRef } from 'react';
import { GalleryItem } from '../types';
import { Download, Lock, Trash2, FileText, Image as ImageIcon, Upload } from 'lucide-react';

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
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Organization Resources</h2>
          <p className="text-slate-500 text-sm lg:text-base font-medium">Digital assets and shared documentation</p>
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
          {(['ALL', 'PHOTO', 'DOCUMENT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'PHOTO' ? 'Photos' : f === 'DOCUMENT' ? 'Files' : 'All'}
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
              className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-slate-200 rounded-3xl lg:rounded-[3rem] hover:border-slate-400 hover:bg-slate-50 transition-all bg-white"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 lg:w-8 h-8" />
              </div>
              <p className="font-black text-slate-800 text-sm lg:text-base">Upload Resource</p>
            </button>
          </>
        )}

        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-3xl lg:rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {item.type === 'PHOTO' ? (
              <div className="aspect-square bg-slate-100">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
                <FileText className="w-16 h-16 stroke-[1px]" />
                <span className="text-[10px] font-black uppercase tracking-widest px-4 text-center truncate w-full">{item.title}</span>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-black text-slate-800 truncate text-sm">{item.title}</h3>
                <div className="shrink-0">{item.type === 'PHOTO' ? <ImageIcon className="w-4 h-4 text-slate-300" /> : <FileText className="w-4 h-4 text-slate-300" />}</div>
              </div>

              <div className="flex gap-2">
                {isAdmin ? (
                  <button onClick={() => onDelete(item.id)} className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <button 
                    onClick={() => item.isPublic ? alert('Download started...') : onRequestDownload(item.id)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {item.isPublic ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {item.isPublic ? 'Download' : 'Request Access'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
