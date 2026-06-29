import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Never selected by default, so it can't leak through a stray query.
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: Role, default: Role.User })
  role: Role;

  // Relative path under /uploads for the profile picture, or null.
  @Prop({ type: String, default: null })
  avatarPath: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
