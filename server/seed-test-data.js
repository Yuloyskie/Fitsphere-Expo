require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: Number,
    discount: Number,
    total: Number,
    shippingInfo: mongoose.Schema.Types.Mixed,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    promoCode: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

const testOrders = [
  {
    userId: 'user1',
    items: [
      {
        productId: 'prod1',
        name: 'Dumbbell Set 20kg',
        price: 85.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      },
      {
        productId: 'prod2',
        name: 'Yoga Mat',
        price: 29.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      },
    ],
    subtotal: 145.97,
    discount: 10,
    total: 131.37,
    shippingInfo: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'completed',
    status: 'delivered',
    trackingNumber: 'FS1234567890',
  },
  {
    userId: 'user2',
    items: [
      {
        productId: 'prod3',
        name: 'Resistance Bands',
        price: 24.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      },
    ],
    subtotal: 24.99,
    discount: 0,
    total: 24.99,
    shippingInfo: {
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
    paymentMethod: 'PayPal',
    paymentStatus: 'completed',
    status: 'shipped',
    trackingNumber: 'FS9876543210',
  },
  {
    userId: 'user3',
    items: [
      {
        productId: 'prod4',
        name: 'Exercise Bike',
        price: 399.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      },
    ],
    subtotal: 399.99,
    discount: 50,
    total: 349.99,
    shippingInfo: {
      address: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'pending',
    status: 'processing',
    trackingNumber: 'FS5555555555',
  },
  {
    userId: 'user1',
    items: [
      {
        productId: 'prod5',
        name: 'Running Shoes',
        price: 129.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      },
    ],
    subtotal: 129.99,
    discount: 0,
    total: 129.99,
    shippingInfo: {
      address: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
    },
    paymentMethod: 'Debit Card',
    paymentStatus: 'completed',
    status: 'pending',
    trackingNumber: 'FS1111111111',
  },
  {
    userId: 'user2',
    items: [
      {
        productId: 'prod6',
        name: 'Fitness Tracker',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1575311373937-040b3ff6e56b?w=400',
      },
      {
        productId: 'prod7',
        name: 'Water Bottle',
        price: 19.99,
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1589922582270-1b1df989a332?w=400',
      },
    ],
    subtotal: 259.96,
    discount: 25,
    total: 234.96,
    shippingInfo: {
      address: '654 Birch Ln',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
    },
    paymentMethod: 'Apple Pay',
    paymentStatus: 'completed',
    status: 'delivered',
    trackingNumber: 'FS2222222222',
  },
];

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Insert test orders
    const result = await Order.insertMany(testOrders);
    console.log(`✅ Successfully inserted ${result.length} test orders`);

    result.forEach((order, index) => {
      console.log(`  Order ${index + 1}: ${order._id} (Status: ${order.status}, Total: $${order.total})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database seeding complete! Connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seedData();
