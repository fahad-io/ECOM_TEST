import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminCustomersService } from './admin-customers.service';

@ApiTags('admin/customers')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customers: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with order count and money spent' })
  list() {
    return this.customers.list();
  }

  @Get(':id')
  @ApiOperation({ summary: "A customer's profile, stats, and order history" })
  detail(@Param('id') id: string) {
    return this.customers.detail(id);
  }
}
