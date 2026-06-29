import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** Every field optional; image is handled separately via the uploaded file. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
