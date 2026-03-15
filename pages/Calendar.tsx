
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';

export const Calendar: React.FC = () => {
  const { transactions, categories } = useFinanceStore();
  
  // viewDate controla qual MÊS estamos vendo.
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  // Cálculo dos dias do mês e do deslocamento inicial
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Dia da semana do primeiro dia do mês (0 = Domingo, 1 = Segunda...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Total de dias no mês
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    
    // Adiciona espaços vazios para alinhar o primeiro dia com o dia da semana correto
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }
    
    // Adiciona os dias do mês
    for (let i = 1; i <= lastDayOfMonth; i++) {
      grid.push(i);
    }
    
    return grid;
  }, [viewDate]);

  // Formata data para comparação 'YYYY-MM-DD'
  const getFormattedDate = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Transações do dia selecionado (Filtrado por dueDate conforme solicitado)
  const transactionsOfDay = useMemo(() => {
    const targetDate = getFormattedDate(selectedDay);
    return transactions.filter(t => t.dueDate === targetDate);
  }, [transactions, selectedDay, viewDate]);

  // Verifica presença de transações para os indicadores visuais (dots) usando dueDate
  const getDayStatus = (day: number | null) => {
    if (day === null) return { hasIncome: false, hasExpense: false };
    const targetDate = getFormattedDate(day);
    const dayTransactions = transactions.filter(t => t.dueDate === targetDate);
    return {
      hasIncome: dayTransactions.some(t => t.type === 'income'),
      hasExpense: dayTransactions.some(t => t.type === 'expense')
    };
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {monthNames[viewDate.getMonth()]}, {viewDate.getFullYear()}
            </h2>
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white rounded-lg transition-all shadow-sm text-slate-600 hover:text-teal-600"
                title="Mês Anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-white rounded-lg transition-all shadow-sm text-slate-600 hover:text-teal-600"
                title="Próximo Mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <button 
            onClick={handleGoToToday}
            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <CalendarIcon size={20} />
            <span className="hidden sm:inline">Hoje</span>
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-3">
          {calendarGrid.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const status = getDayStatus(day);
            const isSelected = selectedDay === day;
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                  isSelected 
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105' 
                    : isToday 
                      ? 'bg-teal-50 text-teal-600 border border-teal-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="font-bold text-lg">{day}</span>
                <div className="flex gap-1 mt-1">
                  {status.hasExpense && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-red-400'}`} />
                  )}
                  {status.hasIncome && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-400'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-800">
            Vencimentos em {selectedDay} de {monthNames[viewDate.getMonth()]}
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {transactionsOfDay.length} itens encontrados
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {transactionsOfDay.length > 0 ? (
              transactionsOfDay.map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                const isIncome = t.type === 'income';
                const isOverdue = !t.isPaid && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between group transition-colors ${
                      isOverdue ? 'border-red-100 bg-red-50/20' : 'border-slate-100 hover:border-teal-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isIncome ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {isIncome ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {t.description}
                          {isOverdue && (
                            <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-md uppercase tracking-widest">Atrasado</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#cbd5e1' }} />
                          <p className="text-xs text-slate-400 font-medium">
                            {category?.name || 'Sem Categoria'} 
                            {t.installments && t.installments > 1 && ` • ${t.currentInstallment}/${t.installments}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isIncome ? 'text-teal-600' : 'text-red-500'}`}>
                        {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${t.isPaid ? 'text-slate-400' : 'text-orange-500'}`}>
                        {t.isPaid ? (isIncome ? 'Recebido' : 'Pago') : (isIncome ? 'Pendente' : 'Em Aberto')}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px]"
              >
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Nenhum vencimento para este dia.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
