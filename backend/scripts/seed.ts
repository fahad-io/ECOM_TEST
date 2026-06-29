/**
 * Idempotent database seed: wipes the core collections and inserts a known set
 * of products, users, and historical orders so the storefront, admin console,
 * and personalized recommendations all have rich data on a fresh clone.
 *
 *   npm run seed         (point MONGO_URI at your DB; or run `npm run db:mem`)
 *
 * Images: every product and user gets a real placeholder image via deterministic
 * public services (picsum.photos / pravatar.cc). The frontend renders absolute
 * image URLs as-is, so these display without any local files. (Requires
 * internet; swap for uploaded images in production.)
 *
 * Seeded credentials are printed at the end and documented in the README.
 */
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/marl';
const BCRYPT_ROUNDS = 10;

// Sizes by category, matching the storefront's Size selector.
const SIZES: Record<string, string[]> = {
  Tops: ['S', 'M', 'L', 'XL'],
  Knitwear: ['S', 'M', 'L', 'XL'],
  Outerwear: ['S', 'M', 'L', 'XL'],
  Trousers: ['30', '32', '34', '36'],
  Footwear: ['40', '41', '42', '43', '44'],
  Accessories: [],
};

const TINTS = [
  '#EEEAE3', '#E7EAE6', '#E9E7EE', '#ECEAE6', '#E6EAEC', '#EFE9E6',
  '#EAE8E3', '#E4E7EC', '#ECE7E2', '#E8EAE7', '#EDEAE4', '#E7E9EE',
];

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  isNew: boolean;
  desc: string;
}

// 25 products across all six categories.
const PRODUCTS: SeedProduct[] = [
  // Tops
  { name: 'Everyday Cotton Tee', category: 'Tops', price: 28, stock: 42, isNew: true, desc: 'A midweight organic-cotton tee with a clean crew neck and a relaxed-but-not-boxy fit.' },
  { name: 'Boxy Oxford Shirt', category: 'Tops', price: 64, stock: 18, isNew: false, desc: 'Garment-washed oxford cotton with a soft collar and a roomy, modern silhouette.' },
  { name: 'Linen Camp Shirt', category: 'Tops', price: 72, stock: 22, isNew: true, desc: 'A breathable European-linen camp collar shirt for warm days and easy layering.' },
  { name: 'Striped Long Sleeve', category: 'Tops', price: 48, stock: 30, isNew: false, desc: 'A classic Breton-striped long sleeve in heavy cotton jersey.' },
  { name: 'Heavyweight Pocket Tee', category: 'Tops', price: 38, stock: 5, isNew: false, desc: 'A substantial 240gsm pocket tee that keeps its shape wash after wash.' },
  // Knitwear
  { name: 'Merino Crew Knit', category: 'Knitwear', price: 98, stock: 7, isNew: true, desc: 'Fine-gauge extra-fine merino with full-fashioned shoulders. Light enough to layer.' },
  { name: 'Lambswool Cardigan', category: 'Knitwear', price: 128, stock: 3, isNew: false, desc: 'A soft lambswool cardigan with corozo buttons and a gently dropped shoulder.' },
  { name: 'Cashmere Roll Neck', category: 'Knitwear', price: 210, stock: 9, isNew: true, desc: 'A pure-cashmere roll neck — featherweight, warm, and quietly luxurious.' },
  { name: 'Cotton Fisherman Sweater', category: 'Knitwear', price: 115, stock: 14, isNew: false, desc: 'A cabled cotton fisherman knit with a substantial, textured hand-feel.' },
  // Outerwear
  { name: 'Relaxed Chore Jacket', category: 'Outerwear', price: 168, stock: 12, isNew: true, desc: 'Cotton-twill chore jacket with three patch pockets and a worn-in hand-feel.' },
  { name: 'Wool Overcoat', category: 'Outerwear', price: 320, stock: 5, isNew: false, desc: 'A double-faced wool overcoat with a clean unstructured shoulder.' },
  { name: 'Quilted Liner Jacket', category: 'Outerwear', price: 185, stock: 16, isNew: true, desc: 'A lightweight quilted liner that works alone or under a coat.' },
  { name: 'Waxed Trench', category: 'Outerwear', price: 295, stock: 6, isNew: false, desc: 'A weatherproof waxed-cotton trench with a relaxed, modern length.' },
  // Trousers
  { name: 'Pleated Trouser', category: 'Trousers', price: 110, stock: 20, isNew: false, desc: 'Single-pleated trouser in a crisp wool blend, tapered to keep a clean line.' },
  { name: 'Selvedge Denim', category: 'Trousers', price: 140, stock: 15, isNew: true, desc: '13.5oz Japanese selvedge denim with a straight leg that breaks in beautifully.' },
  { name: 'Drawstring Linen Pant', category: 'Trousers', price: 92, stock: 24, isNew: true, desc: 'An easy drawstring trouser in washed linen for relaxed warm-weather days.' },
  { name: 'Tapered Wool Trouser', category: 'Trousers', price: 135, stock: 11, isNew: false, desc: 'A refined tapered trouser in a year-round wool with a comfort waistband.' },
  // Footwear
  { name: 'Leather Derby', category: 'Footwear', price: 220, stock: 9, isNew: false, desc: 'Goodyear-welted derby in vegetable-tanned leather on a slim, resoleable sole.' },
  { name: 'Canvas Low Sneaker', category: 'Footwear', price: 95, stock: 25, isNew: false, desc: 'A pared-back low-top in heavy organic canvas with a natural rubber sole.' },
  { name: 'Suede Chukka Boot', category: 'Footwear', price: 240, stock: 8, isNew: true, desc: 'A soft suede chukka on a crepe sole — equal parts rugged and refined.' },
  { name: 'Runner Trainer', category: 'Footwear', price: 130, stock: 4, isNew: true, desc: 'A pared-down runner in suede and mesh with a cushioned EVA midsole.' },
  // Accessories
  { name: 'Pebbled Leather Tote', category: 'Accessories', price: 180, stock: 11, isNew: true, desc: 'A structured pebbled-leather tote sized for a laptop and a day out.' },
  { name: 'Ribbed Beanie', category: 'Accessories', price: 32, stock: 60, isNew: false, desc: 'A soft ribbed lambswool beanie with a folded cuff. Warm, simple, hard to lose.' },
  { name: 'Leather Belt', category: 'Accessories', price: 65, stock: 28, isNew: false, desc: 'A bridle-leather belt with a solid brass buckle that only improves with age.' },
  { name: 'Cashmere Scarf', category: 'Accessories', price: 95, stock: 18, isNew: true, desc: 'A generously sized brushed-cashmere scarf in an undyed natural tone.' },
];

