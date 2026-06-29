import { Suspense } from 'react';
import AuthScreen from '../login/AuthScreen';

/** Customer create-account route. Wrapped in Suspense for `useSearchParams`. */
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthScreen mode="signup" />
    </Suspense>
  );
}
