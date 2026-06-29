import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminCustomersService } from './admin-customers.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ProductsModule, OrdersModule, UsersModule],
  controllers: [
    AdminProductsController,
    AdminOrdersController,
    AdminCustomersController,
    DashboardController,
  ],
  providers: [
    AdminProductsService,
    AdminOrdersService,
    AdminCustomersService,
    DashboardService,
  ],
})
export class AdminModule {}
