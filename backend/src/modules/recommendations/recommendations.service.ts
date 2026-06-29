import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto, toProductDto } from '../products/product.mapper';
import { ProductsRepository } from '../products/products.repository';
import { ProductDocument } from '../products/schemas/product.schema';
import { OrdersRepository } from '../orders/orders.repository';

const PRODUCT_RECO_LIMIT = 4;
const USER_RECO_LIMIT = 8;

/**
 * Recommendations — interpretation (documented in NOTES.md):
 *  - "More like this" on a product page: other products in the SAME category,
 *    newest first, topped up with newest arrivals if the category is thin.
 *  - Personalized "relevant to you" for a logged-in user: products from the
 *    categories they've actually bought, excluding what they already own,
 *    newest first; falls back to newest arrivals for users with no history.
 * Content/behaviour-based, no external ML — deterministic and explainable.
 */
@Injectable()
export class RecommendationsService {
  constructor(
    private readonly products: ProductsRepository,
    private readonly orders: OrdersRepository,
  ) {}

  /** Related products for a product detail page. */
  async forProduct(productId: string): Promise<ProductDto[]> {
    const product = await this.products.findById(productId).catch(() => null);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const related = await this.products.findRelated(
      product.category,
      productId,
      PRODUCT_RECO_LIMIT,
    );
    return this.topUp(related, [productId], PRODUCT_RECO_LIMIT).then((list) =>
      list.map(toProductDto),
    );
  }

  /** Personalized recommendations for the authenticated user. */
  async forUser(userId: string): Promise<ProductDto[]> {
    const orders = await this.orders.findByUser(userId);

    const purchasedIds = new Set<string>();
    const categories = new Set<string>();
    for (const order of orders) {
      for (const item of order.items) {
        if (item.product) purchasedIds.add(item.product.toString());
      }
    }

    // Collect categories from the products the user actually bought.
    if (purchasedIds.size) {
      const bought = await this.products.findByIds([...purchasedIds]);
      bought.forEach((p) => categories.add(p.category));
    }

    const exclude = [...purchasedIds];
    let recos: ProductDocument[] = [];
    if (categories.size) {
      recos = await this.products.findByCategories(
        [...categories],
        exclude,
        USER_RECO_LIMIT,
      );
    }
    // Fall back / top up with newest arrivals (also excludes owned items).
    const filled = await this.topUp(recos, exclude, USER_RECO_LIMIT);
    return filled.map(toProductDto);
  }

  /** Pads a list up to `limit` with newest products not already present. */
  private async topUp(
    current: ProductDocument[],
    excludeIds: string[],
    limit: number,
  ): Promise<ProductDocument[]> {
    if (current.length >= limit) return current.slice(0, limit);
    const have = new Set(current.map((p) => p.id as string));
    const exclude = [...new Set([...excludeIds, ...have])];
    const newest = await this.products.findNewest(limit, exclude);
    for (const p of newest) {
      if (current.length >= limit) break;
      if (!have.has(p.id as string)) {
        current.push(p);
        have.add(p.id as string);
      }
    }
    return current.slice(0, limit);
  }
}
