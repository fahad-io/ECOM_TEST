/**
 * Idempotent database seed: wipes the core collections and inserts a known set
 * of products, an admin, two customers, and a couple of historical orders so
 * the storefront, admin dashboard, and personalized recommendations all have
 * data on a fresh clone.
 *
 *   npm run seed         (point MONGO_URI at your DB; or run `npm run db:mem`)
 *
 * Seeded credentials are printed at the end and documented in the README.
 */
import { randomUUID } from 'crypto';
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

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  isNew: boolean;
  tint: string;
  desc: string;
}

const PRODUCTS: SeedProduct[] = [
  { name: 'Everyday Cotton Tee', category: 'Tops', price: 28, stock: 42, isNew: true, tint: '#EEEAE3', desc: 'A midweight organic-cotton tee with a clean crew neck and a relaxed-but-not-boxy fit. The one you reach for first.' },
  { name: 'Boxy Oxford Shirt', category: 'Tops', price: 64, stock: 18, isNew: false, tint: '#E7EAE6', desc: 'Garment-washed oxford cotton with a soft collar and a roomy, modern silhouette. Wears equally well open or buttoned.' },
  { name: 'Merino Crew Knit', category: 'Knitwear', price: 98, stock: 7, isNew: true, tint: '#E9E7EE', desc: 'Fine-gauge extra-fine merino with full-fashioned shoulders. Light enough to layer, warm enough to stand alone.' },
  { name: 'Lambswool Cardigan', category: 'Knitwear', price: 128, stock: 3, isNew: false, tint: '#ECEAE6', desc: 'A soft lambswool cardigan with corozo buttons and a gently dropped shoulder. Quietly substantial.' },
  { name: 'Relaxed Chore Jacket', category: 'Outerwear', price: 168, stock: 12, isNew: true, tint: '#E6EAEC', desc: 'Cotton-twill chore jacket with three patch pockets and a worn-in hand-feel from the first wear.' },
  { name: 'Wool Overcoat', category: 'Outerwear', price: 320, stock: 5, isNew: false, tint: '#EFE9E6', desc: 'A double-faced wool overcoat with a clean unstructured shoulder and a length that works over everything.' },
  { name: 'Pleated Trouser', category: 'Trousers', price: 110, stock: 20, isNew: false, tint: '#EAE8E3', desc: 'Single-pleated trouser in a crisp wool blend, tapered just enough to keep a clean line.' },
  { name: 'Selvedge Denim', category: 'Trousers', price: 140, stock: 15, isNew: true, tint: '#E4E7EC', desc: '13.5oz Japanese selvedge denim with a straight leg that breaks in beautifully over time.' },
  { name: 'Leather Derby', category: 'Footwear', price: 220, stock: 9, isNew: false, tint: '#ECE7E2', desc: 'Goodyear-welted derby in vegetable-tanned leather on a slim, resoleable sole.' },
  { name: 'Canvas Low Sneaker', category: 'Footwear', price: 95, stock: 25, isNew: false, tint: '#E8EAE7', desc: 'A pared-back low-top in heavy organic canvas with a natural rubber sole. Minimal, by design.' },
  { name: 'Pebbled Leather Tote', category: 'Accessories', price: 180, stock: 11, isNew: true, tint: '#EDEAE4', desc: 'A structured pebbled-leather tote sized for a laptop and a day out. Ages into something better.' },
  { name: 'Ribbed Beanie', category: 'Accessories', price: 32, stock: 60, isNew: false, tint: '#E7E9EE', desc: 'A soft ribbed lambswool beanie with a folded cuff. Warm, simple, hard to lose.' },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  const now = Date.now();
  const day = 86_400_000;

  // 1) Wipe core collections (idempotent: same end state every run).
  await Promise.all(
    ['products', 'users', 'carts', 'orders'].map((c) =>
      db.collection(c).deleteMany({}),
    ),
  );

  // 2) Products — stagger createdAt so "newest" sort is meaningful.
  const productDocs = PRODUCTS.map((p, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: p.name,
    description: p.desc,
    price: p.price,
    category: p.category,
    stock: p.stock,
    sizes: SIZES[p.category] ?? [],
    imagePath: null,
    isNewArrival: p.isNew,
    tint: p.tint,
    createdAt: new Date(now - (PRODUCTS.length - i) * day),
    updatedAt: new Date(),
  }));
  await db.collection('products').insertMany(productDocs);
  const byName = new Map(productDocs.map((p) => [p.name, p]));

  // 3) Users — one admin, two customers.
  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash('admin12345', BCRYPT_ROUNDS),
    bcrypt.hash('customer123', BCRYPT_ROUNDS),
  ]);
  const adminId = new mongoose.Types.ObjectId();
  const alexId = new mongoose.Types.ObjectId();
  const mayaId = new mongoose.Types.ObjectId();
  await db.collection('users').insertMany([
    { _id: adminId, name: 'Admin User', email: 'admin@marl.test', passwordHash: adminHash, role: 'admin', createdAt: new Date(), updatedAt: new Date() },
    { _id: alexId, name: 'Alex Rivera', email: 'customer@marl.test', passwordHash: customerHash, role: 'user', createdAt: new Date(), updatedAt: new Date() },
    { _id: mayaId, name: 'Maya Lindqvist', email: 'maya@marl.test', passwordHash: customerHash, role: 'user', createdAt: new Date(), updatedAt: new Date() },
  ]);

  // 4) Orders for the primary customer (history + dashboard + recos data).
  const line = (name: string, qty: number, size: string | null) => {
    const p = byName.get(name)!;
    return { product: p._id, name: p.name, price: p.price, qty, size };
  };
  const order = (
    user: mongoose.Types.ObjectId,
    items: ReturnType<typeof line>[],
    status: string,
    daysAgo: number,
  ) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
    return {
      _id: new mongoose.Types.ObjectId(),
      user,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status,
      shippingAddress: {
        fullName: 'Alex Rivera',
        email: 'customer@marl.test',
        street: '12 Linden Street',
        city: 'London',
        postalCode: 'EC1A 1BB',
      },
      paymentIntentId: null,
      paymentStatus: 'mock',
      createdAt: new Date(now - daysAgo * day),
      updatedAt: new Date(now - daysAgo * day),
    };
  };
  await db.collection('orders').insertMany([
    order(alexId, [line('Relaxed Chore Jacket', 1, 'M'), line('Ribbed Beanie', 1, null)], 'shipped', 5),
    order(alexId, [line('Everyday Cotton Tee', 2, 'L'), line('Canvas Low Sneaker', 1, '42')], 'delivered', 18),
    order(mayaId, [line('Wool Overcoat', 1, 'L')], 'pending', 2),
  ]);

  await mongoose.disconnect();

  /* eslint-disable no-console */
  console.log('Seed complete:');
  console.log(`  ${productDocs.length} products`);
  console.log('  3 users, 3 orders');
  console.log('\nSeeded credentials:');
  console.log('  Admin    — admin@marl.test    / admin12345');
  console.log('  Customer — customer@marl.test / customer123');
  console.log('  Customer — maya@marl.test     / customer123');
  /* eslint-enable no-console */
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
