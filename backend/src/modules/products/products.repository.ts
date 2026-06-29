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
}
