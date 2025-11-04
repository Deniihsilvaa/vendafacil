import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui';
import { cn } from '@/utils';
import type { Category,CategoryCarouselProps } from '@/types/layout';

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="bg-white border-b">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="px-4 py-3">
          {categories.map((category: Category) => (
            <CarouselItem key={category.id} className="basis-auto">
              <button
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
