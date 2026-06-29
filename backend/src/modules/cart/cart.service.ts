import { ConflictException, Injectable } from '@nestjs/common';
import { computeTotals } from '../../common/pricing';
import { ProductDto, toProductDto } from '../products/product.mapper';
import { ProductsRepository } from '../products/products.repository';
import { ProductDocument } from '../products/schemas/product.schema';
import { CartRepository } from './cart.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartDocument } from './schemas/cart.schema';

export interface CartLine {
  product: ProductDto;
  qty: number;
  size: string | null;
  lineTotal: number;
}

export interface CartResponse {
  items: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

@Injectable()
export class CartService {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductsRepository,
  ) {}

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.carts.findOrCreate(userId);
    return this.build(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    const cart = await this.carts.findOrCreate(userId);
    const product = await this.requireInStock(dto.productId);

    const existing = cart.items.find(
      (i) => i.product.toString() === dto.productId,
    );
    const nextQty = (existing?.qty ?? 0) + dto.qty;
    this.assertStock(product, nextQty);

    if (existing) {
      existing.qty = nextQty;
      if (dto.size !== undefined) existing.size = dto.size;
    } else {
      cart.items.push({
        product: product._id as never,
        qty: dto.qty,
        size: dto.size ?? null,
      });
    }
    await cart.save();
    return this.build(cart);
  }

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const cart = await this.carts.findOrCreate(userId);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      // Nothing to update; return the current cart rather than 404-ing on a
      // line that may have just been removed in another tab.
      return this.build(cart);
    }
    const product = await this.requireInStock(productId);
    this.assertStock(product, dto.qty);
    item.qty = dto.qty;
    if (dto.size !== undefined) item.size = dto.size;
    await cart.save();
    return this.build(cart);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.carts.findOrCreate(userId);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    return this.build(cart);
  }

  async clear(userId: string): Promise<void> {
    await this.carts.clear(userId);
  }

  // --- helpers ---

  private async requireInStock(productId: string): Promise<ProductDocument> {
    const product = await this.products.findById(productId).catch(() => null);
    if (!product) {
      // ConflictException keeps cart mutations on a single 4xx path; the
      // product genuinely can't be added because it doesn't exist.
      throw new ConflictException('Product is no longer available');
    }
    if (product.stock <= 0) {
      throw new ConflictException(`${product.name} is sold out`);
    }
    return product;
  }

  private assertStock(product: ProductDocument, qty: number): void {
    if (qty > product.stock) {
      throw new ConflictException(
        `Only ${product.stock} of ${product.name} left in stock`,
      );
    }
  }

  /**
   * Builds the response with all money recomputed from current product prices.
   * Prunes items whose product was deleted, persisting the pruned cart.
   */
  private async build(cart: CartDocument): Promise<CartResponse> {
    const ids = cart.items.map((i) => i.product.toString());
    const products = ids.length ? await this.products.findByIds(ids) : [];
    const byId = new Map(products.map((p) => [p.id as string, p]));

    let changed = false;
    const lines: CartLine[] = [];
    for (const item of cart.items) {
      const product = byId.get(item.product.toString());
      if (!product) {
        changed = true; // stale line — drop it
        continue;
      }
      lines.push({
        product: toProductDto(product),
        qty: item.qty,
        size: item.size ?? null,
        lineTotal: product.price * item.qty,
      });
    }
    if (changed) {
      cart.items = cart.items.filter((i) => byId.has(i.product.toString()));
      await cart.save();
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    return { items: lines, ...computeTotals(subtotal) };
  }
}
