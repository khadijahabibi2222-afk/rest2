// One-time seed endpoint — ONLY works if DB is empty AND SEED_SECRET matches.
// After seeding, this route becomes a no-op (seeded flag in Settings prevents re-run).
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const InventoryItem = require('../models/InventoryItem');
const InventoryCategory = require('../models/InventoryCategory');
const ExpenseItem = require('../models/ExpenseItem');
const Settings = require('../models/Settings');

router.post('/seed', async (req, res) => {
  try {
    const secret = process.env.SEED_SECRET || 'seed1234';
    if (req.headers['x-seed-secret'] !== secret) {
      return res.status(403).json({ message: 'Forbidden — wrong x-seed-secret header' });
    }
    const existing = await Settings.findOne();
    if (existing) {
      return res.json({ message: 'Already seeded — nothing changed.' });
    }

    const userDefs = [
      { name:'احمد مدیر',     username:'admin',   password:'1234', role:'manager',  salary:30000, phone:'0701000001', joinDate:'1402-01-01' },
      { name:'محمد گارسون',   username:'waiter1', password:'1234', role:'waiter',   salary:12000, phone:'0701000002', joinDate:'1402-03-01' },
      { name:'علی آشپز',      username:'chef1',   password:'1234', role:'chef',     salary:18000, phone:'0701000003', joinDate:'1402-02-01' },
      { name:'سارا خزانه‌دار', username:'cash1',   password:'1234', role:'cashier',  salary:15000, phone:'0701000004', joinDate:'1402-04-01' },
    ];
    for (const u of userDefs) {
      await User.create({ ...u, passwordHash: await bcrypt.hash(u.password, 10) });
    }

    const cats = await Category.insertMany([
      { name:'غذای افغانی', icon:'🍛' },
      { name:'فست فود',     icon:'🍔' },
      { name:'نوشیدنی',     icon:'🥤' },
      { name:'دیزرت',       icon:'🍰' },
    ]);

    await MenuItem.insertMany([
      { name:'پلو افغانی', desc:'پلو با گوشت',   icon:'🍛', price:250, catId:cats[0]._id, stock:50, active:true },
      { name:'منتو',       desc:'منتوی خانگی',   icon:'🥟', price:200, catId:cats[0]._id, stock:40, active:true },
      { name:'برگر',       desc:'برگر گوشت',      icon:'🍔', price:180, catId:cats[1]._id, stock:60, active:true },
      { name:'پیتزا',      desc:'پیتزا مخصوص',   icon:'🍕', price:350, catId:cats[1]._id, stock:30, active:true },
      { name:'نوشابه',     desc:'نوشابه گازدار', icon:'🥤', price:50,  catId:cats[2]._id, stock:100,active:true },
      { name:'دوغ',        desc:'دوغ محلی',       icon:'🥛', price:40,  catId:cats[2]._id, stock:80, active:true },
      { name:'فرنی',       desc:'دیزرت سنتی',    icon:'🍮', price:80,  catId:cats[3]._id, stock:25, active:true },
    ]);

    await Table.insertMany(Array.from({length:10},(_,i)=>({ num:i+1, cap:i%3===0?6:4 })));

    await InventoryCategory.insertMany(['مواد اولیه','گوشت','نوشیدنی','لبنیات'].map(name=>({name})));
    await InventoryItem.insertMany([
      { name:'برنج',        category:'مواد اولیه', qty:100, unit:'کیلو', minQty:20, costPerUnit:80  },
      { name:'گوشت گاو',   category:'گوشت',       qty:50,  unit:'کیلو', minQty:10, costPerUnit:350 },
      { name:'نوشابه (بطری)',category:'نوشیدنی',  qty:200, unit:'عدد',  minQty:30, costPerUnit:25  },
      { name:'شیر',         category:'لبنیات',    qty:40,  unit:'لیتر', minQty:10, costPerUnit:60  },
    ]);

    await ExpenseItem.insertMany(
      ['اجاره','برق','آب','گاز','حقوق','خرید مواد','تجهیزات','تعمیرات','تبلیغات','سایر'].map(name=>({name}))
    );

    await Settings.create({
      restaurantName:'رستورانت کابل', phone:'0700000000',
      address:'کابل، افغانستان', currency:'AFN',
      taxRate:0, serviceCharge:0,
      currentDay: new Date().toISOString().slice(0,10),
      dayOpen:true, dayId:1, logo:'',
    });

    res.json({ message:'✅ Seed complete! Login: admin / 1234' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
