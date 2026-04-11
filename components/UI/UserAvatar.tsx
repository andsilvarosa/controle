
import React from 'react';
import * as Icons from 'lucide-react';

interface UserAvatarProps {
  avatar: string;
  className?: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ avatar, className = "w-10 h-10", size = 20 }) => {
  // Verifica se o avatar é um identificador de ícone (ex: "icon:User:teal")
  if (avatar && avatar.startsWith('icon:')) {
    const [_, iconName, colorName] = avatar.split(':');
    const IconComponent = (Icons as any)[iconName] || Icons.User;
    
    const colorMap: Record<string, string> = {
      teal: 'bg-brand-green',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500',
      rose: 'bg-rose-500',
      yellow: 'bg-yellow-500',
      slate: 'bg-slate-500',
      cyan: 'bg-cyan-500',
    };

    return (
      <div className={`${className} ${colorMap[colorName] || 'bg-brand-green'} flex items-center justify-center text-white rounded-full shadow-inner border-2 border-white/10`}>
        <IconComponent size={size} />
      </div>
    );
  }

  // Se não for ícone, assume que é uma URL (fallback para suporte antigo se houver)
  return (
    <img 
      src={avatar} 
      className={`${className} rounded-full object-cover border-2 border-brand-green/20 shadow-sm`} 
      alt="User Avatar" 
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/200/200';
      }}
    />
  );
};
