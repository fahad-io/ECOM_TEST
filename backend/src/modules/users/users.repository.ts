import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
import { User, UserDocument } from './schemas/user.schema';

/**
 * The only place that touches the User model. Services depend on this, never on
 * the Mongoose model directly (repository pattern).
 */
@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<UserDocument> {
    return this.model.create(data);
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  /** Includes the passwordHash, which is otherwise excluded by default. */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  /** By id, including the passwordHash (for verifying a password change). */
  findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).select('+passwordHash').exec();
  }

  updateById(
    id: string,
    data: Partial<{
      name: string;
      passwordHash: string;
      avatarPath: string | null;
    }>,
  ): Promise<UserDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
      .exec();
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.model
      .exists({ email: email.toLowerCase() })
      .then((doc) => doc !== null);
  }

  /** All customers (role `user`), newest first — for the admin customers list. */
  findCustomers(): Promise<UserDocument[]> {
    return this.model.find({ role: Role.User }).sort({ createdAt: -1 }).exec();
  }
}
