require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Floor = require('./models/Floor');
const Table = require('./models/Table');
const Session = require('./models/Session');
const Order = require('./models/Order');

async function seedData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Floor.deleteMany({}),
      Table.deleteMany({}),
      Session.deleteMany({}),
      Order.deleteMany({})
    ]);

    console.log('👤 Seeding Admin User...');
    const admin = new User({
      name: 'Admin Manager',
      email: 'admin@cafe.com',
      password: 'password', // will be hashed by pre-save hook
      role: 'admin'
    });
    
    const staff = new User({
      name: 'Cafe Staff',
      email: 'staff@cafe.com',
      password: 'password',
      role: 'staff'
    });

    const customer = new User({
      name: 'Guest Customer',
      email: 'customer@cafe.com',
      password: 'password',
      role: 'customer'
    });
    
    await Promise.all([admin.save(), staff.save(), customer.save()]);

    console.log('🏢 Seeding Floors and Tables...');
    const mainFloor = new Floor({ name: 'Main Floor' });
    const patio = new Floor({ name: 'Outdoor Patio' });
    await Promise.all([mainFloor.save(), patio.save()]);

    const tables = [];
    // Main Floor Tables
    for (let i = 1; i <= 8; i++) {
      tables.push({
        number: `M${i}`,
        floorId: mainFloor._id,
        seats: i % 2 === 0 ? 4 : 2,
        status: i === 1 ? 'Occupied' : 'Available'
      });
    }
    // Patio Tables
    for (let i = 1; i <= 4; i++) {
      tables.push({
        number: `P${i}`,
        floorId: patio._id,
        seats: 4,
        status: 'Available'
      });
    }
    const createdTables = await Table.insertMany(tables);

    console.log('☕ Seeding Products...');
    const products = [
      {
        name: 'Espresso', category: 'Coffee', price: 80, tax: 5, description: 'Rich, full-bodied espresso shot.',
        image: '/uploads/products/espresso.png',
        variants: [{ name: 'Single', extraPrice: 0 }, { name: 'Double', extraPrice: 40 }]
      },
      {
        name: 'Cappuccino', category: 'Coffee', price: 130, tax: 5, description: 'Espresso topped with steamed milk foam.',
        image: '/uploads/products/cappuccino.png',
        variants: [{ name: 'Small', extraPrice: 0 }, { name: 'Large', extraPrice: 50 }, { name: 'Oat Milk', extraPrice: 30 }]
      },
      {
        name: 'Caramel Macchiato', category: 'Coffee', price: 160, tax: 5, description: 'Vanilla syrup, espresso, and steamed milk with caramel drizzle.',
        image: '/uploads/products/caramel_macchiato.png',
        variants: [{ name: 'Regular', extraPrice: 0 }, { name: 'Large', extraPrice: 60 }]
      },
      {
        name: 'Cold Brew', category: 'Coffee', price: 140, tax: 5, description: 'Slow-steeped cold brew over ice.',
        image: '/uploads/products/cold_brew.png',
        variants: [{ name: 'Medium', extraPrice: 0 }, { name: 'Large', extraPrice: 40 }]
      },
      {
        name: 'Butter Croissant', category: 'Pastry', price: 120, tax: 5, description: 'Flaky, buttery French pastry.',
        image: '/uploads/products/butter_croissant.png',
        variants: []
      },
      {
        name: 'Blueberry Muffin', category: 'Pastry', price: 100, tax: 5, description: 'Freshly baked with wild blueberries.',
        image: '/uploads/products/blueberry_muffin.png',
        variants: []
      },
      {
        name: 'Avocado Toast', category: 'Mains', price: 280, tax: 8, description: 'Smashed avocado on sourdough with chili flakes and poached egg.',
        image: '',
        variants: [{ name: 'Add Bacon', extraPrice: 80 }, { name: 'Add Salmon', extraPrice: 120 }]
      },
      {
        name: 'Club Sandwich', category: 'Mains', price: 320, tax: 8, description: 'Classic club with turkey, bacon, lettuce, and tomato.',
        image: '',
        variants: [{ name: 'With Fries', extraPrice: 80 }, { name: 'With Salad', extraPrice: 60 }]
      },
      {
        name: 'Caesar Salad', category: 'Mains', price: 260, tax: 8, description: 'Crisp romaine, parmesan, croutons, and Caesar dressing.',
        image: '',
        variants: [{ name: 'Add Chicken', extraPrice: 100 }]
      },
      {
        name: 'Fresh Orange Juice', category: 'Drinks', price: 110, tax: 5, description: 'Freshly squeezed oranges.',
        image: '',
        variants: [{ name: 'Small', extraPrice: 0 }, { name: 'Large', extraPrice: 50 }]
      },
      {
        name: 'Green Smoothie', category: 'Drinks', price: 180, tax: 5, description: 'Spinach, kale, apple, and ginger blend.',
        image: '',
        variants: []
      },
      {
        name: 'Masala Chai', category: 'Coffee', price: 60, tax: 5, description: 'Traditional spiced Indian tea with milk.',
        image: '',
        variants: [{ name: 'Regular', extraPrice: 0 }, { name: 'Extra Strong', extraPrice: 20 }]
      },
      {
        name: 'Paneer Tikka Wrap', category: 'Mains', price: 220, tax: 8, description: 'Grilled paneer tikka in a soft tortilla wrap.',
        image: '',
        variants: [{ name: 'With Fries', extraPrice: 70 }]
      }
    ];
    const createdProducts = await Product.insertMany(products);

    console.log('📝 Seeding Initial Session & Orders (Simulated past data)...');
    const session = new Session({
      terminalId: 'TERM-01',
      staffId: admin._id,
      openingBalance: 150,
      status: 'Open'
    });
    await session.save();

    // Create one open order on Table M1 to make Floor/Kitchen interactive
    const order1 = new Order({
      orderNumber: `ORD-${Date.now() - 1000000}`,
      tableId: createdTables[0]._id, // M1
      items: [
        { productId: createdProducts[1]._id, name: createdProducts[1].name, price: 4.00, quantity: 2, variant: 'Large', kitchenStatus: 'To Cook' },
        { productId: createdProducts[4]._id, name: createdProducts[4].name, price: 3.50, quantity: 1, kitchenStatus: 'Completed' }
      ],
      totalAmount: 11.50, // (4+1.5)*2 + 3.5
      status: 'Open',
      type: 'Dine-in',
      sessionId: session._id
    });
    await order1.save();
    
    // Create one paid historic order
    const order2 = new Order({
      orderNumber: `ORD-${Date.now() - 86400000}`, // yesterday
      items: [
        { productId: createdProducts[0]._id, name: createdProducts[0].name, price: 2.50, quantity: 1, kitchenStatus: 'Completed' }
      ],
      totalAmount: 2.50,
      paymentStatus: 'Paid',
      paymentMethod: 'Digital',
      status: 'Completed',
      type: 'Self-order',
      sessionId: session._id
    });
    await order2.save();

    console.log('🎉 Data Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
