import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminOrdersService } from './admin-orders.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('admin/orders')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders, optionally filtered by status' })
  list(@Query() query: ListOrdersQueryDto) {
    return this.orders.listAll(query.status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance an order status along its lifecycle' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
