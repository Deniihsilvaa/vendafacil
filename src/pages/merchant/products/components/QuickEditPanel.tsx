/**
 * Painel de edição rápida de produtos
 * Permite editar apenas preço e custo
 * Com funcionalidade de colapsar/expandir
 */

import React, { useState, useEffect } from 'react';
import { Package, Save, X, ChevronDown } from 'lucide-react';
import type { ProductApiResponse } from '@/services/products/productService';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';

interface QuickEditPanelProps {
  product: ProductApiResponse | null;
  saving: boolean;
  onSave: (productId: string, price: number, costPrice: number) => Promise<void>;
  onFullEdit: (product: ProductApiResponse) => void;
  onClose?: () => void;
}

export const QuickEditPanel: React.FC<QuickEditPanelProps> = ({
  product,
  saving,
  onSave,
  onFullEdit,
  onClose,
}) => {
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (product) {
      setEditPrice(product.price);
      setEditCostPrice(product.cost_price || 0);
      setIsOpen(true); // Abrir automaticamente quando um produto é selecionado
    }
  }, [product]);

  const handleSave = async () => {
    if (product && editPrice > 0) {
      await onSave(product.id, editPrice, editCostPrice);
    }
  };

  const handleReset = () => {
    if (product) {
      setEditPrice(product.price);
      setEditCostPrice(product.cost_price || 0);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const hasChanges = product && (
    editPrice !== product.price ||
    editCostPrice !== (product.cost_price || 0)
  );

  const calculateMargin = () => {
    if (editPrice > 0 && editCostPrice > 0) {
      return ((editPrice - editCostPrice) / editPrice * 100).toFixed(1);
    }
    return '0.0';
  };

  const calculateProfit = () => {
    return editPrice - editCostPrice;
  };

  // Se não houver produto selecionado, não renderizar nada
  if (!product) {
    return null;
  }

  return (
    <Card className="sticky top-4 border-2 border-primary/20">
      {/* Header Colapsável */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-primary">Edição Rápida</h3>
            <Badge variant="outline" className="text-xs">
              {product.name}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Não salvo
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>
        
        {/* Botão de fechar */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClose}
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-100"
          title="Fechar edição rápida"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteúdo Colapsável */}
      {isOpen && (
        <CardContent className="space-y-4 border-t pt-4">
          {/* Preview do Produto */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                <div className="flex items-center gap-2 text-xs">
                  <Badge 
                    variant={product.is_active ? 'default' : 'secondary'}
                    className={cn(
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div className="space-y-4">
            {/* Preço de Venda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda (R$) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={editPrice || ''}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="text-lg font-semibold"
              />
            </div>

            {/* Preço de Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Custo (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editCostPrice || ''}
                onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Informações Calculadas */}
            {editPrice > 0 && editCostPrice > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Margem de Lucro:</span>
                  <span className="text-lg font-bold text-blue-600">{calculateMargin()}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Lucro por Venda:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(calculateProfit())}
                  </span>
                </div>
              </div>
            )}

            {/* Comparação com valores originais */}
            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-yellow-900 mb-2">Valores Originais:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-yellow-700">Preço:</span>{' '}
                    <span className="font-semibold line-through">{formatPrice(product.price)}</span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Custo:</span>{' '}
                    <span className="font-semibold line-through">
                      {formatPrice(product.cost_price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges || editPrice <= 0}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleReset}
                disabled={saving || !hasChanges}
                variant="outline"
                size="sm"
              >
                Resetar
              </Button>
              <Button
                onClick={() => onFullEdit(product)}
                variant="outline"
                size="sm"
              >
                Edição Completa
              </Button>
            </div>
          </div>

          {/* Dica */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            💡 Use a edição completa para alterar outros campos como nome, descrição, imagem, etc.
          </div>
        </CardContent>
      )}
    </Card>
  );
};
