import React, { useState, useRef } from 'react';
import { Badge, Card, ContextMenu, Modal, type ContextMenuItem } from '@/components/ui';
import type { ProductCardProps } from '@/types';
import { Image as ImageIcon, ShoppingCart, Info } from 'lucide-react';
import { formatPrice } from '@/utils';

export const ProductCard: React.FC<ProductCardProps & { disabled?: boolean }> = ({ 
  product, 
  onSelect,
  isNew = false,
  disabled = false
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleAddToCart = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  const handleViewDescription = () => {
    setShowDescriptionModal(true);
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'Adicionar ao carrinho',
      icon: <ShoppingCart className="h-4 w-4" />,
      onClick: handleAddToCart,
      disabled: disabled || !onSelect,
    },
    {
      label: 'Ver descrição',
      icon: <Info className="h-4 w-4" />,
      onClick: handleViewDescription,
    },
  ];

  return (
    <>
      <div ref={cardRef}>
        <Card 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onContextMenu={handleContextMenu}
        >
        <div className="flex gap-2 p-2">
          {/* Conteúdo - lado esquerdo (compacto) */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-0.5">
              {/* Nome do produto */}
              <h3 className="font-semibold text-sm line-clamp-1 leading-tight">
                {product.name}
              </h3>

              {/* Descrição (compacta) */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                {product.description}
              </p>

              {/* Tempo de preparo */}
              {product.preparationTime && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>⏱️ ~{product.preparationTime} min</span>
                </div>
              )}
            </div>

            {/* Preço */}
            <div className="pt-1 mt-auto">
              <span className="text-base font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Imagem do produto - lado direito (grande) */}
          <div className="relative flex-shrink-0 w-36 h-36 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-gray-200">
            {product.image ? (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {product.image}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-6 h-6 mb-0.5" />
                <span className="text-[10px]">Sem foto</span>
              </div>
            )}
            {isNew && (
              <Badge 
                variant="destructive" 
                className="absolute top-1 right-1 text-[9px] px-1 py-0 font-semibold"
              >
                Novo
              </Badge>
            )}
          </div>
        </div>
      </Card>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          isOpen={!!contextMenu}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Modal de Descrição */}
      <Modal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        title={product.name}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
            <p className="text-sm">{product.description}</p>
          </div>
          {product.preparationTime && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tempo de preparo</h3>
              <p className="text-sm">⏱️ ~{product.preparationTime} min</p>
            </div>
          )}
          {product.nutritionalInfo && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações nutricionais</h3>
              <div className="text-sm space-y-1">
                <p>Calorias: {product.nutritionalInfo.calories} cal</p>
                <p>Proteínas: {product.nutritionalInfo.proteins}g</p>
                <p>Carboidratos: {product.nutritionalInfo.carbs}g</p>
                <p>Gorduras: {product.nutritionalInfo.fats}g</p>
              </div>
            </div>
          )}
          <div className="pt-2 border-t">
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
        </div>
      </Modal>
    </>
  );
};