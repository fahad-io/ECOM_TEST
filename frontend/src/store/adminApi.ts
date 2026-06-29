import { baseApi } from './baseApi';
import type { Order } from './ordersApi';
import type { OrderStatus } from '@/theme/tokens';

/**
 * Dashboard analytics payload (`GET /admin/dashboard`). Shapes mirror the
 * backend `DashboardDto` exactly — KPIs, an ordered status breakdown (every
 * status present, 0 when none), a ranked top-products list, and a monthly
 * sales series for the bar chart.
 */
export interface DashboardOrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface DashboardTopProduct {
  productId: string;
  name: string;
  units: number;
  revenue: number;
}

export interface DashboardSalesPoint {
  /** `YYYY-MM` month key from the backend aggregation. */
  month: string;
  total: number;
}

export interface Dashboard {
  totalSales: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
  ordersByStatus: DashboardOrdersByStatus[];
  topProducts: DashboardTopProduct[];
  salesOverTime: DashboardSalesPoint[];
}

/**
 * Fields an admin product create/update form collects. `image` is the optional
 * uploaded file. `sizes` is sent as a comma-separated string (the backend DTO
 * splits it). Everything else mirrors `CreateProductDto`.
 */
export interface ProductFormFields {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sizes?: string;
  image?: File | null;
}

export interface UpdateProductArg {
  id: string;
  body: ProductFormFields;
}

/**
 * Build a multipart `FormData` body from the product form fields. We never set
 * `Content-Type` ourselves — letting the browser set the multipart boundary is
 * required, so these mutations pass a raw `FormData` as the request body and
 * RTK Query / fetch handle the header.
 */
function toProductFormData(fields: ProductFormFields): FormData {
  const fd = new FormData();
  fd.append('name', fields.name);
  if (fields.description !== undefined) {
    fd.append('description', fields.description);
  }
  fd.append('price', String(fields.price));
  fd.append('stock', String(fields.stock));
  fd.append('category', fields.category);
  if (fields.sizes) {
    fd.append('sizes', fields.sizes);
  }
  // Only append the file when a new one was chosen; on edit, omitting it keeps
  // the existing image.
  if (fields.image) {
    fd.append('image', fields.image);
  }
  return fd;
}

/**
 * Admin console endpoints injected on the shared `baseApi`. All routes are
 * bearer-guarded + `@Roles('admin')` server-side; the UI is additionally hidden
 * behind the `RequireAuth admin` guard.
 *
 * - Product mutations send **multipart `FormData`** (image + fields) and
 *   invalidate both `Products` (so the storefront catalog refetches) and
 *   `Admin` (dashboard KPIs / top products).
 * - Order status updates invalidate `Orders` (customer history) + `Admin`.
 */
export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, void>({
      query: () => ({ url: '/admin/dashboard' }),
      providesTags: [{ type: 'Admin', id: 'DASHBOARD' }],
    }),

    createProduct: build.mutation<unknown, ProductFormFields>({
      query: (fields) => ({
        url: '/admin/products',
        method: 'POST',
        body: toProductFormData(fields),
      }),
      invalidatesTags: [
        { type: 'Products', id: 'LIST' },
        { type: 'Admin', id: 'DASHBOARD' },
      ],
    }),

    updateProduct: build.mutation<unknown, UpdateProductArg>({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body: toProductFormData(body),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        { type: 'Admin', id: 'DASHBOARD' },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        { type: 'Admin', id: 'DASHBOARD' },
      ],
    }),

    getAdminOrders: build.query<Order[], OrderStatus | undefined>({
      query: (status) => ({
        url: '/admin/orders',
        params: status ? { status } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Orders' as const, id: o.id })),
              { type: 'Orders' as const, id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Orders' as const, id: 'ADMIN_LIST' }],
    }),

    updateOrderStatus: build.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'ADMIN_LIST' },
        { type: 'Orders', id: 'LIST' },
        { type: 'Admin', id: 'DASHBOARD' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} = adminApi;
