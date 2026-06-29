'use client';

import { motion } from 'framer-motion';
import Box from '@mui/material/Box';

export interface PageTransitionProps {
  children: React.ReactNode;
  /** `up` = fade + slide up (page content); `fade` = opacity only (shells). */
  variant?: 'up' | 'fade';
}

/**
 * Framer Motion page-enter wrapper. Mirrors the mockup's `fadeUp`/`fadeIn`
 * keyframes (the page sections animate in on mount).
 */
export default function PageTransition({ children, variant = 'up' }: PageTransitionProps) {
  const initial = variant === 'up' ? { opacity: 0, y: 10 } : { opacity: 0 };
  return (
    <Box
      component={motion.div}
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </Box>
  );
}
