import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface MainLogoProps {
  className?: string;
  size?: number;
}

export const MainLogo: React.FC<MainLogoProps> = ({ className = "", size = 64 }) => {
  return (
    <View className={`relative items-center justify-center ${className}`}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
      >
        {/* Fundo Squircle Branco */}
        <Rect width="100" height="100" rx="32" fill="white" />
        
        {/* Círculo de Fundo Verde PicPay */}
        <Circle cx="50" cy="50" r="36" fill="#11C76F" />
        <Circle cx="50" cy="50" r="32" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.2" />
        
        {/* Letra S Estilizada (SOS) */}
        <Path 
          d="M38 45c0-4 4-7 12-7s12 3 12 7c0 4-4 5.5-12 8s-12 4-12 8c0 4 4 7 12 7s12-3 12-7" 
          stroke="white" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Detalhe de Moeda/Brilho */}
        <Circle cx="68" cy="32" r="5" fill="white" />
      </Svg>
    </View>
  );
};
