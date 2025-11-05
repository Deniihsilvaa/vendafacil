import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import type { Product, ProductCustomization, CartItem } from '@/types';
import { formatPrice } from '@/utils';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem, goToCheckout?: boolean) => void;
}

interface SelectedCustomization {
  customization: ProductCustomization;
  quantity: number;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Map<string, SelectedCustomization>>(new Map());
  const [observations, setObservations] = useState('');

  // Resetar quando o produto muda
  React.useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedCustomizations(new Map());
      setObservations('');
    }
  }, [product]);

  // Agrupar customizações por tipo
  const customizationsByType = useMemo(() => {
    if (!product?.customizations) return {};

    const grouped: Record<string, ProductCustomization[]> = {};
    product.customizations.forEach(customization => {
      if (!grouped[customization.type]) {
        grouped[customization.type] = [];
      }
      grouped[customization.type].push(customization);
    });

    return grouped;
  }, [product]);

  // Agrupar customizações por grupo (para radio buttons)
  const customizationsByGroup = useMemo(() => {
    if (!product?.customizations) return {};

    const grouped: Record<string, ProductCustomization[]> = {};
    product.customizations.forEach(customization => {
      if (customization.group && customization.selectionType === 'boolean') {
        if (!grouped[customization.group]) {
          grouped[customization.group] = [];
        }
        grouped[customization.group].push(customization);
      }
    });

    return grouped;
  }, [product]);

  // Função para obter nome do tipo
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      base: 'Base',
      protein: 'Proteína',
      topping: 'Toppings',
      sauce: 'Molhos',
      extra: 'Extras',
    };
    return labels[type] || type;
  };

  // Atualizar quantidade de customização (tipo quantity)
  const updateCustomizationQuantity = (customization: ProductCustomization, delta: number) => {
    const current = selectedCustomizations.get(customization.id);
    const currentQty = current?.quantity || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      const newMap = new Map(selectedCustomizations);
      newMap.delete(customization.id);
      setSelectedCustomizations(newMap);
    } else {
      const newMap = new Map(selectedCustomizations);
      newMap.set(customization.id, { customization, quantity: newQty });
      setSelectedCustomizations(newMap);
    }
  };

  // Toggle customização boolean (checkbox/radio)
  const toggleBooleanCustomization = (customization: ProductCustomization) => {
    const newMap = new Map(selectedCustomizations);
    const current = selectedCustomizations.get(customization.id);
    const isSelected = current && current.quantity > 0;

    // Se tem grupo, é mutuamente exclusivo (radio)
    if (customization.group) {
      // Remover todas do mesmo grupo
      const groupCustomizations = customizationsByGroup[customization.group] || [];
      groupCustomizations.forEach(c => {
        newMap.delete(c.id);
      });
      
      // Se não estava selecionado, selecionar este
      if (!isSelected) {
        newMap.set(customization.id, { customization, quantity: 1 });
      }
    } else {
      // Sem grupo, é checkbox independente
      if (isSelected) {
        newMap.delete(customization.id);
      } else {
        newMap.set(customization.id, { customization, quantity: 1 });
      }
    }

    setSelectedCustomizations(newMap);
  };

  // Calcular preço total
  const calculateTotal = useMemo(() => {
    if (!product) return 0;

    const basePrice = product.price;
    const customizationsPrice = Array.from(selectedCustomizations.values()).reduce(
      (sum, item) => {
        const isBoolean = item.customization.selectionType === 'boolean';
        // Customizações boolean têm preço fixo (não multiplicado por quantidade)
        // Customizações com quantidade têm preço multiplicado pela quantidade selecionada
        const itemPrice = isBoolean 
          ? item.customization.price 
          : item.customization.price * item.quantity;
        return sum + itemPrice;
      },
      0
    );

    // Preço total = (preço base + customizações) * quantidade do produto
    return (basePrice + customizationsPrice) * quantity;
  }, [product, quantity, selectedCustomizations]);

  // Adicionar ao carrinho
  const handleAddToCart = (goToCheckout: boolean = false) => {
    if (!product) return;

    // Montar array de customizações com quantidade
    const customizationsArray: ProductCustomization[] = [];
    Array.from(selectedCustomizations.values()).forEach(item => {
      const isBoolean = item.customization.selectionType === 'boolean';
      
      if (isBoolean) {
        // Customizações boolean são adicionadas apenas uma vez (true/false)
        customizationsArray.push(item.customization);
      } else {
        // Customizações com quantidade são adicionadas N vezes
        for (let i = 0; i < item.quantity; i++) {
          customizationsArray.push(item.customization);
        }
      }
    });

    const cartItem: CartItem = {
      product,
      quantity,
      customizations: customizationsArray,
      totalPrice: calculateTotal,
      observations: observations.trim() || undefined,
    };

    onAddToCart(cartItem, goToCheckout);
    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Descrição do produto */}
        <div>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          {product.nutritionalInfo && (
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{product.nutritionalInfo.calories} cal</span>
              <span>•</span>
              <span>{product.nutritionalInfo.proteins}g proteínas</span>
            </div>
          )}
        </div>

        {/* Customizações */}
        {Object.entries(customizationsByType).length > 0 && (
          <div className="space-y-4">
            {Object.entries(customizationsByType).map(([type, customizations]) => (
              <div key={type} className="space-y-2">
                <h4 className="font-semibold text-sm">
                  {getTypeLabel(type)}
                </h4>
                <div className="space-y-2">
                  {customizations.map((customization) => {
                    const selected = selectedCustomizations.get(customization.id);
                    const selectedQty = selected?.quantity || 0;
                    const isBoolean = customization.selectionType === 'boolean';
                    const isRadio = isBoolean && customization.group;
                    const isChecked = selectedQty > 0;

                    // Se é radio button, verificar se está no grupo
                    if (isRadio) {
                      const groupName = customization.group || '';
                      const isInGroup = customizationsByGroup[groupName]?.includes(customization);
                      
                      if (isInGroup) {
                        // Renderizar como grupo de radio buttons
                        const groupItems = customizationsByGroup[groupName];
                        const isFirstInGroup = groupItems[0].id === customization.id;
                        
                        if (!isFirstInGroup) return null; // Renderizar apenas uma vez por grupo

                        return (
                          <div key={`group-${groupName}`} className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                              {groupName}
                            </div>
                            {groupItems.map((item) => {
                              const itemSelected = selectedCustomizations.get(item.id);
                              const itemChecked = itemSelected && itemSelected.quantity > 0;

                              return (
                                <label
                                  key={item.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <input
                                      type="radio"
                                      name={groupName}
                                      checked={itemChecked}
                                      onChange={() => toggleBooleanCustomization(item)}
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{item.name}</span>
                                      </div>
                                      {item.price > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          +{formatPrice(item.price)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        );
                      }
                    }

                    // Checkbox ou quantidade normal
                    return (
                      <div
                        key={customization.id}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                          isBoolean ? 'cursor-pointer' : ''
                        }`}
                        onClick={isBoolean && !customization.group ? () => toggleBooleanCustomization(customization) : undefined}
                      >
                        <div className="flex-1">
                          {isBoolean && !customization.group && (
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBooleanCustomization(customization)}
                                className="w-4 h-4 text-primary focus:ring-primary"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{customization.name}</span>
                                </div>
                                {customization.price > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{formatPrice(customization.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {!isBoolean && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{customization.name}</span>
                              </div>
                              {customization.price > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  +{formatPrice(customization.price)}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {!isBoolean && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCustomizationQuantity(customization, -1)}
                              disabled={selectedQty === 0}
                              className="p-1 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{selectedQty}</span>
                            <button
                              onClick={() => updateCustomizationQuantity(customization, 1)}
                              className="p-1 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantidade */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="p-2 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-full border hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Observações (opcional)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Sem cebola, ponto da carne médio..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

        {/* Preço total */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(calculateTotal)}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleAddToCart(false)}
            variant="outline"
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar e Continuar
          </Button>
          <Button
            onClick={() => handleAddToCart(true)}
            className="flex-1"
          >
            Finalizar Pedido
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
