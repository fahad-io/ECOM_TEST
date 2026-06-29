import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's cart with recomputed totals" })
  get(@CurrentUser('userId') userId: string) {
    return this.cart.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  add(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(userId, dto);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update the quantity/size of a cart item' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(userId, productId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  remove(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cart.removeItem(userId, productId);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Empty the cart' })
  async clear(@CurrentUser('userId') userId: string) {
    await this.cart.clear(userId);
  }
}
