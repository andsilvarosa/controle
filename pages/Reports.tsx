
import React, { useState, useRef, useMemo } from 'react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Download, Upload, TrendingUp, Activity, PieChart, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const COLORS = ['#14b8a6', '#ef4444', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1', '#84cc16'];

type ReportTab = 'Por Categoria' | 'Mensal' | 'Evolução';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('Por Categoria');
  const { transactions, categories, bulkAddTransactions } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estado de Controle de Data (UX) ---
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // --- Filtro de Transações do Mês Selecionado ---
  const monthlyTransactions = useMemo(() => {
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    return transactions.filter(t => {
      // Usamos dueDate para competência financeira no relatório
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate + 'T00:00:00'); // Fix timezone
      return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
    });
  }, [transactions, selectedDate]);

  // --- DADOS: Gráfico de Pizza (Categorias do Mês) ---
  const dataPie = useMemo(() => {
    return categories.map(cat => {
      const total = monthlyTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
      return { name: cat.name, value: total };
    }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  }, [categories, monthlyTransactions]);

  // --- DADOS: Gráfico de Barras (Histórico - Últimos 6 meses a partir da data selecionada) ---
  const dataBar = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - (5 - i), 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

      const filtered = transactions.filter(t => {
        if (!t.dueDate) return false;
        const tDate = new Date(t.dueDate + 'T00:00:00');
        return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
      });

      const receita = filtered.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
      const despesa = filtered.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

      return { name: label, receita, despesa };
    });
  }, [transactions, selectedDate]);

  // --- DADOS: Evolução (Fluxo diário dentro do mês) ---
  const dataEvolution = useMemo(() => {
    // Agrupar por dia do mês
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const dailyData: Record<number, number> = {};
    
    // Inicializar dias com 0
    for (let i = 1; i <= daysInMonth; i++) dailyData[i] = 0;

    monthlyTransactions.forEach(t => {
      const day = new Date(t.dueDate + 'T00:00:00').getDate();
      const val = t.type === 'income' ? t.amount : -t.amount;
      if (dailyData[day] !== undefined) {
        dailyData[day] += val;
      }
    });

    // Criar array acumulado
    let accumulated = 0;
    const result = [];
    for (let i = 1; i <= daysInMonth; i++) {
      accumulated += dailyData[i];
      // Só mostra dias até hoje se for o mês atual, senão mostra o mês todo
      const isFutureDay = 
        selectedDate.getMonth() === new Date().getMonth() && 
        selectedDate.getFullYear() === new Date().getFullYear() && 
        i > new Date().getDate();
      
      if (!isFutureDay) {
         result.push({
            day: i.toString(),
            saldo: accumulated,
            movimento: dailyData[i]
         });
      }
    }
    return result;
  }, [monthlyTransactions, selectedDate]);

  const handleExportXLS = async () => {
    if (monthlyTransactions.length === 0) {
      alert("Não há lançamentos neste mês para exportar.");
      return;
    }

    const exportData = monthlyTransactions.map(t => ({
      Descrição: t.description,
      Valor: t.amount,
      Vencimento: t.dueDate,
      Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
      Categoria: categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria',
      Status: t.isPaid ? 'Pago' : 'Pendente'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio_Mensal");
    const fileName = `Relatorio_${selectedDate.getFullYear()}_${selectedDate.getMonth()+1}.xlsx`;

    try {
      if (Capacitor.isNativePlatform()) {
        const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache
        });
        await Share.share({
          title: `Exportar ${fileName}`,
          url: result.uri,
          dialogTitle: 'Compartilhar Relatório'
        });
      } else {
        XLSX.writeFile(wb, fileName);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar arquivo de relatório.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newTransactions = data.map((item, idx) => ({
        id: `import-${Date.now()}-${idx}`,
        description: item.Descrição || 'Sem descrição',
        amount: Number(item.Valor) || 0,
        date: item.Data || new Date().toISOString().split('T')[0],
        dueDate: item.Data || new Date().toISOString().split('T')[0],
        type: (item.Tipo === 'Receita' ? 'income' : 'expense') as 'income' | 'expense',
        categoryId: categories.find(c => c.name === item.Categoria)?.id || categories[0]?.id || '1',
        isPaid: item.Status === 'Finalizado',
        notes: item.Notas || '',
        recurrence: 'none' as any
      }));

      bulkAddTransactions(newTransactions);
      alert(`${newTransactions.length} lançamentos importados com sucesso!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const renderActiveChart = () => {
    switch (activeTab) {
      case 'Por Categoria':
        return (
          <motion.div 
            key="category"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 lg:p-12 rounded-[32px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                  <PieChart size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">Despesas de {monthLabel}</h3>
                  <p className="text-sm text-slate-400">Onde você gastou seu dinheiro este mês</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Despesas</p>
                 <p className="text-xl font-black text-slate-800">
                    {dataPie.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
              </div>
            </div>
            
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-8">
              {dataPie.length > 0 ? (
                <>
                  <div className="w-full md:w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={dataPie}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                        >
                          {dataPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                          itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                     {dataPie.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                           <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-sm font-bold text-slate-600">{entry.name}</span>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-bold text-slate-800">
                                {entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">
                                {((entry.value / dataPie.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-center flex flex-col items-center">
                  <PieChart size={48} className="opacity-20 mb-4" />
                  <p>Nenhuma despesa registrada em {monthLabel}.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'Mensal':
        return (
          <motion.div 
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 lg:p-12 rounded-[32px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">Comparativo Semestral</h3>
                <p className="text-sm text-slate-400">Histórico de Receitas vs Despesas</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dataBar} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar name="Receita" dataKey="receita" fill="#14b8a6" radius={[6, 6, 6, 6]} barSize={16} />
                  <Bar name="Despesa" dataKey="despesa" fill="#ef4444" radius={[6, 6, 6, 6]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      case 'Evolução':
        return (
          <motion.div 
            key="evolution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 lg:p-12 rounded-[32px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">Fluxo de {monthLabel}</h3>
                <p className="text-sm text-slate-400">Variação do saldo dia a dia neste mês</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              {dataEvolution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={dataEvolution} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="day" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                       dy={10} 
                       interval="preserveStartEnd"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip 
                      labelFormatter={(label) => `Dia ${label}`}
                      formatter={(value: any) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Saldo Acumulado']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saldo" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSaldo)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-center flex flex-col items-center justify-center h-full">
                    <TrendingUp size={48} className="opacity-20 mb-4" />
                    <p>Sem movimentações para gerar o gráfico de evolução neste mês.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />
      
      {/* Header com Navegação de Data */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
         <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-slate-500 hover:text-teal-600">
                <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-2 px-2 min-w-[160px] justify-center">
                <CalendarIcon size={16} className="text-slate-400" />
                <span className="font-bold text-slate-800 capitalize">{monthLabel}</span>
             </div>
             <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-slate-500 hover:text-teal-600">
                <ChevronRight size={20} />
             </button>
         </div>

         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {(['Por Categoria', 'Mensal', 'Evolução'] as ReportTab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
         </div>
      </div>

      <div className="flex justify-end gap-3">
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-teal-600 font-bold text-xs hover:bg-teal-50 transition-all border border-transparent hover:border-teal-100"
          >
            <Upload size={14} />
            Importar
          </button>
          <button 
            onClick={handleExportXLS}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-teal-600 font-bold text-xs hover:bg-teal-100 transition-all"
          >
            <Download size={14} />
            Exportar {monthLabel}
          </button>
      </div>

      <AnimatePresence mode="wait">
        {renderActiveChart()}
      </AnimatePresence>
    </div>
  );
};
