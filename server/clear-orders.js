require('dotenv').config();
const mongoose = require('mongoose');

// Order schema (minimal, just for deletion)
const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

async function clearOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Removing all orders from database...');
    const result = await Order.deleteMany({});
    
    console.log(`✅ Successfully removed ${result.deletedCount} orders from database`);
    console.log('🎉 Database cleared!');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error clearing orders:', error.message);
    process.exit(1);
  }
}

clearOrders();
