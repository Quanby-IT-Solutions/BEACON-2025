import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>PayMongo Webhook Tester</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        input, button { padding: 10px; margin: 5px; font-size: 14px; }
        input { width: 400px; }
        button { background: #007cba; color: white; border: none; cursor: pointer; }
        button:hover { background: #005a87; }
        .result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; background: #f9f9f9; }
        .error { border-color: #ff0000; background: #ffe6e6; }
        .success { border-color: #00aa00; background: #e6ffe6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PayMongo Webhook Tester</h1>
        <p>Enter the PayMongo checkout session ID from your successful test payment:</p>
        
        <div>
            <input type="text" id="checkoutSessionId" placeholder="cs_xxxxxxxxxxxxxxxxxx" />
            <button onclick="testWebhook()">Test Webhook</button>
        </div>
        
        <div id="result" class="result" style="display: none;"></div>
        
        <h3>Instructions:</h3>
        <ol>
            <li>Complete a test payment in your app</li>
            <li>After being redirected to success page, check the URL or browser network tab</li>
            <li>Find the checkout session ID (starts with "cs_")</li>
            <li>Enter it above and click "Test Webhook"</li>
        </ol>
        
        <h3>How to find checkout session ID:</h3>
        <ul>
            <li><strong>Method 1:</strong> Check success page URL parameters</li>
            <li><strong>Method 2:</strong> Open browser dev tools → Network tab → Look for PayMongo API calls</li>
            <li><strong>Method 3:</strong> Check your app logs during payment initiation</li>
        </ul>
    </div>

    <script>
        async function testWebhook() {
            const checkoutSessionId = document.getElementById('checkoutSessionId').value.trim();
            const resultDiv = document.getElementById('result');
            
            if (!checkoutSessionId) {
                resultDiv.innerHTML = '<strong>Error:</strong> Please enter a checkout session ID';
                resultDiv.className = 'result error';
                resultDiv.style.display = 'block';
                return;
            }
            
            resultDiv.innerHTML = 'Testing webhook... Please wait...';
            resultDiv.className = 'result';
            resultDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/debug/test-webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ checkoutSessionId })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <strong>Success!</strong> Webhook test completed.
                        <br><br>
                        <strong>Details:</strong>
                        <ul>
                            <li>Checkout Session: \${data.data.checkoutSessionId}</li>
                            <li>Registration Ref: \${data.data.registrationRef}</li>
                            <li>Total Amount: ₱\${data.data.totalAmount}</li>
                            <li>Events Count: \${data.data.eventsCount}</li>
                        </ul>
                        <br>
                        Check your database - the payment should now be marked as CONFIRMED with all PayMongo fields populated.
                    \`;
                    resultDiv.className = 'result success';
                } else {
                    resultDiv.innerHTML = \`
                        <strong>Error:</strong> \${data.error}
                        <br><br>
                        <strong>Details:</strong> \${data.details || 'No additional details'}
                    \`;
                    resultDiv.className = 'result error';
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <strong>Network Error:</strong> \${error.message}
                    <br><br>
                    Make sure your development server is running.
                \`;
                resultDiv.className = 'result error';
            }
        }
        
        // Allow Enter key to trigger test
        document.getElementById('checkoutSessionId').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                testWebhook();
            }
        });
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}