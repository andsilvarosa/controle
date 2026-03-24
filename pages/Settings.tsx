
import React, { useState } from 'react';
import { User, Bell, Shield, Download, ChevronRight, Calendar } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { UserAvatar } from '../components/UI/UserAvatar';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const Settings: React.FC = () => {
  const { user, categories, rules, setActiveModal } = useFinanceStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const sections = [
    { id: 'profile', icon: User, label: 'Perfil do Usuário', desc: 'Gerencie seus dados e foto' },
    { id: 'notifications', icon: Bell, label: 'Notificações', desc: 'Alertas de vencimento e relatórios', hasToggle: true },
    { id: 'security', icon: Shield, label: 'Segurança', desc: 'Senha e autenticação 2FA' },
  ];

  // Formatar a data de criação
  const creationDate = user.createdAt ? new Date(user.createdAt) : new Date();
  const formattedCreation = creationDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const handleExportSettings = async () => {
    // Preparar dados de categorias
    const catData = categories.map(c => ({
      Nome: c.name,
      Tipo: c.type === 'income' ? 'Receita' : 'Despesa',
      Cor: c.color,
      Icone: c.icon
    }));

    // Preparar dados de regras
    const rulesData = rules.map(r => ({
      Condição: r.condition,
      CategoriaID: r.categoryId,
      Ativa: r.active ? 'Sim' : 'Não'
    }));

    // Criar Workbook
    const wb = XLSX.utils.book_new();
    const wsCat = XLSX.utils.json_to_sheet(catData);
    const wsRules = XLSX.utils.json_to_sheet(rulesData);

    // Adicionar planilhas
    XLSX.utils.book_append_sheet(wb, wsCat, "Categorias");
    XLSX.utils.book_append_sheet(wb, wsRules, "Regras de Automação");

    const fileName = "soscontrole_backup_configuracoes.xlsx";

    try {
      if (Capacitor.isNativePlatform()) {
        const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache
        });
        await Share.share({
          title: 'Exportar Backup de Configurações',
          url: result.uri,
          dialogTitle: 'Compartilhar Backup'
        });
      } else {
        XLSX.writeFile(wb, fileName);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao exportar backup de configurações.");
    }
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'profile':
        setActiveModal('profile');
        break;
      case 'security':
        setActiveModal('security');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Perfil */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <UserAvatar avatar={user.avatar} className="w-24 h-24" size={48} />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 mb-3">{user.email}</p>
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Desde {formattedCreation}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => handleAction('profile')}
          className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all active:scale-95"
        >
          Editar Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preferências */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
             <h3 className="font-bold text-slate-800">Preferências do Sistema</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {sections.map((sec) => (
              <div 
                key={sec.id} 
                onClick={() => !sec.hasToggle && handleAction(sec.id)}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <sec.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{sec.label}</p>
                    <p className="text-sm text-slate-400">{sec.desc}</p>
                  </div>
                </div>
                {sec.hasToggle ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationsEnabled(!notificationsEnabled);
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-teal-500' : 'bg-slate-200'}`}
                  >
                    <motion.div 
                      animate={{ x: notificationsEnabled ? 26 : 2 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                ) : (
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Backup Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Download size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Backup de Configurações</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Exporte todas as suas categorias e regras de automação personalizadas para um arquivo Excel (XLSX). Mantenha seus dados seguros e fáceis de restaurar.
              </p>
              <button 
                onClick={handleExportSettings}
                className="w-full bg-[#14b8a6] hover:bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Download size={20} />
                Exportar Configurações (.xls)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};