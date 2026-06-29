import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  // Not `required` — Mongoose treats an empty string as missing, which would
  // reject products created without a description. Defaults to ''.
  @Prop({ default: '' })
  description: string;

  // USD, whole dollars (matches the design). Stored as a Number.
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: [String], default: [] })
  sizes: string[];

  // Relative path under /uploads, or null when no image was uploaded.
  @Prop({ type: String, default: null })
  imagePath: string | null;

  // Manual "NEW" badge flag from the design (distinct from createdAt sorting).
  // Named isNewArrival to avoid clashing with Mongoose's internal doc.isNew;
  // exposed to the API as `isNew` by the product mapper.
  @Prop({ default: false })
  isNewArrival: boolean;

  // Neutral swatch colour used as an image placeholder in the design.
  @Prop({ default: '#EAE8E3' })
  tint: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text index supports name search; createdAt index supports "newest" sort.
ProductSchema.index({ name: 'text' });
ProductSchema.index({ createdAt: -1 });
