/**
 * Painel de edição rápida de produtos
 * Permite editar apenas preço e custo
 */

import React, { useState, useEffect } from 'react';
import { Package, Save } from 'lucide-react';
import type { ProductApiResponse } from '@/services/products/productService';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils';

interface QuickEditPanelProps {
  product: ProductApiResponse | null;
  saving: boolean;
  onSave: (productId: string, price: number, costPrice: number) => Promise<void>;
  onFullEdit: (product: ProductApiResponse) => void;
}

export const QuickEditPanel: React.FC<QuickEditPanelProps> = ({
  product,
  saving,
  onSave,
  onFullEdit,
}) => {
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setEditPrice(product.price);
      setEditCostPrice(product.cost_price || 0);
    }
  }, [product]);

  const handleSave = async () => {
    if (product && editPrice > 0) {
      await onSave(product.id, editPrice, editCostPrice);
    }
  };

  const hasChanges = product && (
    editPrice !== product.price ||
    editCostPrice !== (product.cost_price || 0)
  );

  if (!product) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Selecione um Produto</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p>Selecione um produto da lista para editar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edição Rápida</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFullEdit(product)}
          >
            Edição Completa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do Produto */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Package className="h-16 w-16 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Sem imagem</p>
              </div>
            )}
          </div>

          <div className="p-4">
            <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description || 'Sem descrição'}
            </p>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">💵 Preço Atual</p>
                <span className="font-bold text-primary text-lg block">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            {product.cost_price && product.cost_price > 0 && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">💰 Custo Atual</p>
                <span className="font-semibold text-gray-900 text-base block mb-1">
                  {formatPrice(product.cost_price)}
                </span>
                <p className="text-xs text-blue-700 font-medium">
                  Margem: {((product.price - product.cost_price) / product.price * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulário de Edição */}
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h4 className="font-semibold text-sm text-gray-900">Edição Rápida</h4>
            <p className="text-xs text-gray-500 mt-1">
              Atualize preço e custo do produto
            </p>
          </div>

          {/* Preço de Venda */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Preço de Venda (R$) <span className="text-destructive">*</span>
              </label>
              {editPrice !== product.price && (
                <Badge variant="outline" className="text-xs">Alterado</Badge>
              )}
            </div>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={editPrice || ''}
              onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
            />
            {editPrice !== product.price && editPrice > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Anterior: {formatPrice(product.price)}</span>
                <span className="font-medium text-primary">Novo: {formatPrice(editPrice)}</span>
              </div>
            )}
          </div>

          {/* Preço de Custo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Preço de Custo (R$)
              </label>
              {editCostPrice !== (product.cost_price || 0) && (
                <Badge variant="outline" className="text-xs">Alterado</Badge>
              )}
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={editCostPrice || ''}
              onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
            />
            {editCostPrice > 0 && editPrice > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                <p className="text-xs font-medium text-blue-900">
                  💰 Nova Margem: {((editPrice - editCostPrice) / editPrice * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditPrice(product.price);
                setEditCostPrice(product.cost_price || 0);
              }}
              disabled={saving || !hasChanges}
              className="flex-1"
            >
              Resetar
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={saving || editPrice <= 0 || !hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs font-medium text-yellow-800">
                ⚠️ Você tem alterações não salvas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

