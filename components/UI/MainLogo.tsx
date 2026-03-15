
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
        className="drop-shadow-xl"
      >
        {/* Moedas de Fundo */}
        <circle cx="35" cy="35" r="22" fill="white" stroke="#225b64" strokeWidth="4"/>
        <circle cx="35" cy="35" r="16" stroke="#225b64" strokeWidth="2.5"/>
        <path d="M35 28v14M31 32h8M31 38h8" stroke="#225b64" strokeWidth="3" strokeLinecap="round"/>

        <circle cx="28" cy="58" r="22" fill="white" stroke="#225b64" strokeWidth="4"/>
        <circle cx="28" cy="58" r="16" stroke="#225b64" strokeWidth="2.5"/>
        <path d="M28 51v14M24 55h8M24 61h8" stroke="#225b64" strokeWidth="3" strokeLinecap="round"/>

        <circle cx="45" cy="78" r="22" fill="white" stroke="#225b64" strokeWidth="4"/>
        <circle cx="45" cy="78" r="16" stroke="#225b64" strokeWidth="2.5"/>
        <path d="M45 71v14M41 75h8M41 81h8" stroke="#225b64" strokeWidth="3" strokeLinecap="round"/>

        {/* Calculadora */}
        <rect x="48" y="28" width="44" height="60" rx="6" fill="white" stroke="#225b64" strokeWidth="5"/>
        
        {/* Tela da Calculadora */}
        <rect x="55" y="36" width="30" height="14" rx="2" fill="#88b0b5" stroke="#225b64" strokeWidth="2.5"/>
        
        {/* Botões da Calculadora */}
        <rect x="55" y="56" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="67" y="56" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="79" y="56" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        
        <rect x="55" y="68" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="67" y="68" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="79" y="68" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        
        <rect x="55" y="80" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="67" y="80" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
        <rect x="79" y="80" width="6" height="6" rx="1.5" fill="white" stroke="#225b64" strokeWidth="2.5"/>
      </svg>
    </div>
  );
};
