import React, { useState, useEffect } from 'react';
import type { CartContextType, CartItem } from '@/types';
import { CartContext } from './Definitions/CartContextDefinition';

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calcular total de itens
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calcular valor total
  const totalAmount = items.reduce((total, item) => total + item.totalPrice, 0);

  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      // Verificar se o item já existe (mesmo produto com mesmas customizações)
      const existingItemIndex = prevItems.findIndex(item => 
        item.product.id === newItem.product.id &&
        JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
      );

      if (existingItemIndex > -1) {
        // Se existe, aumentar quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          totalPrice: updatedItems[existingItemIndex].totalPrice + newItem.totalPrice,
        };
        return updatedItems;
      } else {
        // Se não existe, adicionar novo item
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? {
              ...item,
              quantity,
              totalPrice: (item.totalPrice / item.quantity) * quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('store-flow-cart', JSON.stringify(items));
  }, [items]);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('store-flow-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        setItems(cartItems);
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
  }, []);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
