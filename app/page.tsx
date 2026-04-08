'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, TrendingUp, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-primary">SOS Controle</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Recursos</Link>
            <Link href="#security" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Segurança</Link>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-200">Entrar</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">Criar Conta</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
                Gestão Financeira <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Pessoal Inteligente</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                Assuma o controle do seu dinheiro. Acompanhe seus gastos, defina orçamentos e alcance suas metas financeiras com o SOS Controle.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth?tab=register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                    Comece seu Controle Gratuito
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-gray-300 dark:border-gray-700">
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </section>

        {/* Features Preview */}
        <section id="features" className="py-24 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Dashboard Intuitivo</h3>
                <p className="text-gray-600 dark:text-gray-400">Visualize suas finanças de forma clara com gráficos interativos e indicadores de performance.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">App Mobile Nativo</h3>
                <p className="text-gray-600 dark:text-gray-400">Leve seu controle no bolso. O app mobile lê notificações bancárias para você não esquecer nada.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Segurança em 1º Lugar</h3>
                <p className="text-gray-600 dark:text-gray-400">Autenticação 2FA, modo privacidade e criptografia de ponta a ponta para seus dados.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
