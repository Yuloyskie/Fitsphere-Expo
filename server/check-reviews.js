require('dotenv').config();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    comment: String,
    rating: Number,
    userName: String,
    createdAt: Date,
  },
  { timestamps: true, collection: 'reviews' }
);

const Review = mongoose.model('Review', reviewSchema);

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
  },
  { collection: 'products' }
);

const Product = mongoose.model('Product', productSchema);

async function checkReviews() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📦 Checking Products:');
    const products = await Product.find();
    products.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p._id.toString()})`);
    });

    console.log('\n💬 Checking Reviews:');
    const reviews = await Review.find();
    reviews.forEach(r => {
      console.log(`  - Rating: ${r.rating}⭐, ProductID: "${r.productId}", User: ${r.userName}, Comment: "${r.comment.substring(0, 30)}..."`);
    });

    console.log('\n🔍 Reviews per Product:');
    for (const product of products) {
      const productIdStr = product._id.toString();
      const productReviews = await Review.find({ productId: productIdStr });
      console.log(`  - ${product.name} (ID: ${productIdStr}): ${productReviews.length} reviews`);
      productReviews.forEach(r => {
        console.log(`    - ${r.rating}⭐ from ${r.userName}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkReviews();
