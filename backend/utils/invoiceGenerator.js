/**
 * Invoice generator – creates a downloadable HTML invoice for an order.
 * In production this can be extended to generate PDFs via puppeteer.
 */
export const generateInvoiceHTML = (order, user) => {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede9;">${item.productName}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede9;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede9;text-align:right;">₹${item.price.toFixed(2)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede9;text-align:right;font-weight:600;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice – ${order.invoiceId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; color: #161210; background: #faf9f7; padding: 40px; }
    .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #e8e4df; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .logo { font-size: 20px; font-weight: 700; color: #161210; }
    .logo span { color: #d4952a; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; font-weight: 700; color: #161210; }
    .invoice-meta p { color: #8f8278; font-size: 13px; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e8e4df; margin: 24px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8f8278; font-weight: 600; margin-bottom: 8px; }
    .section-value { font-size: 14px; color: #161210; line-height: 1.6; }
    .section-value strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; padding: 8px 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #8f8278; font-weight: 600; border-bottom: 2px solid #e8e4df; }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { margin-top: 24px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 14px; color: #574e47; padding: 6px 0; }
    .totals-row.total { font-size: 18px; font-weight: 700; color: #161210; border-top: 2px solid #e8e4df; margin-top: 8px; padding-top: 12px; }
    .footer { text-align: center; margin-top: 40px; color: #8f8278; font-size: 12px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 8px;
      background: ${order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7'};
      color: ${order.paymentStatus === 'Paid' ? '#16a34a' : '#b45309'};
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">Hostel<span>Ease</span></div>
        <p style="color:#8f8278;font-size:12px;margin-top:4px;">Hostel Essentials Ordering</p>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p>#${order.invoiceId}</p>
        <p>${date}</p>
      </div>
    </div>

    <hr class="divider" />

    <!-- Bill to / Order info -->
    <div class="grid">
      <div>
        <p class="section-label">Bill To</p>
        <div class="section-value">
          <strong>${user.name}</strong><br/>
          ${user.email}<br/>
          ${user.phoneNumber || ''}<br/>
          ${order.deliveryAddress?.block ? `Block ${order.deliveryAddress.block}, Room ${order.deliveryAddress.roomNumber}` : ''}
        </div>
      </div>
      <div>
        <p class="section-label">Order Details</p>
        <div class="section-value">
          <strong>Invoice:</strong> #${order.invoiceId}<br/>
          <strong>Date:</strong> ${date}<br/>
          <strong>Payment:</strong> ${order.paymentMethod}<br/>
          <span class="status-badge">${order.paymentStatus}</span>
        </div>
      </div>
    </div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
      </div>
      ${order.discountAmount > 0 ? `
      <div class="totals-row">
        <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}</span>
        <span style="color:#16a34a">–₹${order.discountAmount.toFixed(2)}</span>
      </div>` : ''}
      <div class="totals-row">
        <span>Delivery</span>
        <span style="color:#16a34a">Free</span>
      </div>
      <div class="totals-row total">
        <span>Total</span>
        <span>₹${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>

    <hr class="divider" />

    <div class="footer">
      <p>Thank you for using HostelEase! 🎓</p>
      <p style="margin-top:4px;">Questions? Contact your hostel admin or email support@hostelease.com</p>
    </div>
  </div>
</body>
</html>`;
};
