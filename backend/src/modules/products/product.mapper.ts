import { ProductDocument } from './schemas/product.schema';

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sizes: string[];
  imagePath: string | null;
  isNew: boolean;
  tint: string;
  createdAt: Date;
}

/** Single source of truth for the public shape of a product. */
export function toProductDto(p: ProductDocument): ProductDto {
  return {
    id: p.id as string,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    stock: p.stock,
    sizes: p.sizes,
    imagePath: p.imagePath,
    isNew: p.isNewArrival,
    tint: p.tint,
    createdAt: (p as unknown as { createdAt: Date }).createdAt,
  };
}
