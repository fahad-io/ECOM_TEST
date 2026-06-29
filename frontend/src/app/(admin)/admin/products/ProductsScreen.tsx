'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useGetProductsQuery, type Product } from '@/store/productsApi';
import { useDeleteProductMutation } from '@/store/adminApi';
import { normalizeApiError } from '@/store/normalizeError';
import { money, mono, stockColor } from '@/theme/format';

const GRID = '2.4fr 1.2fr 1fr 1fr 0.9fr';
const LOW_STOCK_THRESHOLD = 5;

const CARD_SX = {
  bgcolor: '#fff',
  border: '1px solid #ECECEC',
  borderRadius: '16px',
  overflow: 'hidden',
} as const;

function HeaderRow() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: GRID,
        gap: '16px',
        p: '14px 22px',
        bgcolor: '#FAFAF9',
        borderBottom: '1px solid #ECECEC',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#9CA3AF',
        fontWeight: 700,
      }}
    >
      <Box>Product</Box>
      <Box>Category</Box>
      <Box>Price</Box>
      <Box>Stock</Box>
      <Box sx={{ textAlign: 'right' }}>Actions</Box>
    </Box>
  );
}

/**
 * Admin product management body. Lists the catalog in a table (mono swatch +
 * name, category, price, stock dot, Edit/Delete), with a "{N} products ·
 * {lowStock} low on stock" header and "+ Add product". Delete confirms first
 * and surfaces server errors. Data via `getProducts` at a high limit.
 */
export default function ProductsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGetProductsQuery({
    limit: 200,
    sort: 'new',
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const lowStock = items.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteError(null);
    try {
      await deleteProduct(pendingDelete.id).unwrap();
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(normalizeApiError(err as never).message);
    }
  };

  return (
    <Box sx={{ animation: 'fadeUp .35s ease both' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '20px',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
          {isLoading ? 'Loading…' : `${total} products · ${lowStock} low on stock`}
        </Typography>
        <Button
          onClick={() => router.push('/admin/products/new')}
          sx={{
            height: 42,
            px: '18px',
            bgcolor: '#111827',
            color: '#fff',
            borderRadius: '99px',
            fontSize: 14,
            fontWeight: 600,
            '&:hover': { bgcolor: '#000' },
          }}
        >
          + Add product
        </Button>
      </Box>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {normalizeApiError(error as never).message}
        </Alert>
      )}

      <Box sx={CARD_SX}>
        <HeaderRow />
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                sx={{ display: 'grid', gridTemplateColumns: GRID, gap: '16px', p: '13px 22px', borderBottom: '1px solid #F4F4F2', alignItems: 'center' }}
              >
                <Skeleton width="60%" />
                <Skeleton width="50%" />
                <Skeleton width="40%" />
                <Skeleton width="40%" />
                <Skeleton width="50%" sx={{ ml: 'auto' }} />
              </Box>
            ))
          : items.map((p) => (
              <Box
                key={p.id}
                sx={{ display: 'grid', gridTemplateColumns: GRID, gap: '16px', p: '13px 22px', borderBottom: '1px solid #F4F4F2', alignItems: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 38,
                      height: 46,
                      borderRadius: '8px',
                      bgcolor: p.tint || '#EAE8E3',
                      flex: '0 0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                      color: 'rgba(17,24,39,.35)',
                    }}
                  >
                    {mono(p.name)}
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }} noWrap>
                    {p.name}
                  </Typography>
                </Box>
                <Box sx={{ fontSize: 13.5, color: '#6B7280' }}>{p.category}</Box>
                <Box sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{money(p.price)}</Box>
                <Box>
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 13, fontWeight: 600, color: stockColor(p.stock) }}
                  >
                    <Box component="span" aria-hidden sx={{ width: 6, height: 6, borderRadius: '99px', bgcolor: stockColor(p.stock) }} />
                    {p.stock}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
                  <Box
                    component="button"
                    onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                    sx={{ border: 'none', bgcolor: 'transparent', font: 'inherit', fontSize: 13, fontWeight: 600, color: '#111827', cursor: 'pointer', p: 0 }}
                  >
                    Edit
                  </Box>
                  <Box
                    component="button"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(p);
                    }}
                    sx={{ border: 'none', bgcolor: 'transparent', font: 'inherit', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer', p: 0 }}
                  >
                    Delete
                  </Box>
                </Box>
              </Box>
            ))}

        {!isLoading && !isError && items.length === 0 && (
          <Box sx={{ p: '48px 22px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', mb: '6px' }}>
              No products yet
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: '#9CA3AF' }}>
              Add your first piece to the edit.
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={Boolean(pendingDelete)} onClose={() => (isDeleting ? null : setPendingDelete(null))}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete ? `"${pendingDelete.name}" will be permanently removed from the catalog.` : ''}
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 18px' }}>
          <Button onClick={() => setPendingDelete(null)} disabled={isDeleting} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={isDeleting}
            sx={{ bgcolor: '#DC2626', color: '#fff', '&:hover': { bgcolor: '#B91C1C' } }}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
