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

  /**
   * Returns the user's cart, creating an empty one if none exists. Atomic
   * upsert so concurrent first-requests can't race into a duplicate-key 409.
   */
  findOrCreate(userId: string): Promise<CartDocument> {
    const user = new Types.ObjectId(userId);
    return this.model
      .findOneAndUpdate(
        { user },
        { $setOnInsert: { user, items: [] } },
        { upsert: true, new: true },
      )
      .exec() as Promise<CartDocument>;
  }

  clear(userId: string): Promise<unknown> {
    return this.model
      .updateOne({ user: new Types.ObjectId(userId) }, { $set: { items: [] } })
      .exec();
  }
}