interface SeedUser {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

const USERS: SeedUser[] = [
  { name: 'Admin User', email: 'admin@marl.test', role: 'admin' },
  { name: 'Alex Rivera', email: 'customer@marl.test', role: 'user' },
  { name: 'Maya Lindqvist', email: 'maya@marl.test', role: 'user' },
  { name: 'Theo Nakamura', email: 'theo@marl.test', role: 'user' },
  { name: 'Priya Anand', email: 'priya@marl.test', role: 'user' },
  { name: 'Dan Foster', email: 'dan@marl.test', role: 'user' },
  { name: 'Sofia Marchetti', email: 'sofia@marl.test', role: 'user' },
];

type Status = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
interface OrderSpec {
  email: string;
  items: { name: string; qty: number; size: string | null }[];
  status: Status;
  daysAgo: number;
}

// ~16 orders spread across customers, statuses, and time.
const ORDERS: OrderSpec[] = [
  { email: 'customer@marl.test', items: [{ name: 'Relaxed Chore Jacket', qty: 1, size: 'M' }, { name: 'Ribbed Beanie', qty: 1, size: null }], status: 'shipped', daysAgo: 4 },
  { email: 'customer@marl.test', items: [{ name: 'Everyday Cotton Tee', qty: 2, size: 'L' }, { name: 'Canvas Low Sneaker', qty: 1, size: '42' }], status: 'delivered', daysAgo: 20 },
  { email: 'customer@marl.test', items: [{ name: 'Cashmere Roll Neck', qty: 1, size: 'M' }], status: 'pending', daysAgo: 1 },
  { email: 'maya@marl.test', items: [{ name: 'Wool Overcoat', qty: 1, size: 'L' }], status: 'pending', daysAgo: 2 },
  { email: 'maya@marl.test', items: [{ name: 'Cashmere Scarf', qty: 1, size: null }, { name: 'Leather Belt', qty: 1, size: null }], status: 'delivered', daysAgo: 33 },
  { email: 'theo@marl.test', items: [{ name: 'Merino Crew Knit', qty: 1, size: 'M' }, { name: 'Lambswool Cardigan', qty: 1, size: 'L' }], status: 'processing', daysAgo: 3 },
  { email: 'theo@marl.test', items: [{ name: 'Selvedge Denim', qty: 1, size: '32' }], status: 'shipped', daysAgo: 9 },
  { email: 'priya@marl.test', items: [{ name: 'Selvedge Denim', qty: 1, size: '30' }, { name: 'Leather Derby', qty: 1, size: '41' }], status: 'shipped', daysAgo: 7 },
  { email: 'priya@marl.test', items: [{ name: 'Linen Camp Shirt', qty: 2, size: 'M' }], status: 'delivered', daysAgo: 26 },
  { email: 'dan@marl.test', items: [{ name: 'Pebbled Leather Tote', qty: 1, size: null }], status: 'delivered', daysAgo: 15 },
  { email: 'dan@marl.test', items: [{ name: 'Quilted Liner Jacket', qty: 1, size: 'L' }, { name: 'Heavyweight Pocket Tee', qty: 2, size: 'L' }], status: 'processing', daysAgo: 5 },
  { email: 'sofia@marl.test', items: [{ name: 'Boxy Oxford Shirt', qty: 3, size: 'S' }], status: 'cancelled', daysAgo: 18 },
  { email: 'sofia@marl.test', items: [{ name: 'Suede Chukka Boot', qty: 1, size: '40' }, { name: 'Cashmere Scarf', qty: 1, size: null }], status: 'delivered', daysAgo: 40 },
  { email: 'theo@marl.test', items: [{ name: 'Runner Trainer', qty: 1, size: '43' }], status: 'pending', daysAgo: 1 },
  { email: 'priya@marl.test', items: [{ name: 'Drawstring Linen Pant', qty: 1, size: '32' }, { name: 'Striped Long Sleeve', qty: 1, size: 'M' }], status: 'delivered', daysAgo: 48 },
  { email: 'maya@marl.test', items: [{ name: 'Tapered Wool Trouser', qty: 1, size: '34' }, { name: 'Cotton Fisherman Sweater', qty: 1, size: 'L' }], status: 'shipped', daysAgo: 6 },
];

const productImage = (i: number) => `https://picsum.photos/seed/marl-product-${i + 1}/700/900`;
const avatarImage = (email: string) => `https://i.pravatar.cc/240?u=${encodeURIComponent(email)}`;

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  const now = Date.now();
  const day = 86_400_000;

