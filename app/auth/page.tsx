'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-800 opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/finance/1920/1080?blur=2')] bg-cover bg-center mix-blend-overlay opacity-30" />
        
        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Bem-vindo ao SOS Controle</h1>
          <p className="text-lg text-emerald-50">
            A plataforma definitiva para você organizar suas finanças, alcançar suas metas e ter paz de espírito.
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-3xl text-primary">SOS Controle</span>
          </div>

          <Card className="border-0 shadow-xl dark:bg-gray-950">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Digite seu e-mail e senha para acessar' 
                  : 'Preencha os dados abaixo para começar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="João da Silva" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {isLogin && (
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  )}
                </div>
                <Input id="password" type="password" />
              </div>
              
              <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-6" size="lg">
                {isLogin ? 'Entrar' : 'Criar conta'}
              </Button>

              <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-semibold hover:underline"
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
