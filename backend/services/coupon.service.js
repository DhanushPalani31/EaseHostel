import { Coupon } from '../models/secondary.models.js';

class CouponService {
  async createCoupon(data) {
    return await Coupon.create({ ...data, code: data.code.toUpperCase() });
  }

  async getAllCoupons() {
    return await Coupon.find().sort({ createdAt: -1 }).lean({ virtuals: true });
  }

  async validateCoupon(code, orderAmount) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      const err = new Error('Coupon not found or inactive'); err.statusCode = 404; throw err;
    }
    if (new Date() > coupon.expiryDate) {
      const err = new Error('This coupon has expired'); err.statusCode = 400; throw err;
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      const err = new Error('Coupon usage limit reached'); err.statusCode = 400; throw err;
    }
    if (orderAmount < coupon.minOrderAmount) {
      const err = new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`); err.statusCode = 400; throw err;
    }

    let discount = Math.round((orderAmount * coupon.discountPercentage) / 100);
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

    return { discount, discountPercentage: coupon.discountPercentage, code: coupon.code };
  }

  async toggleCoupon(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      const err = new Error('Coupon not found'); err.statusCode = 404; throw err;
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      const err = new Error('Coupon not found'); err.statusCode = 404; throw err;
    }
  }
}

export default new CouponService();
