import type { Product } from "./product";

export interface ProductCardProps {
    product: Product;
    onSelect?: (product: Product) => void;
    isNew?: boolean;
  }