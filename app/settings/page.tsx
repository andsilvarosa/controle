'use client';

import { useUIStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, EyeOff, Shield, Bell, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const { isDarkMode, isPrivacyMode, toggleDarkMode, togglePrivacyMode } = useUIStore();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas preferências e conta.</p>
      </div>

      <div className="grid gap-6">
        {/* Preferências Visuais */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Aparência e Privacidade
            </CardTitle>
            <CardDescription>Personalize como o SOS Controle é exibido para você.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Escuro</Label>
                <p className="text-sm text-gray-500">Altera o tema visual da aplicação.</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  Modo Privacidade
                  <EyeOff className="w-4 h-4 text-gray-400" />
                </Label>
                <p className="text-sm text-gray-500">Oculta valores financeiros na tela.</p>
              </div>
              <button 
                onClick={togglePrivacyMode}
                className={`w-12 h-6 rounded-full transition-colors relative ${isPrivacyMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isPrivacyMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Proteja sua conta e seus dados financeiros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Autenticação em Dois Fatores (2FA)</Label>
                <p className="text-sm text-gray-500">Adiciona uma camada extra de segurança.</p>
              </div>
              <button className="text-sm font-medium text-primary hover:underline">Configurar</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alterar Senha</Label>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso.</p>
              </div>
              <button className="text-sm font-medium text-primary hover:underline">Alterar</button>
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Dispositivos e Integrações
            </CardTitle>
            <CardDescription>Gerencie onde você usa o SOS Controle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Leitura de Notificações (App Mobile)</Label>
                <p className="text-sm text-gray-500">Permite que o app leia notificações do banco.</p>
              </div>
              <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">Configurar no App</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
