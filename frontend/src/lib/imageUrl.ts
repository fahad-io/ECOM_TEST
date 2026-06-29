const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
// The backend serves uploaded images at <origin>/uploads/... , i.e. the API
// base URL without its trailing /api.
const UPLOAD_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/**
 * Resolve a product `imagePath` (a relative `/uploads/...` path, or null) to an
 * absolute URL on the backend origin. Returns undefined when there's no image,
 * so callers fall back to the tint placeholder. Pass-through for absolute URLs.
 */
export function productImageUrl(
  imagePath?: string | null,
): string | undefined {
  if (!imagePath) return undefined;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${UPLOAD_ORIGIN}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}
