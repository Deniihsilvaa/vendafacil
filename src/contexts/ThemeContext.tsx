import React, { useEffect, useState } from 'react';
import type { ThemeConfig, ThemeContextType } from '@/types';
import { useStoreContext } from '@/hooks';
import { ThemeContext } from './Definitions/ThemeContextDefinition';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Cores padrão do sistema
const defaultColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#10b981',
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentStore } = useStoreContext();
  const [theme, setTheme] = useState<ThemeConfig>({
    colors: defaultColors,
    store: currentStore,
  });

  // Converter hex para HSL (formato necessário para Tailwind)
  const hexToHSL = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Aplicar cores dinâmicas via CSS variables
  const applyThemeColors = (primary: string, secondary: string, accent: string) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', hexToHSL(primary));
    root.style.setProperty('--secondary', hexToHSL(secondary));
    root.style.setProperty('--accent', hexToHSL(accent));
    
    // Calcular primary-foreground (branco para cores escuras, preto para claras)
    const getPrimaryForeground = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '0 0% 98%';
      
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      
      // Calcular luminosidade relativa
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Se for escuro, usar texto branco, senão preto
      return luminance > 0.5 ? '0 0% 4.9%' : '0 0% 98%';
    };
    
    root.style.setProperty('--primary-foreground', getPrimaryForeground(primary));
  };

  // Atualizar tema quando a loja muda
  useEffect(() => {
    if (!currentStore) {
      // Se não há loja, usar cores padrão
      applyThemeColors(defaultColors.primary, defaultColors.secondary, defaultColors.accent);
      return;
    }

    const primaryColor = currentStore.theme.primaryColor || defaultColors.primary;
    const secondaryColor = currentStore.theme.secondaryColor || defaultColors.secondary;
    const accentColor = currentStore.theme.accentColor || defaultColors.accent;

    const newTheme: ThemeConfig = {
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      store: currentStore,
    };
    
    setTheme(newTheme);
    
    // Aplicar cores dinâmicas imediatamente
    applyThemeColors(primaryColor, secondaryColor, accentColor);
  }, [currentStore]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({
      ...prev,
      ...newTheme,
      colors: {
        ...prev.colors,
        ...newTheme.colors,
      },
    }));
  };

  const value: ThemeContextType = {
    theme,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
