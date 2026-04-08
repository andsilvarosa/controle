'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowRightLeft, Settings, LogOut, TrendingUp, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', href: '/transactions', icon: ArrowRightLeft },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-green-800 to-green-900 text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          <span className="font-bold text-xl">SOS Controle</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:bg-white/20">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 min-w-[16rem] bg-gradient-to-br from-green-800 to-green-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 hidden lg:flex">
          <TrendingUp className="w-6 h-6" />
          <span className="font-bold text-xl">SOS Controle</span>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-4rem)]">
          <nav className="space-y-2 flex-1 mt-8 lg:mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10 text-green-100'}
                  `}>
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-4 mt-auto">
            <Link href="/">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-green-100 transition-colors">
                <LogOut className="w-5 h-5" />
                Sair
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-0 min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
