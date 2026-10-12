import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['breakfast', 'lunch', 'snacks', 'drinks'],
      lowercase: true,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/300x200?text=Food+Item',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 10,
      min: [0, 'Preparation time cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
menuItemSchema.index({ category: 1, isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
