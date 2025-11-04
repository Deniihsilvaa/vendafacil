import { useContext } from 'react';
import { ThemeContext } from '@/contexts/Definitions/ThemeContextDefinition';
import { AuthContext } from '@/contexts/Definitions/AuthContextDefinition';
import { CartContext } from '@/contexts/Definitions/CartContextDefinition';
import { useStoreContext } from './useStoreContext';

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

// Hook personalizado para usar o tema da loja
export const useStoreTheme = () => {
  const { currentStore } = useStoreContext();
  const { theme } = useThemeContext();
  
  return {
    colors: theme.colors,
    textColor: currentStore?.theme.textColor || undefined, // Cor customizável do texto
    storeName: currentStore?.name || 'Venda Fácil',
    storeDescription: currentStore?.description || '',
    storeCategory: currentStore?.category || '',
    avatar: currentStore?.avatar || '🏪',
    rating: currentStore?.rating || 0,
    reviewCount: currentStore?.reviewCount || 0,
    deliveryTime: currentStore?.settings.deliveryTime || '30-45 min',
    freeDeliveryAbove: currentStore?.settings.freeDeliveryAbove || 0,
    deliveryFee: currentStore?.settings.deliveryFee || 0,
  };
};
