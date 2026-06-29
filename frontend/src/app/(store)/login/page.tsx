import { Suspense } from 'react';
import AuthScreen from './AuthScreen';

/** Customer sign-in route. Wrapped in Suspense for `useSearchParams`. */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
