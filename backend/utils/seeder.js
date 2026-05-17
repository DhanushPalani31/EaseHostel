/**
 * Database Seeder – populates HostelEase with realistic seed data.
 * Run: node utils/seeder.js
 * Run: node utils/seeder.js --destroy   (to wipe data)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { Coupon } from '../models/secondary.models.js';

dotenv.config();

const USERS = [
  {
    name: 'Admin User', email: 'admin@hostelease.com', password: 'admin123',
    role: 'admin', phoneNumber: '9000000001'
  },
  {
    name: 'Arjun Sharma',    email: 'arjun@hostelease.com',  password: 'student123',
    role: 'student', hostelBlock: 'A', roomNumber: '101', phoneNumber: '9876543210'
  },
  {
    name: 'Priya Patel',     email: 'priya@hostelease.com',  password: 'student123',
    role: 'student', hostelBlock: 'B', roomNumber: '205', phoneNumber: '9876543211'
  },
  {
    name: 'Rahul Verma',     email: 'rahul@hostelease.com',  password: 'student123',
    role: 'student', hostelBlock: 'C', roomNumber: '310', phoneNumber: '9876543212'
  }
];

const PRODUCTS = [
  // ── Snacks ──────────────────────────────────────
  { productName: 'Lay\'s Classic Salted Chips', category: 'Snacks', price: 20, originalPrice: 25, stock: 150, unit: 'pack', brand: 'Lay\'s', tags: ['chips', 'potato', 'salty'], isTrending: true, totalSold: 340 },
  { productName: 'Kurkure Masala Munch',        category: 'Snacks', price: 20, originalPrice: 25, stock: 120, unit: 'pack', brand: 'Kurkure', tags: ['spicy', 'chips'], totalSold: 280 },
  { productName: 'Parle-G Biscuits',            category: 'Snacks', price: 10, stock: 200, unit: 'pack', brand: 'Parle', tags: ['biscuit', 'glucose'], totalSold: 420 },
  { productName: 'Oreo Cookies (Original)',      category: 'Snacks', price: 30, originalPrice: 35, stock: 80, unit: 'pack', brand: 'Oreo', tags: ['cookies', 'chocolate'], totalSold: 190 },
  { productName: 'Pringles Sour Cream & Onion', category: 'Snacks', price: 99, originalPrice: 115, stock: 60, unit: 'pack', brand: 'Pringles', tags: ['chips', 'premium'], isFeatured: true, totalSold: 90 },
  { productName: 'Dark Fantasy Chocolate',       category: 'Snacks', price: 40, stock: 100, unit: 'pack', brand: 'Sunfeast', tags: ['chocolate', 'biscuit'], totalSold: 155 },

  // ── Drinks ──────────────────────────────────────
  { productName: 'Bisleri Water 1L',             category: 'Drinks', price: 20, stock: 300, unit: 'bottle', brand: 'Bisleri', tags: ['water', 'mineral'], totalSold: 600 },
  { productName: 'Red Bull Energy Drink',        category: 'Drinks', price: 125, originalPrice: 140, stock: 50, unit: 'can', brand: 'Red Bull', tags: ['energy', 'caffeine'], isTrending: true, totalSold: 130 },
  { productName: 'Tropicana Orange Juice 200ml', category: 'Drinks', price: 30, stock: 80, unit: 'pack', brand: 'Tropicana', tags: ['juice', 'vitamin c'], totalSold: 210 },
  { productName: 'Coca-Cola 500ml',              category: 'Drinks', price: 40, stock: 100, unit: 'bottle', brand: 'Coca-Cola', tags: ['cola', 'carbonated'], totalSold: 260 },
  { productName: 'Horlicks Classic Malt Sachet', category: 'Drinks', price: 15, stock: 150, unit: 'sachet', brand: 'Horlicks', tags: ['health', 'malt', 'hot drink'], totalSold: 180 },

  // ── Instant Foods ────────────────────────────────
  { productName: 'Maggi 2-Min Masala Noodles',   category: 'Instant Foods', price: 14, stock: 200, unit: 'pack', brand: 'Nestle', tags: ['noodles', 'instant', 'masala'], isTrending: true, isFeatured: true, totalSold: 580 },
  { productName: 'Yippee Mood Masala Noodles',   category: 'Instant Foods', price: 12, stock: 180, unit: 'pack', brand: 'Yippee', tags: ['noodles', 'instant'], totalSold: 350 },
  { productName: 'Top Ramen Curry Noodles',       category: 'Instant Foods', price: 12, stock: 160, unit: 'pack', brand: 'Top Ramen', tags: ['noodles', 'curry'], totalSold: 290 },
  { productName: 'Knorr Cup-a-Soup Tomato',       category: 'Instant Foods', price: 25, stock: 90, unit: 'pack', brand: 'Knorr', tags: ['soup', 'tomato', 'hot drink'], totalSold: 120 },
  { productName: 'MTR Poha Mix',                  category: 'Instant Foods', price: 45, stock: 70, unit: 'pack', brand: 'MTR', tags: ['breakfast', 'poha', 'healthy'], totalSold: 95 },

  // ── Stationery ───────────────────────────────────
  { productName: 'Classmate Spiral Notebook 200pg', category: 'Stationery', price: 80, stock: 120, unit: 'piece', brand: 'Classmate', tags: ['notebook', 'spiral', 'writing'], totalSold: 145 },
  { productName: 'Reynolds 045 Ball Pen (Pack of 5)', category: 'Stationery', price: 40, stock: 200, unit: 'pack', brand: 'Reynolds', tags: ['pen', 'ball pen', 'writing'], totalSold: 320 },
  { productName: 'Staedtler Pencil Set (12pcs)',   category: 'Stationery', price: 60, stock: 80, unit: 'pack', brand: 'Staedtler', tags: ['pencil', 'drawing'], totalSold: 88 },
  { productName: 'Camlin Geometry Box',            category: 'Stationery', price: 75, originalPrice: 90, stock: 50, unit: 'piece', brand: 'Camlin', tags: ['geometry', 'maths', 'compass'], totalSold: 65 },
  { productName: 'Fevicol Glue Stick 35g',         category: 'Stationery', price: 30, stock: 100, unit: 'piece', brand: 'Fevicol', tags: ['glue', 'craft'], totalSold: 78 },
  { productName: 'Highlighter Set (5 colours)',    category: 'Stationery', price: 120, originalPrice: 150, stock: 60, unit: 'pack', brand: 'Faber-Castell', tags: ['highlighter', 'study'], isFeatured: true, totalSold: 112 },

  // ── Toiletries ───────────────────────────────────
  { productName: 'Colgate Strong Teeth Toothpaste 200g', category: 'Toiletries', price: 65, stock: 100, unit: 'tube', brand: 'Colgate', tags: ['toothpaste', 'dental'], totalSold: 230 },
  { productName: 'Dove Soap (Pack of 4)',           category: 'Toiletries', price: 160, originalPrice: 180, stock: 80, unit: 'pack', brand: 'Dove', tags: ['soap', 'bath', 'moisturising'], totalSold: 145 },
  { productName: 'Head & Shoulders Shampoo 180ml', category: 'Toiletries', price: 165, stock: 70, unit: 'bottle', brand: 'H&S', tags: ['shampoo', 'dandruff'], totalSold: 120 },
  { productName: 'Vaseline Petroleum Jelly 100ml', category: 'Toiletries', price: 80, stock: 90, unit: 'jar', brand: 'Vaseline', tags: ['moisturiser', 'skin'], totalSold: 95 },
  { productName: 'Dettol Handwash Refill 750ml',   category: 'Toiletries', price: 180, originalPrice: 210, stock: 60, unit: 'bottle', brand: 'Dettol', tags: ['hygiene', 'handwash'], totalSold: 88 },

  // ── Personal Care ────────────────────────────────
  { productName: 'Gillette Mach3 Razor',           category: 'Personal Care', price: 220, originalPrice: 260, stock: 40, unit: 'piece', brand: 'Gillette', tags: ['shaving', 'razor'], isFeatured: true, totalSold: 75 },
  { productName: 'Wild Stone Body Deodorant 150ml', category: 'Personal Care', price: 195, originalPrice: 220, stock: 60, unit: 'can', brand: 'Wild Stone', tags: ['deodorant', 'freshness'], isTrending: true, totalSold: 140 },
  { productName: 'Park Avenue Cologne 150ml',       category: 'Personal Care', price: 175, stock: 45, unit: 'can', brand: 'Park Avenue', tags: ['cologne', 'fragrance'], totalSold: 65 },
  { productName: 'Nivea Men Face Wash 100ml',       category: 'Personal Care', price: 135, originalPrice: 160, stock: 55, unit: 'tube', brand: 'Nivea', tags: ['face wash', 'skincare'], totalSold: 95 },

  // ── Daily Essentials ─────────────────────────────
  { productName: 'Surf Excel Detergent 500g',      category: 'Daily Essentials', price: 85, stock: 90, unit: 'pack', brand: 'Surf Excel', tags: ['laundry', 'detergent', 'cleaning'], totalSold: 165 },
  { productName: 'Harpic Bathroom Cleaner 500ml',  category: 'Daily Essentials', price: 95, stock: 50, unit: 'bottle', brand: 'Harpic', tags: ['cleaner', 'bathroom', 'hygiene'], totalSold: 78 },
  { productName: 'Colin Glass Cleaner 500ml',      category: 'Daily Essentials', price: 80, stock: 55, unit: 'bottle', brand: 'Colin', tags: ['glass', 'cleaner'], totalSold: 55 },
  { productName: 'Odomos Mosquito Repellent Cream', category: 'Daily Essentials', price: 70, originalPrice: 85, stock: 80, unit: 'tube', brand: 'Odomos', tags: ['mosquito', 'repellent', 'safety'], totalSold: 145 },
  { productName: 'Disprin Tablets (10pcs)',         category: 'Daily Essentials', price: 25, stock: 150, unit: 'strip', brand: 'Disprin', tags: ['medicine', 'headache', 'pain relief'], totalSold: 190 },
  { productName: 'Band-Aid Bandages (10pcs)',       category: 'Daily Essentials', price: 35, stock: 120, unit: 'pack', brand: 'Band-Aid', tags: ['first aid', 'bandage'], totalSold: 75 }
];

const COUPONS = [
  {
    code:               'WELCOME20',
    discountPercentage: 20,
    maxDiscountAmount:  50,
    minOrderAmount:     100,
    expiryDate:         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usageLimit:         500,
    description:        'Welcome offer – 20% off on your first order'
  },
  {
    code:               'HOSTEL10',
    discountPercentage: 10,
    maxDiscountAmount:  30,
    minOrderAmount:     50,
    expiryDate:         new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit:         1000,
    description:        '10% off for all hostel students'
  },
  {
    code:               'STUDY5',
    discountPercentage: 5,
    minOrderAmount:     0,
    expiryDate:         new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit:         2000,
    description:        'Stationery special discount'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    if (process.argv[2] === '--destroy') {
      await Promise.all([User.deleteMany(), Product.deleteMany(), Coupon.deleteMany()]);
      console.log('🗑️  All data wiped');
      process.exit(0);
    }

    // Clear existing
    await Promise.all([User.deleteMany(), Product.deleteMany(), Coupon.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Hash passwords and create users
    const usersWithHash = await Promise.all(
      USERS.map(async u => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
    );
    await User.insertMany(usersWithHash);
    console.log(`👥 Created ${USERS.length} users`);

    // Create products (isAvailable defaults to true)
    await Product.insertMany(PRODUCTS.map(p => ({ ...p, isAvailable: true })));
    console.log(`📦 Created ${PRODUCTS.length} products`);

    // Create coupons
    await Coupon.insertMany(COUPONS.map(c => ({ ...c, isActive: true })));
    console.log(`🏷️  Created ${COUPONS.length} coupons`);

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin:   admin@hostelease.com  / admin123');
    console.log('   Student: arjun@hostelease.com  / student123');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
};

seed();
