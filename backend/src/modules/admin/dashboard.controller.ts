import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DashboardService } from './dashboard.service';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Analytics: total sales, orders by status, top products, sales over time',
  })
  get() {
    return this.dashboard.getDashboard();
  }
}