  // 1) Wipe core collections (idempotent: same end state every run).
  await Promise.all(
    ['products', 'users', 'carts', 'orders'].map((c) => db.collection(c).deleteMany({})),
  );

  // 2) Products — staggered createdAt + a real image each.
  const productDocs = PRODUCTS.map((p, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: p.name,
    description: p.desc,
    price: p.price,
    category: p.category,
    stock: p.stock,
    sizes: SIZES[p.category] ?? [],
    imagePath: productImage(i),
    isNewArrival: p.isNew,
    tint: TINTS[i % TINTS.length],
    createdAt: new Date(now - (PRODUCTS.length - i) * day),
    updatedAt: new Date(),
  }));
  await db.collection('products').insertMany(productDocs);
  const byName = new Map(productDocs.map((p) => [p.name, p]));

  // 3) Users — one admin, six customers, each with an avatar.
  const passwordHash = await bcrypt.hash('customer123', BCRYPT_ROUNDS);
  const adminHash = await bcrypt.hash('admin12345', BCRYPT_ROUNDS);
  const userIds = new Map<string, mongoose.Types.ObjectId>();
  const userDocs = USERS.map((u) => {
    const _id = new mongoose.Types.ObjectId();
    userIds.set(u.email, _id);
    return {
      _id,
      name: u.name,
      email: u.email,
      passwordHash: u.role === 'admin' ? adminHash : passwordHash,
      role: u.role,
      avatarPath: avatarImage(u.email),
      createdAt: new Date(now - 60 * day),
      updatedAt: new Date(),
    };
  });
  await db.collection('users').insertMany(userDocs);

  // 4) Orders — snapshot prices, compute totals, vary status + date.
  const orderDocs = ORDERS.map((o) => {
    const user = userIds.get(o.email)!;
    const items = o.items.map((it) => {
      const p = byName.get(it.name)!;
      return { product: p._id, name: p.name, price: p.price, qty: it.qty, size: it.size };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
    const customer = USERS.find((u) => u.email === o.email)!;
    return {
      _id: new mongoose.Types.ObjectId(),
      user,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: o.status,
      shippingAddress: {
        fullName: customer.name,
        email: o.email,
        street: '12 Linden Street',
        city: 'London',
        postalCode: 'EC1A 1BB',
      },
      paymentIntentId: null,
      paymentStatus: 'mock',
      createdAt: new Date(now - o.daysAgo * day),
      updatedAt: new Date(now - o.daysAgo * day),
    };
  });
  await db.collection('orders').insertMany(orderDocs);

  await mongoose.disconnect();

  /* eslint-disable no-console */
  console.log('Seed complete:');
  console.log(`  ${productDocs.length} products (with images)`);
  console.log(`  ${userDocs.length} users (with avatars)`);
  console.log(`  ${orderDocs.length} orders`);
  console.log('\nSeeded credentials:');
  console.log('  Admin    — admin@marl.test    / admin12345');
  console.log('  Customer — customer@marl.test / customer123  (Alex Rivera, has orders)');
  console.log('  Customers — maya@ / theo@ / priya@ / dan@ / sofia@ marl.test / customer123');
  /* eslint-enable no-console */
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
