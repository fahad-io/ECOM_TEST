import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Role } from '../../common/enums/role.enum';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('admin/orders')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiOperation({ summary: 'List all orders, optionally filtered by status' })
  list(@Query('status') status?: OrderStatus) {
    return this.orders.listAll(status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance an order status along its lifecycle' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
