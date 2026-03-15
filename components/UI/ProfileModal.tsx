
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Mail, Check, Camera, Upload, Phone,
  UserRound, Ghost, Smile, Cat, Dog, Bird, Rabbit, Zap, Heart, Star, Moon 
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { UserAvatar } from './UserAvatar';

const avatarOptions = [
  { icon: 'User', color: 'teal' },
  { icon: 'UserRound', color: 'blue' },
  { icon: 'Ghost', color: 'purple' },
  { icon: 'Smile', color: 'emerald' },
  { icon: 'Cat', color: 'amber' },
  { icon: 'Dog', color: 'red' },
  { icon: 'Bird', color: 'cyan' },
  { icon: 'Rabbit', color: 'pink' },
  { icon: 'Zap', color: 'indigo' },
  { icon: 'Heart', color: 'rose' },
  { icon: 'Star', color: 'yellow' },
  { icon: 'Moon', color: 'slate' },
];

export const ProfileModal: React.FC = () => {
  const { activeModal, setActiveModal, user, setUser } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    if (activeModal === 'profile') {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar
      });
    }
  }, [activeModal, user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    // Mascara (99) 99999-9999
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 9) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    
    setFormData({ ...formData, phone: val });
  };

  if (activeModal !== 'profile') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
  };

  const selectAvatar = (icon: string, color: string) => {
    setFormData({ ...formData, avatar: `icon:${icon}:${color}` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={() => setActiveModal(null)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10 my-auto"
      >
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Perfil do Usuário</h2>
            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Avatar Preview and Upload Action */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <UserAvatar avatar={formData.avatar} className="w-24 h-24" size={48} />
                <button 
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 p-2 bg-[#14b8a6] text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="mt-3 text-xs text-slate-400 font-bold uppercase tracking-widest">Foto de Perfil</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Celular (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all font-medium"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Ícones Sugeridos</label>
                <button 
                  type="button" 
                  onClick={triggerFileInput}
                  className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest flex items-center gap-1"
                >
                  <Upload size={12} />
                  Fazer Upload
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((opt) => {
                  const avatarId = `icon:${opt.icon}:${opt.color}`;
                  const isSelected = formData.avatar === avatarId;
                  
                  return (
                    <button
                      key={avatarId}
                      type="button"
                      onClick={() => selectAvatar(opt.icon, opt.color)}
                      className="relative flex items-center justify-center p-1 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    >
                      <UserAvatar avatar={avatarId} className="w-12 h-12" size={24} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                          <div className="bg-teal-500 text-white rounded-full p-0.5">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-teal-500 hover:bg-teal-600 rounded-2xl font-bold text-white text-lg shadow-xl shadow-teal-500/20 transition-all active:scale-95"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
