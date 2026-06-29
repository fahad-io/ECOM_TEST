'use client';

/**
 * Design-system preview placeholder. Renders the storefront chrome around a
 * small product grid so the build has something to show. The real catalog is
 * built next phase — this is intentionally static demo data.
 */
import Box from '@mui/material/Box';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import PageTransition from '@/components/PageTransition';
import type { ProductCardProduct } from '@/components/ProductCard';

const DEMO: ProductCardProduct[] = [
  { id: '1', name: 'Everyday Cotton Tee', category: 'Tops', price: 28, stock: 42, isNew: true, tint: '#EEEAE3' },
  { id: '3', name: 'Merino Crew Knit', category: 'Knitwear', price: 98, stock: 7, isNew: true, tint: '#E9E7EE' },
  { id: '4', name: 'Lambswool Cardigan', category: 'Knitwear', price: 128, stock: 3, tint: '#ECEAE6' },
  { id: '6', name: 'Wool Overcoat', category: 'Outerwear', price: 320, stock: 5, tint: '#EFE9E6' },
  { id: '10', name: 'Canvas Low Sneaker', category: 'Footwear', price: 95, stock: 25, tint: '#E8EAE7' },
  { id: '11', name: 'Pebbled Leather Tote', category: 'Accessories', price: 180, stock: 0, isNew: true, tint: '#EDEAE4' },
];

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={3} accountLabel="Account" />
      <Box component="main" sx={{ flex: 1 }}>
        <PageTransition>
          <Box sx={{ maxWidth: 1240, mx: 'auto', px: 4, py: '46px' }}>
            <SectionHeading
              level="h2"
              eyebrow="The Autumn Edit"
              title="Quietly considered wardrobe staples."
              sx={{ mb: '30px' }}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
                gap: '26px 22px',
              }}
            >
              {DEMO.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Box>
          </Box>
        </PageTransition>
      </Box>
      <Footer />
    </Box>
  );
}
