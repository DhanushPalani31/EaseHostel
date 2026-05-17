import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Generic email sender
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    return false;
  }
};

/**
 * Order confirmation email template
 */
export const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items
    .map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>₹${i.price}</td></tr>`)
    .join('');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed – #${order.invoiceId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#111">Hey ${user.name}, your order is confirmed! 🎉</h2>
        <p>Order ID: <strong>${order.invoiceId}</strong></p>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          ${itemsHtml}
        </table>
        <p><strong>Total: ₹${order.totalAmount}</strong></p>
        <p>Payment: ${order.paymentMethod}</p>
        <br/>
        <p>Thanks for using HostelEase!</p>
      </div>
    `
  });
};
