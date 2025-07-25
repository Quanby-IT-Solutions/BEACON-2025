import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get recent conference payments to check webhook status
    const recentPayments = await prisma.conferencePayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        Conference: {
          include: {
            User: {
              include: {
                UserAccounts: true,
                UserDetails: true
              }
            }
          }
        }
      }
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Webhook Debug - Recent Payments</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .paid { background-color: #d4edda; }
        .pending { background-color: #fff3cd; }
        .failed { background-color: #f8d7da; }
        .null-field { color: #999; font-style: italic; }
        .refresh-btn { background: #007cba; color: white; border: none; padding: 10px 20px; cursor: pointer; margin: 10px 0; }
        .refresh-btn:hover { background: #005a87; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Webhook Debug - Recent Payments</h1>
        <p>Last updated: ${new Date().toLocaleString()}</p>
        
        <button class="refresh-btn" onclick="location.reload()">Refresh</button>
        
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Is Paid</th>
                    <th>PayMongo Checkout ID</th>
                    <th>PayMongo Payment ID</th>
                    <th>PayMongo Webhook ID</th>
                    <th>Payment Method</th>
                    <th>Confirmed At</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>
                ${recentPayments.map(payment => {
                  const user = payment.Conference?.User;
                  const userDetails = user?.UserDetails?.[0];
                  const userAccount = user?.UserAccounts?.[0];
                  const rowClass = payment.isPaid ? 'paid' : payment.paymentStatus === 'FAILED' ? 'failed' : 'pending';
                  
                  return `
                    <tr class="${rowClass}">
                        <td>${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'N/A'}</td>
                        <td>${userAccount?.email || 'N/A'}</td>
                        <td>₱${payment.totalAmount.toLocaleString()}</td>
                        <td>${payment.paymentStatus}</td>
                        <td>${payment.isPaid ? '✅' : '❌'}</td>
                        <td class="${!payment.paymongoCheckoutId ? 'null-field' : ''}">${payment.paymongoCheckoutId || 'null'}</td>
                        <td class="${!payment.paymongoPaymentId ? 'null-field' : ''}">${payment.paymongoPaymentId || 'null'}</td>
                        <td class="${!payment.paymongoWebhookId ? 'null-field' : ''}">${payment.paymongoWebhookId || 'null'}</td>
                        <td class="${!payment.paymongoPaymentMethod ? 'null-field' : ''}">${payment.paymongoPaymentMethod || 'null'}</td>
                        <td>${payment.paymentConfirmedAt ? new Date(payment.paymentConfirmedAt).toLocaleString() : 'Not confirmed'}</td>
                        <td>${new Date(payment.createdAt).toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 30px;">
            <h3>Legend:</h3>
            <ul>
                <li><span class="paid" style="padding: 2px 5px;">Green</span> = Payment confirmed (isPaid = true)</li>
                <li><span class="pending" style="padding: 2px 5px;">Yellow</span> = Payment pending</li>
                <li><span class="failed" style="padding: 2px 5px;">Red</span> = Payment failed</li>
                <li><span class="null-field">Italic gray</span> = Missing PayMongo data (webhook not triggered)</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px;">
            <h3>What to check:</h3>
            <ul>
                <li>If PayMongo fields are null/empty → Webhook is not being triggered</li>
                <li>If isPaid is false but payment was successful → Check webhook configuration</li>
                <li>Use the <a href="/api/debug/webhook-test-page">Webhook Tester</a> to manually trigger webhook processing</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook logs' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}