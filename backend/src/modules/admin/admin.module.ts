import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [
    AdminProductsController,
    AdminOrdersController,
    DashboardController,
  ],
  providers: [AdminProductsService, AdminOrdersService, DashboardService],
})
export class AdminModule {}
