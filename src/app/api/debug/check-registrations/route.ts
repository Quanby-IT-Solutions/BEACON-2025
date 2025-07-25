import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get recent conference registrations with payment status
    const recentRegistrations = await prisma.conference.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        User: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        ConferencePayment: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Conference Registrations Debug</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; position: sticky; top: 0; }
        .paid { background-color: #d4edda; }
        .pending { background-color: #fff3cd; }
        .unpaid { background-color: #f8d7da; }
        .tml-member { background-color: #d1ecf1; }
        .refresh-btn { background: #007cba; color: white; border: none; padding: 10px 20px; cursor: pointer; margin: 10px 0; }
        .refresh-btn:hover { background: #005a87; }
        .status-indicator { padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Conference Registrations Debug</h1>
        <p>Checking for registrations created without payment confirmation...</p>
        <p>Last updated: ${new Date().toLocaleString()}</p>
        
        <button class="refresh-btn" onclick="location.reload()">Refresh</button>
        
        <table>
            <thead>
                <tr>
                    <th>Registration Time</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>TML Member</th>
                    <th>Total Amount</th>
                    <th>Requires Payment</th>
                    <th>Payment Status</th>
                    <th>Payment Time</th>
                    <th>Issue?</th>
                </tr>
            </thead>
            <tbody>
                ${recentRegistrations.map(registration => {
                  const userDetails = registration.User?.UserDetails?.[0];
                  const userAccount = registration.User?.UserAccounts?.[0];
                  const payment = registration.ConferencePayment?.[0];
                  
                  // Determine status and potential issues
                  let rowClass = '';
                  let statusText = '';
                  let issueText = '';
                  
                  if (registration.isMaritimeLeagueMember === 'YES') {
                    rowClass = 'tml-member';
                    statusText = 'TML Member (Free)';
                  } else if (registration.requiresPayment) {
                    if (payment?.isPaid) {
                      rowClass = 'paid';
                      statusText = 'Paid';
                    } else {
                      rowClass = 'unpaid';
                      statusText = 'UNPAID';
                      issueText = '⚠️ Registration exists but payment not confirmed';
                    }
                  } else {
                    rowClass = 'pending';
                    statusText = 'No Payment Required';
                  }
                  
                  return `
                    <tr class="${rowClass}">
                        <td>${new Date(registration.createdAt).toLocaleString()}</td>
                        <td>${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'N/A'}</td>
                        <td>${userAccount?.email || 'N/A'}</td>
                        <td>${registration.isMaritimeLeagueMember}</td>
                        <td>₱${registration.totalPaymentAmount?.toLocaleString() || '0'}</td>
                        <td>${registration.requiresPayment ? 'YES' : 'NO'}</td>
                        <td>
                            <span class="status-indicator">${statusText}</span>
                            ${payment ? `<br><small>Mode: ${payment.paymentMode}</small>` : ''}
                        </td>
                        <td>${payment?.paymentConfirmedAt ? new Date(payment.paymentConfirmedAt).toLocaleString() : 'Not confirmed'}</td>
                        <td style="color: red; font-weight: bold;">${issueText}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 30px;">
            <h3>Legend:</h3>
            <ul>
                <li><span class="tml-member status-indicator">Blue</span> = TML Member (Free registration)</li>
                <li><span class="paid status-indicator">Green</span> = Payment confirmed</li>
                <li><span class="unpaid status-indicator">Red</span> = Registration created but payment NOT confirmed (PROBLEM!)</li>
                <li><span class="pending status-indicator">Yellow</span> = Pending status</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px;">
            <h3>How to Fix the Issue:</h3>
            <ol>
                <li><strong>Check the logs:</strong> Look for "DEBUG - Creating records immediately" in your server logs</li>
                <li><strong>Verify requiresPayment logic:</strong> Non-TML members with amount > 0 should require payment</li>
                <li><strong>Clean up orphaned records:</strong> Use the DELETE endpoint to remove unpaid registrations</li>
            </ol>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #007cba;">
            <h4>Expected Behavior:</h4>
            <ul>
                <li><strong>TML Members:</strong> Registration created immediately (no payment needed)</li>
                <li><strong>Walk-in Payment:</strong> Registration created immediately with pending payment</li>
                <li><strong>Online Payment:</strong> Registration created ONLY after PayMongo webhook confirms payment</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px;">
            <button class="refresh-btn" onclick="cleanupUnpaid()" style="background: #dc3545;">
                Clean Up Unpaid Registrations
            </button>
            <p style="color: red; font-size: 12px;">⚠️ This will delete all registrations that require payment but have no confirmed payment!</p>
        </div>
    </div>
    
    <script>
        async function cleanupUnpaid() {
            if (!confirm('Are you sure you want to delete all unpaid registrations? This cannot be undone!')) {
                return;
            }
            
            try {
                const response = await fetch('/api/debug/check-registrations', {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                alert(result.message);
                location.reload();
            } catch (error) {
                alert('Error cleaning up registrations: ' + error.message);
            }
        }
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE endpoint to clean up unpaid registrations (use with caution!)
export async function DELETE() {
  try {
    // Find registrations that require payment but have no confirmed payment
    const unpaidRegistrations = await prisma.conference.findMany({
      where: {
        requiresPayment: true,
        ConferencePayment: {
          none: {
            isPaid: true
          }
        }
      },
      include: {
        ConferencePayment: true,
        SummaryOfPayments: true,
        User: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        }
      }
    });

    if (unpaidRegistrations.length === 0) {
      return NextResponse.json({ message: 'No unpaid registrations to clean up' });
    }

    // Delete in correct order to avoid foreign key constraints
    let deletedItems = 0;

    for (const registration of unpaidRegistrations) {
      // Delete summary of payments
      await prisma.summaryOfPayments.deleteMany({
        where: { conferenceId: registration.id }
      });

      // Delete conference payments
      await prisma.conferencePayment.deleteMany({
        where: { conferenceId: registration.id }
      });

      // Delete conference
      await prisma.conference.delete({
        where: { id: registration.id }
      });

      // Delete user details
      if (registration.User?.UserDetails?.[0]) {
        await prisma.userDetails.delete({
          where: { id: registration.User.UserDetails[0].id }
        });
      }

      // Delete user accounts
      if (registration.User?.UserAccounts?.[0]) {
        await prisma.userAccounts.delete({
          where: { id: registration.User.UserAccounts[0].id }
        });
      }

      // Delete user
      await prisma.user.delete({
        where: { id: registration.userId }
      });
      
      deletedItems++;
    }

    return NextResponse.json({
      message: `Successfully cleaned up ${deletedItems} unpaid registrations`
    });

  } catch (error) {
    console.error('Error cleaning up registrations:', error);
    return NextResponse.json({ error: 'Failed to clean up registrations' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}