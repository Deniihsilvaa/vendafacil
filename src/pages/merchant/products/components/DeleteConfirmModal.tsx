/**
 * Modal de confirmação de exclusão de produto
 */

import React from 'react';
import { Trash2, Package } from 'lucide-react';
import type { ProductApiResponse } from '@/services/products/productService';
import { Button } from '@/components/ui/buttons';
import { formatPrice } from '@/utils';

interface DeleteConfirmModalProps {
  product: ProductApiResponse | null;
  deleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  deleting,
  onConfirm,
  onCancel,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Deletar Produto</h3>
            <p className="text-sm text-gray-500 mt-1">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
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
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs font-medium text-yellow-800">
              ⚠️ O produto será deletado permanentemente e não poderá ser recuperado.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Se o produto estiver em pedidos ativos, a exclusão será bloqueada.
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            loading={deleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>
    </div>
  );
};

