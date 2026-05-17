import { Cart } from '../models/secondary.models.js';
import Product from '../models/Product.js';

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'productName price image stock isAvailable')
      .lean();

    if (!cart) cart = { user: userId, items: [], totalPrice: 0 };
    return cart;
  }

  async addToCart(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      const err = new Error('Product not available'); err.statusCode = 400; throw err;
    }
    if (product.stock < quantity) {
      const err = new Error('Insufficient stock'); err.statusCode = 400; throw err;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        product:     product._id,
        productName: product.productName,
        image:       product.image,
        price:       product.price,
        quantity
      });
    }

    cart.recalcTotal();
    await cart.save();
    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) { const err = new Error('Cart not found'); err.statusCode = 404; throw err; }

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx < 0) { const err = new Error('Item not in cart'); err.statusCode = 404; throw err; }

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    cart.recalcTotal();
    await cart.save();
    return cart;
  }

  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) { const err = new Error('Cart not found'); err.statusCode = 404; throw err; }

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    cart.recalcTotal();
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0 });
  }
}

export default new CartService();
