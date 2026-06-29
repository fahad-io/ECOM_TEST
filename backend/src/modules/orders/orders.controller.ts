import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Place an order from the cart (stock + price enforced server-side)',
  })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.createFromCart(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the current user's orders, newest first" })
  myOrders(@CurrentUser('userId') userId: string) {
    return this.orders.getMyOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of the current user’s orders' })
  getOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.orders.getOneForUser(userId, id);
  }
}
