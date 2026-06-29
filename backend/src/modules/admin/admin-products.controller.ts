import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { productImageMulterOptions } from '../../common/upload/product-image.multer';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('admin/products')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a product (optional image upload)' })
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.products.create(dto, image?.filename);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product (optional new image)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.products.update(id, dto, image?.filename);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id') id: string) {
    await this.products.remove(id);
  }
}
