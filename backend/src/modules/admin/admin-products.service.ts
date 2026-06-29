import { Injectable, NotFoundException } from '@nestjs/common';
import { toPublicImagePath } from '../../common/upload/product-image.multer';
import { ProductDto, toProductDto } from '../products/product.mapper';
import { ProductsRepository } from '../products/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly products: ProductsRepository) {}

  async create(
    dto: CreateProductDto,
    imageFilename?: string,
  ): Promise<ProductDto> {
    const product = await this.products.create({
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      category: dto.category,
      stock: dto.stock,
      sizes: dto.sizes ?? [],
      imagePath: imageFilename ? toPublicImagePath(imageFilename) : null,
      isNewArrival: true, // new products surface as NEW, matching the design
    });
    return toProductDto(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    imageFilename?: string,
  ): Promise<ProductDto> {
    const data: Record<string, unknown> = { ...dto };
    if (imageFilename) {
      data.imagePath = toPublicImagePath(imageFilename);
    }
    const updated = await this.products.updateById(id, data).catch(() => null);
    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return toProductDto(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.products.deleteById(id).catch(() => null);
    if (!deleted) {
      throw new NotFoundException('Product not found');
    }
  }
}
