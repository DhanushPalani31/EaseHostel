/**
 * V2 Seeder – adds delivery staff and sample custom orders to existing data.
 * Run: node utils/seedV2.js
 *
 * Does NOT wipe existing data — safe to run on top of V1 seed.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import DeliveryStaff from '../models/DeliveryStaff.js';
import CustomOrder   from '../models/CustomOrder.js';
import User          from '../models/User.js';
import { logger }    from './logger.js';

const DELIVERY_STAFF = [
  {
    name:        'Rajan Kumar',
    phone:       '9100000001',
    email:       'rajan@hostelease.com',
    hostelZone:  'A,B',
    isActive:    true,
    isAvailable: true,
    maxConcurrentDeliveries: 5,
    totalDeliveries:   42,
    completedDeliveries: 40,
    rating: 4.8
  },
  {
    name:        'Suresh Babu',
    phone:       '9100000002',
    email:       'suresh@hostelease.com',
    hostelZone:  'C,D',
    isActive:    true,
    isAvailable: true,
    maxConcurrentDeliveries: 5,
    totalDeliveries:   28,
    completedDeliveries: 27,
    rating: 4.6
  },
  {
    name:        'Muthu Raj',
    phone:       '9100000003',
    email:       'muthu@hostelease.com',
    hostelZone:  'All',
    isActive:    true,
    isAvailable: false,  // busy
    maxConcurrentDeliveries: 8,
    totalDeliveries:   65,
    completedDeliveries: 63,
    rating: 4.9
  }
];

const seedV2 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ Connected to MongoDB for V2 seed');

    // Seed delivery staff
    await DeliveryStaff.deleteMany({});
    await DeliveryStaff.insertMany(DELIVERY_STAFF);
    logger.info(`🚚 Created ${DELIVERY_STAFF.length} delivery staff`);

    // Seed sample custom orders (attached to first student)
    const student = await User.findOne({ role: 'student' }).lean();
    if (student) {
      await CustomOrder.deleteMany({});
      await CustomOrder.insertMany([
        {
          user:        student._id,
          productName: 'Maggi Family Pack (12 units)',
          brandName:   'Nestle',
          category:    'Instant Foods',
          quantity:    1,
          priority:    'high',
          notes:       'Need by tomorrow evening for group study session',
          orderType:   'internal',
          status:      'Approved',
          adminNote:   'Found on Amazon ₹240. Will deliver tomorrow.',
          finalPrice:  240,
          estimatedBudget: { min: 200, max: 300 },
          statusHistory: [
            { status: 'Pending',   note: 'Request submitted' },
            { status: 'Reviewing', note: 'Admin reviewing' },
            { status: 'Approved',  note: 'Found on Amazon ₹240. Will deliver tomorrow.' }
          ],
          deliveryAddress: { block: student.hostelBlock, roomNumber: student.roomNumber }
        },
        {
          user:        student._id,
          productName: 'Nike Dri-FIT Sports Socks',
          brandName:   'Nike',
          category:    'Clothing',
          quantity:    3,
          priority:    'medium',
          notes:       'Size 8 UK, white colour preferred',
          orderType:   'internal',
          status:      'Pending',
          estimatedBudget: { min: 300, max: 600 },
          statusHistory: [{ status: 'Pending', note: 'Request submitted' }],
          deliveryAddress: { block: student.hostelBlock, roomNumber: student.roomNumber }
        }
      ]);
      logger.info('📦 Created sample custom orders');
    }

    logger.info('\n🎉 V2 Seed complete!');
    logger.info('   Delivery Staff: Rajan Kumar, Suresh Babu, Muthu Raj');
    logger.info('   Sample custom orders created for student');
    process.exit(0);

  } catch (err) {
    logger.error(`❌ V2 Seeder error: ${err.message}`);
    process.exit(1);
  }
};

seedV2();
