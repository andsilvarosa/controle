import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CalendarDays, PieChart, Tags, Zap, Settings, 
  ChevronLeft, ChevronRight, LogOut, X, CreditCard, Target, 
  Shield, PiggyBank, CheckCircle2, Globe2
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { ViewType } from '../../types';
import { UserAvatar } from '../UI/UserAvatar';

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Extrato', icon: LayoutDashboard },
  { id: 'wallets' as ViewType, label: 'Carteiras', icon: CreditCard },
  { id: 'budgets' as ViewType, label: 'Metas', icon: Target },
  { id: 'calendar' as ViewType, label: 'Calendário', icon: CalendarDays },
  { id: 'reports' as ViewType, label: 'Relatórios', icon: PieChart },
  { id: 'categories' as ViewType, label: 'Categorias', icon: Tags },
  { id: 'rules' as ViewType, label: 'Regras', icon: Zap },
];

export const Sidebar: React.FC = () => {
  // 👇 A CORREÇÃO MÁGICA: Navegação global continua no FinanceStore
  const { user, logout, getHealthScore, getBadges, view, setView, setActiveModal } = useFinanceStore();
  
  // 👇 Controle do abre/fecha da barra lateral fica no UIStore
  const { sidebarExpanded, setSidebarExpanded, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const isExpanded = sidebarExpanded;
  const score = getHealthScore();
  const badges = getBadges();

  const percentage = score / 10;
  
  let color = '#3b82f6';
  let label = 'Muito Bom';
  
  if (score >= 800) { color = '#10b981'; label = 'Excelente'; } 
  else if (score >= 600) { color = '#3b82f6'; label = 'Muito Bom'; } 
  else if (score >= 400) { color = '#f59e0b'; label = 'Atenção'; } 
  else { color = '#ef4444'; label = 'Crítico'; }

  const sidebarVariants = { expanded: { width: 280 }, collapsed: { width: 96 } };

  const NavContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const showText = forceExpanded || isExpanded;
    
    return (
      <div className="flex flex-col h-full bg-brand-dark dark:bg-black text-brand-gray border-r border-brand-gray/5 transition-colors">
        
        <div className={`flex-shrink-0 transition-all duration-300 ${showText ? 'p-6 pb-2' : 'p-3 py-6'}`}>
           <div className={`relative rounded-4xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
               showText ? 'bg-white/5 border border-white/5 p-6' : 'bg-transparent'
           }`}>
               <div className={`relative flex-shrink-0 transition-all duration-500 flex items-center justify-center ${showText ? 'w-24 h-24' : 'w-14 h-14'}`}>
                   <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${showText ? 'scale-100' : 'scale-150'} transition-all bg-brand-green`} />

                   <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                       <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth={showText ? "6" : "8"} fill="transparent" className="text-white/5" />
                       <circle cx="50%" cy="50%" r="45%" stroke="#21C25E" strokeWidth={showText ? "6" : "8"} fill="transparent" strokeDasharray={283} strokeDashoffset={283 - (283 * percentage) / 100} strokeLinecap="round" className={`transition-all duration-1000 ease-out`} />
                   </svg>
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={`font-black text-white leading-none ${showText ? 'text-2xl' : 'text-sm'}`}>{score}</span>
                       {showText && <span className="text-[10px] uppercase font-black text-white/40 mt-1 tracking-widest">Score</span>}
                   </div>
               </div>

               {showText && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center w-full">
                       <p className="text-sm font-black tracking-widest mb-3 uppercase text-brand-green">{label}</p>
                       <div className="flex gap-2 justify-center flex-wrap bg-black/20 p-2 rounded-2xl border border-white/5">
                           {badges.map(b => (
                               <div key={b.id} className={`p-1.5 rounded-xl transition-all ${b.achieved ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-white/5 text-white/20 grayscale opacity-50'}`} title={b.title + (b.achieved ? ' (Conquistado)' : ' (Bloqueado)')}>
                                   {b.icon === 'Shield' && <Shield size={14} />}
                                   {b.icon === 'PiggyBank' && <PiggyBank size={14} />}
                                   {b.icon === 'CheckCircle2' && <CheckCircle2 size={14} />}
                                   {b.icon === 'Globe2' && <Globe2 size={14} />}
                               </div>
                           ))}
                       </div>
                   </motion.div>
               )}
           </div>
           
           {forceExpanded && (
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto min-h-0 custom-scrollbar">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); if (forceExpanded) setMobileMenuOpen(false); }} className={`w-full flex items-center relative group transition-all duration-300 ${showText ? 'px-4 py-4 gap-4 rounded-3xl' : 'justify-center py-4 rounded-3xl'} ${view === item.id ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20' : 'hover:bg-white/5 hover:text-white text-brand-gray/40'}`}>
              <item.icon size={22} className={`flex-shrink-0 transition-colors ${view === item.id ? 'text-white' : 'group-hover:text-brand-green'}`} />
              {showText ? (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-black text-sm whitespace-nowrap tracking-tight">{item.label}</motion.span>
              ) : (
                <div className="absolute left-full ml-4 px-4 py-2 bg-brand-dark text-white text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap border border-white/10 shadow-2xl tracking-widest uppercase">{item.label}</div>
              )}
            </button>
          ))}

          <div className="my-4 border-t border-white/5 mx-4" />

          <button onClick={() => { setView('settings'); if (forceExpanded) setMobileMenuOpen(false); }} className={`w-full flex items-center relative group transition-all duration-300 ${showText ? 'px-4 py-4 gap-4 rounded-3xl' : 'justify-center py-4 rounded-3xl'} ${view === 'settings' ? 'bg-brand-green text-white shadow-xl' : 'hover:bg-white/5 hover:text-white text-brand-gray/40'}`}>
            <Settings size={22} className={`flex-shrink-0 ${view === 'settings' ? 'text-white' : 'group-hover:text-brand-green'}`} />
            {showText ? (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-black text-sm whitespace-nowrap tracking-tight">Configurações</motion.span>
            ) : (
                <div className="absolute left-full ml-4 px-4 py-2 bg-brand-dark text-white text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap border border-white/10 shadow-2xl tracking-widest uppercase">Configurações</div>
            )}
          </button>

          <button onClick={() => { setActiveModal('profile'); if (forceExpanded) setMobileMenuOpen(false); }} className={`w-full flex items-center relative group transition-all duration-300 ${showText ? 'px-3 py-3 gap-3 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10' : 'justify-center py-3 rounded-3xl hover:bg-white/5'}`}>
            <UserAvatar avatar={user.avatar} className="w-10 h-10 flex-shrink-0 ring-2 ring-brand-green/20" size={20} />
            {showText && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-black text-white truncate">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-brand-gray/30 font-black uppercase tracking-widest truncate">Meu Perfil</p>
                </motion.div>
            )}
          </button>

          <button onClick={logout} className={`w-full flex items-center relative group transition-all duration-300 ${showText ? 'px-4 py-4 gap-4 rounded-3xl' : 'justify-center py-4 rounded-3xl'} text-red-400 hover:bg-red-500/10 hover:text-red-300`}>
            <LogOut size={22} className="flex-shrink-0" />
            {showText ? (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-black text-sm whitespace-nowrap tracking-tight">Sair</motion.span>
            ) : (
                <div className="absolute left-full ml-4 px-4 py-2 bg-red-900 text-white text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap border border-red-800 shadow-2xl tracking-widest uppercase">Sair</div>
            )}
          </button>

        </nav>
      </div>
    );
  };

  return (
    <>
      <motion.aside initial={false} animate={isExpanded ? "expanded" : "collapsed"} variants={sidebarVariants} className="hidden lg:flex flex-col h-screen sticky top-0 z-50 transition-all relative border-r border-white/5 shadow-2xl bg-brand-dark">
        <NavContent />
        <button onClick={() => setSidebarExpanded(!isExpanded)} className="absolute -right-4 top-24 bg-brand-green text-white p-2 rounded-full shadow-xl z-50 hover:scale-110 transition-transform border-4 border-brand-dark ring-1 ring-white/10">
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </motion.aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-[300px] z-[110] lg:hidden shadow-2xl overflow-hidden" style={{ height: '100dvh' }}>
              <NavContent forceExpanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
