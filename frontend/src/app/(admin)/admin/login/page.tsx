import { Suspense } from 'react';
import AdminLoginScreen from './AdminLoginScreen';

/** Staff sign-in route. Wrapped in Suspense for `useSearchParams`. */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginScreen />
    </Suspense>
  );
}
