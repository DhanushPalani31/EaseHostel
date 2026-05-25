import User from '../models/User.js';
import Order from '../models/Order.js';
import { cloudinary } from '../config/cloudinary.js';

class UserService {
  /**
   * Get all students (admin view)
   */
  async getAllStudents() {
    return await User.find({ role: 'student' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get a single user by ID with populated wishlist
   */
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .populate('wishlist', 'productName price image category ratings isAvailable')
      .lean();

    if (!user) {
      const err = new Error('User not found'); err.statusCode = 404; throw err;
    }
    return user;
  }

  /**
   * Update profile fields (name, phone, block, room)
   */
  async updateProfile(userId, data, imageFile) {
    const updateData = { ...data };

    if (imageFile) {
      // Delete old profile image from Cloudinary if exists
      const user = await User.findById(userId).select('profileImage');
      if (user?.profileImage) {
        // Extract public_id from the URL
        const parts = user.profileImage.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const folder   = parts[parts.length - 2];
        await cloudinary.uploader.destroy(`${folder}/${filename}`).catch(() => {});
      }
      updateData.profileImage = imageFile.path;
    }

    return await User.findByIdAndUpdate(userId, updateData, {
      new: true, runValidators: true
    }).select('-password -refreshToken');
  }

  /**
   * Toggle user active status (admin)
   */
  async toggleStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found'); err.statusCode = 404; throw err;
    }
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  /**
   * Add/remove product from wishlist
   */
  async toggleWishlist(userId, productId) {
    const user = await User.findById(userId);
    const idx  = user.wishlist.findIndex(id => id.toString() === productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    return { wishlist: user.wishlist, added: idx === -1 };
  }
}

export default new UserService();
