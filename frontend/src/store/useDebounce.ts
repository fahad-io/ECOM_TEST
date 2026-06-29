'use client';

import * as React from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * quiet. Used to throttle the catalog search input into the RTK Query params.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
