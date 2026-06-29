import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

export interface ProductSortSpec {
  [field: string]: 1 | -1;
}

/** The only place that touches the Product model. */
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
  ) {}

  async findPaginated(
    filter: Record<string, unknown>,
    sort: ProductSortSpec,
    skip: number,
    limit: number,
  ): Promise<{ items: ProductDocument[]; total: number }> {
    const query = filter as QueryFilter<ProductDocument>;
    const [items, total] = await Promise.all([
      this.model.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  findById(id: string): Promise<ProductDocument | null> {
    return this.model.findById(id).exec();
  }

  create(data: Partial<Product>): Promise<ProductDocument> {
    return this.model.create(data);
  }

  updateById(
    id: string,
    data: Partial<Product>,
  ): Promise<ProductDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
      .exec();
  }

  deleteById(id: string): Promise<ProductDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  countAll(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  countLowStock(threshold: number): Promise<number> {
    return this.model
      .countDocuments({ stock: { $gt: 0, $lte: threshold } })
      .exec();
  }

  findByIds(ids: string[]): Promise<ProductDocument[]> {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

  findRelated(
    category: string,
    excludeId: string,
    limit: number,
  ): Promise<ProductDocument[]> {
    return this.model
      .find({ category, _id: { $ne: excludeId } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Atomically decrements stock only if at least `qty` is available. Returns
   * true if the decrement happened. The {stock: {$gte: qty}} guard makes this a
   * compare-and-set, safe under concurrent orders without a transaction.
   */
  async decrementStockIfAvailable(
    productId: string,
    qty: number,
  ): Promise<boolean> {
    const res = await this.model
      .updateOne(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
      )
      .exec();
    return res.modifiedCount === 1;
  }

  /** Compensating increment used to roll back a partially-applied order. */
  async incrementStock(productId: string, qty: number): Promise<void> {
    await this.model
      .updateOne({ _id: productId }, { $inc: { stock: qty } })
      .exec();
  }
}
