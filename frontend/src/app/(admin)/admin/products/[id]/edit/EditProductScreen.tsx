'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { useRouter } from 'next/navigation';
import { useGetProductQuery } from '@/store/productsApi';
import { normalizeApiError } from '@/store/normalizeError';
import ProductForm from '../../ProductForm';

/**
 * Loads the product to edit, then renders the shared `ProductForm` prefilled.
 * Handles loading + not-found / error states.
 */
export default function EditProductScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGetProductQuery(id);

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 760 }}>
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ maxWidth: 760 }}>
        <Link
          component="button"
          type="button"
          onClick={() => router.push('/admin/products')}
          sx={{ fontSize: 13.5, color: '#6B7280', fontWeight: 500, mb: '18px', display: 'inline-block' }}
        >
          ← Back to products
        </Link>
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {isError ? normalizeApiError(error as never).message : 'Product not found.'}
        </Alert>
      </Box>
    );
  }

  return <ProductForm product={data} />;
}
