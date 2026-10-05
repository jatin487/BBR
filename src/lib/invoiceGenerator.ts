export interface InvoiceBookingData {
  id: string;
  vehicleName: string;
  category?: string;
  pickupHub?: string;
  dropHub?: string;
  pickupAddress?: string;
  dropAddress?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rateType?: string;
  duration?: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  dlNumber?: string;
  type?: 'bike' | 'taxi';
}

export function generateInvoiceHtml(booking: InvoiceBookingData): string {
  const invoiceDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

  const pickupLocation = booking.pickupHub || booking.pickupAddress || 'Bhauwala Main Hub, Dehradun';
  const dropLocation = booking.dropHub || booking.dropAddress || 'Bhauwala Main Hub, Dehradun';
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(pickupLocation + ', Dehradun, Uttarakhand')}`;

  const durationStr = booking.type === 'taxi'
    ? 'Single Outstation Trip'
    : `${booking.duration || 1} day(s) / 24-hr rental`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BBR Rental Tax Invoice - ${booking.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 30px 20px;
    }
    .invoice-card {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-tag {
      text-align: right;
    }
    .invoice-id {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .badge-deposit {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      background: #dcfce7;
      color: #166534;
      font-size: 11px;
      font-weight: 800;
      border-radius: 9999px;
      border: 1px solid #bbf7d0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 16px;
      border-radius: 14px;
    }
    .info-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .info-row {
      font-size: 13px;
      margin-bottom: 4px;
      color: #1e293b;
    }
    .info-row strong {
      color: #0f172a;
    }
    .table-container {
      margin-bottom: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 12px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .total-box {
      margin-left: auto;
      width: 280px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      color: #64748b;
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      margin-bottom: 0;
    }
    .footer {
      border-top: 2px solid #f1f5f9;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .maps-btn {
      display: inline-block;
      padding: 8px 14px;
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12px;
      margin-top: 8px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">BHARAT BIKE & CAR RENTALS</div>
        <div class="brand-subtitle">Bhauwala Main Hub · Dehradun, Uttarakhand</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">WhatsApp & Support: +91 85070 67716</div>
      </div>
      <div class="invoice-tag">
        <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">TAX INVOICE / RECEIPT</div>
        <div class="invoice-id">#${booking.id}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Issued: ${invoiceDate}</div>
        <div class="badge-deposit">🛡️ ₹0 Zero Security Deposit</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-title">Rider / Customer Details</div>
        <div class="info-row"><strong>Name:</strong> ${booking.customerName || 'Rider'}</div>
        <div class="info-row"><strong>Mobile:</strong> +91 ${booking.customerPhone}</div>
        ${booking.customerEmail ? `<div class="info-row"><strong>Email:</strong> ${booking.customerEmail}</div>` : ''}
        ${booking.dlNumber ? `<div class="info-row"><strong>Driving License:</strong> ${booking.dlNumber}</div>` : ''}
        <div class="info-row"><strong>Payment Method:</strong> ${(booking.paymentMethod || 'cash').toUpperCase()}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Trip & Hub Schedule</div>
        <div class="info-row"><strong>Pickup:</strong> ${booking.pickupDate} at ${booking.pickupTime}</div>
        <div class="info-row"><strong>Return:</strong> ${booking.returnDate} at ${booking.returnTime}</div>
        <div class="info-row"><strong>Hub Location:</strong> ${pickupLocation}</div>
        <a href="${mapsUrl}" target="_blank" class="maps-btn no-print">📍 View Hub on Google Maps</a>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Type</th>
            <th>Duration</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${booking.vehicleName}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                Includes: Sanitized ISI Helmet, 24/7 Roadside Support, Instant Key Handover
              </div>
            </td>
            <td>${booking.type === 'taxi' ? 'Cab / Outstation' : 'Self-Drive Bike Rental'}</td>
            <td>${durationStr}</td>
            <td style="text-align: right; font-weight: 700;">₹${booking.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Security Deposit Policy</td>
            <td>Govt. Verified KYC</td>
            <td>Full Duration</td>
            <td style="text-align: right; color: #16a34a; font-weight: 700;">₹0 (WAIVED)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="total-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₹${booking.totalAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>Security Deposit</span>
        <span style="color: #16a34a;">₹0</span>
      </div>
      <div class="total-row">
        <span>Taxes & Fees</span>
        <span>Included</span>
      </div>
      <div class="total-row grand">
        <span>Total Paid / Due</span>
        <span style="color: #ea580c;">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        <div>Thank you for riding with BBR Bharat Bike Rentals!</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Please carry your Driving License and helmet while riding. Return fuel with equal level.</div>
      </div>
      <div style="text-align: right;">
        <strong>BBR Authorized Signatory</strong>
        <div style="font-size: 10px; color: #94a3b8;">Digitally Verified Invoice</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadInvoice(booking: InvoiceBookingData): void {
  const html = generateInvoiceHtml(booking);

  // 1. Trigger reliable automatic HTML file download (works across all browsers and mobiles)
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BBR-Invoice-${booking.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (err) {
    console.error('Invoice file download error:', err);
  }

  // 2. Open printable tab for direct PDF printing on supported devices
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch { /* ignore print dialog blockers */ }
      }, 500);
    }
  } catch { /* popup blocker */ }
}
