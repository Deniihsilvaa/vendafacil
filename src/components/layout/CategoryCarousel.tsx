import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui';
import { cn } from '@/utils';
import type { Category, CategoryCarouselProps } from '@/types/layout';

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="bg-white border-b relative">
      {/* Gradiente esquerdo para indicar scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      
      {/* Gradiente direito para indicar scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
        className="w-full relative"
      >
        <CarouselContent className="px-2 sm:px-4 py-3 -ml-2 sm:-ml-4">
          {categories.map((category: Category) => (
            <CarouselItem key={category.id} className="basis-auto pl-2 sm:pl-4">
              <button
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
                  "hover:scale-105 active:scale-95",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category.icon && <span className="mr-1.5">{category.icon}</span>}
                <span className="truncate max-w-[120px] sm:max-w-none">{category.name}</span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Botões de navegação - visíveis apenas quando necessário */}
        <CarouselPrevious 
          className="left-1 sm:left-2 h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-white shadow-md border-gray-200"
          variant="outline"
        />
        <CarouselNext 
          className="right-1 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-white shadow-md border-gray-200"
          variant="outline"
        />
      </Carousel>
    </div>
  );
};
