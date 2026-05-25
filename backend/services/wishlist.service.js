import User from '../models/User.js';

class WishlistService {
  async getWishlist(userId) {
    const user = await User.findById(userId)
      .populate('wishlist', 'productName price image category ratings isAvailable stock')
      .lean();

    return user?.wishlist || [];
  }

  async toggle(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found'); err.statusCode = 404; throw err;
    }

    const idx = user.wishlist.findIndex(id => id.toString() === productId);
    let added;

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    return { wishlist: user.wishlist, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' };
  }
}

export default new WishlistService();
