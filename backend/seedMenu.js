import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'snacks', 'drinks'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  preparationTime: {
    type: Number,
    default: 15,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const sampleMenuItems = [
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 5.99,
    category: 'lunch',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
    preparationTime: 15,
  },
  {
    name: 'Chicken Sandwich',
    description: 'Grilled chicken breast with mayo and fresh vegetables',
    price: 4.99,
    category: 'lunch',
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    isAvailable: true,
    preparationTime: 12,
  },
  {
    name: 'Vegetable Pizza',
    description: 'Fresh vegetables on crispy crust with melted cheese',
    price: 6.99,
    category: 'lunch',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    isAvailable: true,
    preparationTime: 20,
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with a pinch of salt',
    price: 2.49,
    category: 'snacks',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    isAvailable: true,
    preparationTime: 8,
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked cookies with chocolate chips',
    price: 1.99,
    category: 'snacks',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    isAvailable: true,
    preparationTime: 5,
  },
  {
    name: 'Coffee',
    description: 'Hot freshly brewed coffee',
    price: 2.99,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    isAvailable: true,
    preparationTime: 3,
  },
  {
    name: 'Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 3.49,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    isAvailable: true,
    preparationTime: 3,
  },
  {
    name: 'Soda',
    description: 'Chilled carbonated soft drink',
    price: 1.49,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    isAvailable: true,
    preparationTime: 2,
  },
  {
    name: 'Pancakes',
    description: 'Fluffy pancakes with maple syrup',
    price: 4.49,
    category: 'breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    isAvailable: true,
    preparationTime: 10,
  },
  {
    name: 'Eggs & Toast',
    description: 'Two eggs with buttered toast',
    price: 3.99,
    category: 'breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    isAvailable: true,
    preparationTime: 8,
  },
];

async function seedMenu() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if menu items already exist
    const existingItems = await MenuItem.countDocuments();
    if (existingItems > 0) {
      console.log(`⚠️  ${existingItems} menu items already exist`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log('Do you want to clear existing items and add sample data? (yes/no)');
      // For now, just skip if items exist
      console.log('Skipping seed. Delete existing items manually if needed.');
      process.exit(0);
    }

    // Create menu items
    const items = await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Successfully created ${items.length} menu items!`);
    console.log('\n📋 Menu Items Added:');
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price} (${item.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedMenu();
