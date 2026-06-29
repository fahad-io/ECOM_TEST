'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  type ProductFormFields,
} from '@/store/adminApi';
import { PRODUCT_CATEGORIES, type Product } from '@/store/productsApi';
import { normalizeApiError } from '@/store/normalizeError';
import { productImageUrl } from '@/lib/imageUrl';
import { mono } from '@/theme/format';

interface FormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

/** Yup schema mirroring the server `CreateProductDto` rules. */
const schema: yup.ObjectSchema<FormValues> = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters')
    .required('Name is required'),
  description: yup.string().max(2000, 'Description must be at most 2000 characters').default(''),
  price: yup
    .number()
    .typeError('Price must be a number')
    .integer('Price must be a whole dollar amount')
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  category: yup
    .string()
    .oneOf([...PRODUCT_CATEGORIES], 'Choose a category')
    .required('Category is required'),
});

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' },
  '& .MuiOutlinedInput-input': { color: '#111827' },
  // Match the select's display element to the 46px text-input height (the theme
  // sizes .MuiOutlinedInput-input but not .MuiSelect-select), so Category lines
  // up with Name / Price / Stock.
  '& .MuiSelect-select': {
    height: 46,
    minHeight: 46,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    fontSize: 14,
    color: '#111827',
  },
} as const;

const labelSx = { fontSize: 13, color: '#6B7280', mb: '6px', fontWeight: 500 } as const;

export interface ProductFormProps {
  /** Existing product when editing; absent for create. */
  product?: Product;
}

/**
 * Create / edit product form (shared by `/admin/products/new` and
 * `/admin/products/[id]/edit`). RHF + Yup validation mirrors the server DTO.
 * Submits as multipart `FormData` (image + fields) via the admin mutations.
 * Image area is a drag-and-drop / click dropzone ("Drop image or browse") with
 * a live preview; on save the cache invalidates and we return to the table.
 */
export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const editing = Boolean(product);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const submitting = creating || updating;

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    productImageUrl(product?.imagePath) ?? null,
  );
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Revoke object URLs we created to avoid leaks.
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category: product?.category ?? '',
    },
  });

  const name = watch('name');

  const pickFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setServerError('Please choose a PNG or JPG image.');
      return;
    }
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const fields: ProductFormFields = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price: values.price,
      stock: values.stock,
      category: values.category,
      image: imageFile,
    };
    try {
      if (editing && product) {
        await updateProduct({ id: product.id, body: fields }).unwrap();
      } else {
        await createProduct(fields).unwrap();
      }
      router.push('/admin/products');
    } catch (err) {
      setServerError(normalizeApiError(err as never).message);
    }
  });

  return (
    <Box sx={{ width: '100%', animation: 'fadeUp .35s ease both' }}>
      <Link
        component="button"
        type="button"
        onClick={() => router.push('/admin/products')}
        sx={{ fontSize: 13.5, color: '#6B7280', fontWeight: 500, mb: '18px', display: 'inline-block' }}
      >
        ← Back to products
      </Link>

      <Box component="form" onSubmit={onSubmit} noValidate sx={{ bgcolor: '#fff', border: '1px solid #ECECEC', borderRadius: '16px', p: '28px' }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: '20px', borderRadius: '10px' }}>
            {serverError}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '260px 1fr' }, gap: '36px' }}>
          {/* image dropzone */}
          <Box>
            <Typography sx={{ fontSize: 13, color: '#6B7280', mb: '10px', fontWeight: 600 }}>
              Product image
            </Typography>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Upload product image"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              sx={{
                aspectRatio: '3 / 4',
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : '#E5E7EB',
                borderRadius: '12px',
                bgcolor: product?.tint || '#EAE8E3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#9CA3AF',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Box component="img" src={previewUrl} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box component="span" aria-hidden sx={{ fontSize: 40, fontWeight: 800, color: 'rgba(17,24,39,.18)' }}>
                  {mono(name || 'New')}
                </Box>
              )}
              {!previewUrl && (
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>Drop image or browse</Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: '8px', textAlign: 'center' }}>
              PNG/JPG · or paste a URL below
            </Typography>
            {previewUrl && (
              <Link
                component="button"
                type="button"
                onClick={() => {
                  if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                sx={{ display: 'block', textAlign: 'center', fontSize: 12, color: '#6B7280', mt: '4px', mx: 'auto' }}
              >
                Remove image
              </Link>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </Box>

          {/* fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box>
              <Typography sx={labelSx}>Name</Typography>
              <TextField
                fullWidth
                placeholder="Merino Crew Knit"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                sx={fieldSx}
                {...register('name')}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Description</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="A quietly considered staple…"
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                sx={fieldSx}
                {...register('description')}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '14px' }}>
              <Box>
                <Typography sx={labelSx}>Price ($)</Typography>
                <TextField
                  fullWidth
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  error={Boolean(errors.price)}
                  helperText={errors.price?.message}
                  sx={fieldSx}
                  {...register('price')}
                />
              </Box>
              <Box>
                <Typography sx={labelSx}>Stock</Typography>
                <TextField
                  fullWidth
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  error={Boolean(errors.stock)}
                  helperText={errors.stock?.message}
                  sx={fieldSx}
                  {...register('stock')}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={labelSx}>Category</Typography>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    error={Boolean(errors.category)}
                    helperText={errors.category?.message}
                    sx={fieldSx}
                    slotProps={{
                      select: {
                        displayEmpty: true,
                        renderValue: (value) =>
                          value ? (
                            String(value)
                          ) : (
                            <Box component="span" sx={{ color: '#9CA3AF' }}>
                              Select a category
                            </Box>
                          ),
                      },
                    }}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: '12px', mt: '8px' }}>
              <Button
                type="submit"
                disabled={submitting}
                sx={{ height: 46, px: '24px', bgcolor: '#111827', color: '#fff', borderRadius: '99px', fontSize: 14, fontWeight: 600, '&:hover': { bgcolor: '#000' } }}
              >
                {submitting ? 'Saving…' : 'Save product'}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/admin/products')}
                disabled={submitting}
                sx={{ height: 46, px: '22px', border: '1px solid #E5E7EB', color: '#111827', borderRadius: '99px', fontSize: 14, fontWeight: 600 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
