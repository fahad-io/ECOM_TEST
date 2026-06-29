import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

/** The only place that touches the Cart model. */
@Injectable()
export class CartRepository {
  constructor(@InjectModel(Cart.name) private readonly model: Model<CartDocument>) {}

  findByUser(userId: string): Promise<CartDocument | null> {
    return this.model.findOne({ user: new Types.ObjectId(userId) }).exec();
  }

  /** Returns the user's cart, creating an empty one if none exists. */
  async findOrCreate(userId: string): Promise<CartDocument> {
    const existing = await this.findByUser(userId);
    if (existing) return existing;
    return this.model.create({ user: new Types.ObjectId(userId), items: [] });
  }

  clear(userId: string): Promise<unknown> {
    return this.model
      .updateOne({ user: new Types.ObjectId(userId) }, { $set: { items: [] } })
      .exec();
  }
}
