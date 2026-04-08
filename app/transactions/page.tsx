'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Plus, Search, Filter, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUIStore } from '@/lib/store';

const formSchema = z.object({
  description: z.string().min(2, 'A descrição deve ter pelo menos 2 caracteres.'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O valor deve ser um número positivo.',
  }),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Selecione uma categoria.'),
});

const mockTransactions = [
  { id: 1, description: 'Mercado', amount: -250.00, date: '07 Abr 2026', category: 'Alimentação' },
  { id: 2, description: 'Salário', amount: 5000.00, date: '05 Abr 2026', category: 'Renda' },
  { id: 3, description: 'Netflix', amount: -39.90, date: '05 Abr 2026', category: 'Assinaturas' },
  { id: 4, description: 'Uber', amount: -25.50, date: '04 Abr 2026', category: 'Transporte' },
  { id: 5, description: 'Restaurante', amount: -120.00, date: '02 Abr 2026', category: 'Alimentação' },
  { id: 6, description: 'Freelance', amount: 1500.00, date: '01 Abr 2026', category: 'Renda' },
];

export default function TransactionsPage() {
  const { isPrivacyMode } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success('Transação adicionada com sucesso!');
    setIsOpen(false);
    form.reset();
  }

  const formatCurrency = (value: number) => {
    if (isPrivacyMode) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transações</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas entradas e saídas.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-950">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou despesa ao seu controle.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button 
                    type="button"
                    variant={form.watch('type') === 'income' ? 'default' : 'outline'}
                    className={form.watch('type') === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => form.setValue('type', 'income')}
                  >
                    Receita
                  </Button>
                  <Button 
                    type="button"
                    variant={form.watch('type') === 'expense' ? 'default' : 'outline'}
                    className={form.watch('type') === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => form.setValue('type', 'expense')}
                  >
                    Despesa
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Supermercado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alimentação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Salvar</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar transações..." className="pl-9 bg-gray-50 dark:bg-gray-900 border-none" />
          </div>
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-950 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {mockTransactions.map((transaction, index) => (
            <motion.div 
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                }`}>
                  {transaction.amount > 0 ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {transaction.category}
                    </span>
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                  </div>
                </div>
              </div>
              <div className={`text-base font-bold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
