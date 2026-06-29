import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/** Typed `useDispatch` — use everywhere instead of the plain hook. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed `useSelector` — use everywhere instead of the plain hook. */
export const useAppSelector = useSelector.withTypes<RootState>();
