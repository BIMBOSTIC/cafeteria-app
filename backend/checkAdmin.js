import mongoose from 'mongoose';
import Admin from './src/models/Admin.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await Admin.findOne({ username: 'admin' }).select('+password');

    if (admin) {
      console.log('✅ Admin found!');
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Has password:', !!admin.password);
      console.log('Password length:', admin.password?.length);
    } else {
      console.log('❌ No admin found with username "admin"');

      // Check all admins
      const allAdmins = await Admin.find({});
      console.log('Total admins in database:', allAdmins.length);
      allAdmins.forEach(a => console.log('  -', a.username, a.email));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
