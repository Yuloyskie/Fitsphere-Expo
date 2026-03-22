require('dotenv').config();
const mongoose = require('mongoose');

const schemas = {};

// Define all schemas
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

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    originalPrice: Number,
    category: String,
    categoryId: String,
    image: String,
    images: [String],
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    sale: { type: Boolean, default: false },
  },
  { collection: 'products' }
);

const Review = mongoose.model('Review', reviewSchema);
const Product = mongoose.model('Product', productSchema);

const mapId = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
    _id: undefined,
  };
};

async function simulateAPIResponse() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate what GET /api/products returns (what HomeScreen receives)
    console.log('📡 Simulating GET /api/products response:\n');
    const products = await Product.find().sort({ createdAt: -1 });
    
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ productId: product._id.toString() });
        return {
          ...mapId(product),
          reviews: reviews.map(mapId),
          reviewCount: reviews.length
        };
      })
    );
    
    console.log('Products returned to HomeScreen:');
    productsWithReviews.forEach((p, idx) => {
      console.log(`\n${idx + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Reviews: ${p.reviews.length}`);
      console.log(`   Rating: ${p.rating}⭐`);
      p.reviews.forEach(r => {
        console.log(`    - ${r.rating}⭐ from ${r.userName}: "${r.comment?.substring(0, 40)}..."`);
      });
    });

    // Now simulate clicking on each product and getting its details
    console.log('\n\n📡 Simulating GET /api/products/:id for each product:\n');
    
    for (const product of products) {
      const productId = product._id.toString();
      console.log(`\nFetching GET /api/products/${productId} (${product.name}):`);
      
      const details = await Product.findById(productId);
      if (!details) {
        console.log('  ❌ Product not found!');
        continue;
      }
      
      const reviews = await Review.find({ productId: productId });
      console.log(`  Found ${reviews.length} reviews`);
      reviews.forEach(r => {
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

simulateAPIResponse();
