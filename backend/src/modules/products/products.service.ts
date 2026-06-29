import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto, toProductDto } from './product.mapper';
import { ProductsRepository, ProductSortSpec } from './products.repository';
import { ProductSort, QueryProductsDto } from './dto/query-products.dto';
import { ProductDocument } from './schemas/product.schema';

export interface PaginatedProducts {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly products: ProductsRepository) {}

  async list(query: QueryProductsDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;

    const filter: Record<string, unknown> = {};
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search?.trim()) {
      // Case-insensitive contains match on name (anchored search UX, not $text).
      filter.name = { $regex: this.escapeRegex(query.search.trim()), $options: 'i' };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price: Record<string, number> = {};
      if (query.minPrice !== undefined) price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) price.$lte = query.maxPrice;
      filter.price = price;
    }

    const sort = this.sortSpec(query.sort);
    const { items, total } = await this.products.findPaginated(
      filter,
      sort,
      (page - 1) * limit,
      limit,
    );

    return { items: items.map(toProductDto), total, page, limit };
  }

  async getOne(id: string): Promise<ProductDto> {
    const product = await this.findOrThrow(id);
    return toProductDto(product);
  }

  /** Helper reused by cart/orders so they share one not-found path. */
  async findOrThrow(id: string): Promise<ProductDocument> {
    const product = await this.products.findById(id).catch(() => null);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private sortSpec(sort?: ProductSort): ProductSortSpec {
    switch (sort) {
      case ProductSort.PriceAsc:
        return { price: 1 };
      case ProductSort.PriceDesc:
        return { price: -1 };
      case ProductSort.Newest:
      default:
        return { createdAt: -1 };
    }
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
