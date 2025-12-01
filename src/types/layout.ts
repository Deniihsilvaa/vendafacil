export type LayoutVariant = 'store' | 'public';

export interface LayoutProps {
    children: React.ReactNode;
    variant?: LayoutVariant;
    
    // Header
    showSearch?: boolean;
    onSearch?: (query: string) => void;
    showDescription?: boolean;
    showheader?: boolean;
    showActions?: {
      favorites?: boolean;
      cart?: boolean;
      profile?: boolean;
    };
    
    // Banner
    showBanner?: boolean;
    
    // Footer
    showFooter?: boolean;
    
    // Customização
    className?: string;
    mainClassName?: string;
  }
  // Category types
  export interface Category {
  id: string;
  name: string;
  icon?: string;
}
// CategoryCarousel types
export interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}
export interface StoreLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  showDescription?: boolean;
  showheader?: boolean;
  showActions?: {
    favorites?: boolean;
    cart?: boolean;
    profile?: boolean;
  };
  showBanner?: boolean;
  showFooter?: boolean;
}