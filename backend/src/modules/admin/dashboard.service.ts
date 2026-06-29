import { Injectable } from '@nestjs/common';
import { CATEGORIES } from '../../common/enums/category.enum';
import { ORDER_STATUSES, OrderStatus } from '../../common/enums/order-status.enum';
import { OrdersRepository } from '../orders/orders.repository';
import { ProductsRepository } from '../products/products.repository';

const LOW_STOCK_THRESHOLD = 5;
const TOP_PRODUCTS_LIMIT = 5;

export interface DashboardDto {
  totalSales: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  topProducts: {
    productId: string;
    name: string;
    units: number;
    revenue: number;
  }[];
  salesOverTime: { month: string; total: number }[];
  productsByCategory: { category: string; count: number }[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly orders: OrdersRepository,
    private readonly products: ProductsRepository,
  ) {}

  async getDashboard(): Promise<DashboardDto> {
    const [salesAgg, byStatus, top, byMonth, productCount, lowStockCount, byCategory] =
      await Promise.all([
        this.orders.totalSales(),
        this.orders.countByStatus(),
        this.orders.topProducts(TOP_PRODUCTS_LIMIT),
        this.orders.salesByMonth(),
        this.products.countAll(),
        this.products.countLowStock(LOW_STOCK_THRESHOLD),
        this.products.countByCategory(),
      ]);

    const statusMap = new Map(byStatus.map((s) => [s._id, s.count]));
    // Always return every status (0 when none), so the chart is stable.
    const ordersByStatus = ORDER_STATUSES.map((status) => ({
      status,
      count: statusMap.get(status) ?? 0,
    }));
    const orderCount = ordersByStatus.reduce((sum, s) => sum + s.count, 0);

    // 0-fill every category so the products chart is stable.
    const categoryMap = new Map(byCategory.map((c) => [c._id, c.count]));
    const productsByCategory = CATEGORIES.map((category) => ({
      category,
      count: categoryMap.get(category) ?? 0,
    }));

    return {
      totalSales: salesAgg[0]?.total ?? 0,
      orderCount,
      productCount,
      lowStockCount,
      ordersByStatus,
      topProducts: top.map((t) => ({
        productId: String(t._id),
        name: t.name,
        units: t.units,
        revenue: t.revenue,
      })),
      salesOverTime: byMonth.map((m) => ({ month: m._id, total: m.total })),
      productsByCategory,
    };
  }
}
