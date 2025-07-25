import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Calculation Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .calculation { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #007cba; }
        .result { font-weight: bold; color: #007cba; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Payment Calculation Test</h1>
        
        <div class="calculation">
            <h3>Scenario 1: All 3 Conference Events (₱11,000 - ₱1,500 discount)</h3>
            <ul>
                <li>Event 1: ₱4,000</li>
                <li>Event 2: ₱3,500</li>
                <li>Event 3: ₱3,500</li>
                <li><strong>Subtotal:</strong> ₱11,000</li>
                <li><strong>Conference Discount:</strong> -₱1,500</li>
                <li><strong>Base Amount:</strong> ₱9,500</li>
            </ul>
            <p class="result">Expected PayMongo Total: ₱9,500</p>
        </div>
        
        <div class="calculation">
            <h3>Scenario 2: All 3 Conference Events + ₱500 Donation</h3>
            <ul>
                <li>Base Amount (with discount): ₱9,500</li>
                <li>Additional Donation: ₱500</li>
            </ul>
            <p class="result">Expected PayMongo Total: ₱10,000</p>
        </div>
        
        <div class="calculation">
            <h3>Scenario 3: Only 2 Conference Events (No discount)</h3>
            <ul>
                <li>Event 1: ₱4,000</li>
                <li>Event 2: ₱3,500</li>
                <li><strong>Subtotal:</strong> ₱7,500</li>
                <li><strong>Discount:</strong> Not applicable</li>
            </ul>
            <p class="result">Expected PayMongo Total: ₱7,500</p>
        </div>
        
        <div class="calculation">
            <h3>How to Test:</h3>
            <ol>
                <li>Select all 3 conference events in your app</li>
                <li>Check that the Payment Summary shows Base Amount: ₱9,500</li>
                <li>Add ₱500 to Additional Amount</li>
                <li>Check that Total Amount becomes ₱10,000</li>
                <li>Proceed to PayMongo - it should show ₱10,000</li>
            </ol>
        </div>
        
        <div class="calculation">
            <h3>Debug Steps:</h3>
            <ol>
                <li>Open browser dev tools → Console</li>
                <li>Look for any error messages</li>
                <li>Check the Payment Summary card shows correct amounts</li>
                <li>Verify the Progress indicator shows correct total</li>
                <li>Check PayMongo checkout page shows matching amount</li>
            </ol>
        </div>
    </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}