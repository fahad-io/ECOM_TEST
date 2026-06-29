import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List products with search, filter, sort and pagination',
  })
  list(@Query() query: QueryProductsDto) {
    return this.products.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  getOne(@Param('id') id: string) {
    return this.products.getOne(id);
  }
}
