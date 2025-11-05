import React from 'react';
import { Badge, Button, Card } from '@/components/ui';
import type { ProductCardProps } from '@/types';
import { cn } from '@/utils';
import { Image as ImageIcon } from 'lucide-react';
import { formatPrice } from '@/utils';


export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect,
  isNew = false 
}) => {
  const hasCustomizations = product.customizations && product.customizations.length > 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        {/* Conteúdo - lado esquerdo */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            {/* Nome do produto */}
            <h3 className="font-semibold text-base line-clamp-1">
              {product.name}
            </h3>

            {/* Descrição */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            {/* Informações nutricionais e tempo de preparo */}
            {(product.nutritionalInfo || product.preparationTime) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {product.nutritionalInfo && (
                  <>
                    <span>{product.nutritionalInfo.calories} cal</span>
                    <span>•</span>
                    <span>{product.nutritionalInfo.proteins}g prot</span>
                  </>
                )}
                {product.preparationTime && (
                  <>
                    {product.nutritionalInfo && <span>•</span>}
                    <span>⏱️ ~{product.preparationTime} min</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Preço e ação */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            
            <Button
              onClick={() => onSelect?.(product)}
              variant="default"
              size="sm"
              className={cn(
                "font-semibold shrink-0",
                hasCustomizations ? "bg-primary hover:bg-primary/90" : ""
              )}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Imagem do produto - lado direito */}
        <div className="relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-gray-200">
          {product.image ? (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {product.image}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">Sem foto</span>
            </div>
          )}
          {isNew && (
            <Badge 
              variant="destructive" 
              className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 font-semibold"
            >
              Novo
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};