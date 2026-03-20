
import React from 'react';

interface MainLogoProps {
  className?: string;
  size?: number;
}

export const MainLogo: React.FC<MainLogoProps> = ({ className = "", size = 64 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Círculo de Fundo Estilo PicPay */}
        <circle cx="50" cy="50" r="48" fill="#21C25E" />
        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        
        {/* Letra S Estilizada (SOS) */}
        <path 
          d="M35 35C35 30 40 25 50 25C60 25 65 30 65 35C65 40 60 42 50 45C40 48 35 50 35 55C35 60 40 65 50 65C60 65 65 60 65 55" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Detalhe de Moeda/Brilho */}
        <circle cx="75" cy="25" r="8" fill="white" />
        <path d="M75 20V30M70 25H80" stroke="#21C25E" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
};
