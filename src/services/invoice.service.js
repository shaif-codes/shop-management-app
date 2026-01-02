import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export const invoiceService = {
    generateHTML: (sale, shopName, shopDetails, user) => {
        const itemsRows = sale.items.map((item, index) => `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.rate}</td>
                <td style="text-align: right;">₹${item.lineTotal}</td>
            </tr>
        `).join('');

        const paymentsRows = sale.payments && sale.payments.length > 0 ? `
            <div class="section">
                <h3>Payment History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Mode</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.payments.map(p => `
                            <tr>
                                <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                                <td>${p.paymentMode}</td>
                                <td style="text-align: right;">₹${p.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .shop-name { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #000; }
                    .shop-details { font-size: 14px; color: #555; margin-top: 5px; }
                    .invoice-title { font-size: 20px; font-weight: bold; margin-top: 10px; letter-spacing: 2px; }
                    .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-box { width: 48%; }
                    .label { font-size: 12px; color: #777; font-weight: bold; }
                    .value { font-size: 14px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background-color: #f2f2f2; font-size: 12px; padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    td { font-size: 13px; padding: 8px; border-bottom: 1px solid #eee; }
                    .totals { float: right; width: 40%; margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .total-label { font-size: 14px; font-weight: bold; color: #555; }
                    .total-value { font-size: 14px; font-weight: bold; }
                    .net-amount { font-size: 16px; color: #000; border-top: 1px solid #333; padding-top: 10px; margin-top: 5px; }
                    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="shop-name">${shopName}</div>
                    <div class="shop-details">${shopDetails || ''}</div>
                    <div class="invoice-title">INVOICE</div>
                </div>

                <div class="info-section">
                    <div class="info-box">
                        <div class="label">BILL TO:</div>
                        <div class="value">${sale.customerName || 'Walking Customer'}</div>
                        ${sale.customerId?.phone ? `<div style="font-size: 13px;">Phone: ${sale.customerId.phone}</div>` : ''}
                        ${sale.customerId?.address ? `<div style="font-size: 13px;">${sale.customerId.address}</div>` : ''}
                    </div>
                    <div class="info-box" style="text-align: right;">
                        <div class="label">INVOICE NO:</div>
                        <div class="value">${sale.invoiceNumber}</div>
                        <div class="label" style="margin-top: 5px;">DATE:</div>
                        <div class="value">${new Date(sale.saleDate).toLocaleDateString()}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center; width: 30px;">#</th>
                            <th>Item</th>
                            <th style="text-align: center; width: 50px;">Qty</th>
                            <th style="text-align: right; width: 80px;">Rate</th>
                            <th style="text-align: right; width: 80px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span class="total-label">Gross Total:</span>
                        <span class="total-value">₹${sale.grossAmount}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Discount:</span>
                        <span class="total-value">- ₹${sale.discount}</span>
                    </div>
                    <div class="total-row net-amount">
                        <span class="total-label">Net Amount:</span>
                        <span class="total-value">₹${sale.netAmount}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Paid Amount:</span>
                        <span class="total-value">₹${sale.paidAmount}</span>
                    </div>
                    ${sale.pendingAmount > 0 ? `
                        <div class="total-row">
                            <span class="total-label" style="color: red;">Balance Due:</span>
                            <span class="total-value" style="color: red;">₹${sale.pendingAmount}</span>
                        </div>
                    ` : ''}
                </div>

                <div style="clear: both;"></div>

                ${paymentsRows}

                <div class="footer">
                    Thank you for your business!
                </div>
            </body>
            </html>
        `;
    },

    shareInvoice: async (sale, user) => {
        try {
            const shopName = sale.tenantId?.shopName || user?.tenantId?.shopName || 'MY SHOP';
            const shopDetails = [];
            const mobile = sale.tenantId?.mobile || user?.tenantId?.mobile;
            const address = sale.tenantId?.address || user?.tenantId?.address;

            if (mobile) shopDetails.push(`Mob: ${mobile}`);
            if (address) shopDetails.push(address);

            const html = invoiceService.generateHTML(sale, shopName, shopDetails.join(' | '), user);

            // Generate PDF using Expo Print
            // This works with the New Architecture and prevents "Library not loaded" errors
            const { uri } = await Print.printToFileAsync({
                html: html,
                base64: false
            });

            // Share the file
            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Share Invoice - ${sale.invoiceNumber}`
            });

        } catch (error) {
            console.error('Error creating/sharing PDF:', error);
            Alert.alert('Error', 'Failed to generate or share PDF');
        }
    }
};
