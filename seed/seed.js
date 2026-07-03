require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const InventoryItem = require('../models/InventoryItem');
const InventoryCategory = require('../models/InventoryCategory');
const ExpenseItem = require('../models/ExpenseItem');
const Settings = require('../models/Settings');

async function seed() {
  await connectDB();

  const existing = await Settings.findOne();
  if (existing) {
    console.log('⚠️  Database already has data (Settings found). Skipping seed to avoid duplicates.');
    console.log('   To re-seed from scratch, drop the database first: mongosh restaurant_pos --eval "db.dropDatabase()"');
    process.exit(0);
  }

  console.log('🌱 Seeding initial data...');

  // ---------- Users ----------
  const userDefs = [
    { name: 'احمد مدیر', username: 'admin', password: '1234', role: 'manager', salary: 30000, phone: '0701000001', joinDate: '1402-01-01' },
    { name: 'محمد گارسون', username: 'waiter1', password: '1234', role: 'waiter', salary: 12000, phone: '0701000002', joinDate: '1402-03-01' },
    { name: 'علی آشپز', username: 'chef1', password: '1234', role: 'chef', salary: 18000, phone: '0701000003', joinDate: '1402-02-01' },
    { name: 'سارا خزانه‌دار', username: 'cash1', password: '1234', role: 'cashier', salary: 15000, phone: '0701000004', joinDate: '1402-04-01' },
  ];
  for (const u of userDefs) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, passwordHash });
  }
  console.log(`   ✓ ${userDefs.length} users created (all passwords: 1234)`);

  // ---------- Categories ----------
  const cats = await Category.insertMany([
    { name: 'غذای افغانی', icon: '🍛' },
    { name: 'فست فود', icon: '🍔' },
    { name: 'نوشیدنی', icon: '🥤' },
    { name: 'دیزرت', icon: '🍰' },
  ]);
  console.log(`   ✓ ${cats.length} menu categories created`);

  // ---------- Menu items ----------
  await MenuItem.insertMany([
    { name: 'پلو افغانی', desc: 'پلو با گوشت', icon: '🍛', price: 250, catId: cats[0]._id, stock: 50, active: true },
    { name: 'منتو', desc: 'منتوی خانگی', icon: '🥟', price: 200, catId: cats[0]._id, stock: 40, active: true },
    { name: 'برگر', desc: 'برگر گوشت', icon: '🍔', price: 180, catId: cats[1]._id, stock: 60, active: true },
    { name: 'پیتزا', desc: 'پیتزا مخصوص', icon: '🍕', price: 350, catId: cats[1]._id, stock: 30, active: true },
    { name: 'نوشابه', desc: 'نوشابه گازدار', icon: '🥤', price: 50, catId: cats[2]._id, stock: 100, active: true },
    { name: 'دوغ', desc: 'دوغ محلی', icon: '🥛', price: 40, catId: cats[2]._id, stock: 80, active: true },
    { name: 'فرنی', desc: 'دیزرت سنتی', icon: '🍮', price: 80, catId: cats[3]._id, stock: 25, active: true },
  ]);
  console.log('   ✓ 7 menu items created');

  // ---------- Tables ----------
  const tableDefs = Array.from({ length: 10 }, (_, i) => ({ num: i + 1, cap: i % 3 === 0 ? 6 : 4 }));
  await Table.insertMany(tableDefs);
  console.log(`   ✓ ${tableDefs.length} tables created`);

  // ---------- Inventory categories + items ----------
  const invCatDefs = ['مواد اولیه', 'گوشت', 'نوشیدنی', 'لبنیات'];
  await InventoryCategory.insertMany(invCatDefs.map((name) => ({ name })));
  await InventoryItem.insertMany([
    { name: 'برنج', category: 'مواد اولیه', qty: 100, unit: 'کیلو', minQty: 20, costPerUnit: 80 },
    { name: 'گوشت گاو', category: 'گوشت', qty: 50, unit: 'کیلو', minQty: 10, costPerUnit: 350 },
    { name: 'نوشابه (بطری)', category: 'نوشیدنی', qty: 200, unit: 'عدد', minQty: 30, costPerUnit: 25 },
    { name: 'شیر', category: 'لبنیات', qty: 40, unit: 'لیتر', minQty: 10, costPerUnit: 60 },
  ]);
  console.log('   ✓ inventory categories + items created');

  // ---------- Expense items ----------
  await ExpenseItem.insertMany(
    ['اجاره', 'برق', 'آب', 'گاز', 'حقوق', 'خرید مواد', 'تجهیزات', 'تعمیرات', 'تبلیغات', 'سایر'].map((name) => ({ name }))
  );
  console.log('   ✓ expense item categories created');

  // ---------- Settings ----------
  await Settings.create({
    restaurantName: 'رستورانت کابل',
    phone: '0700000000',
    address: 'کابل، افغانستان',
    currency: 'AFN',
    taxRate: 0,
    serviceCharge: 0,
    currentDay: new Date().toISOString().slice(0, 10),
    dayOpen: true,
    dayId: 1,
    logo: '',
  });
  console.log('   ✓ settings created');

  console.log('\n✅ Seed complete! Login with username: admin / password: 1234\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
