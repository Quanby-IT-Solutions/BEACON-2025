// PayMongo Integration Utilities
// Based on PayMongo API v1 documentation

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

if (!PAYMONGO_SECRET_KEY) {
  throw new Error('PAYMONGO_SECRET_KEY is not set in environment variables');
}

// Base64 encode the secret key for Basic Auth
const authHeader = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64');

// Helper function to make PayMongo API requests
async function paymongoRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${PAYMONGO_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`PayMongo API Error: ${response.status} - ${errorData.errors?.[0]?.detail || response.statusText}`);
  }

  return response.json();
}

// Create a checkout session for GCash/Card payments
export async function createCheckoutSession(params: {
  amount: number; // Amount in centavos (PHP 100.00 = 10000)
  currency?: string;
  description?: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, any>;
  payment_method_types?: string[]; // Allow specific payment methods
  line_items?: Array<{
    currency: string;
    amount: number;
    description: string;
    name: string;
    quantity: number;
  }>;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}) {
  const {
    amount,
    currency = 'PHP',
    description = 'BEACON 2025 Conference Registration',
    success_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/registration/conference/payment/success`,
    cancel_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/registration/conference/payment/cancel`,
    metadata = {},
    payment_method_types = ['gcash', 'card', 'paymaya'], // Default to all methods
    line_items,
    customer
  } = params;

  const checkoutData = {
    data: {
      attributes: {
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        description,
        line_items: line_items || [
          {
            currency,
            amount,
            description,
            name: 'BEACON 2025 Conference Registration',
            quantity: 1,
          }
        ],
        payment_method_types,
        success_url,
        cancel_url,
        metadata,
        ...(customer && {
          billing: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          }
        }),
      }
    }
  };

  const response = await paymongoRequest('/checkout_sessions', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  });

  return response.data;
}

// Create a payment intent for direct API integration
export async function createPaymentIntent(params: {
  amount: number; // Amount in centavos
  currency?: string;
  description?: string;
  payment_method_allowed?: string[];
  metadata?: Record<string, any>;
}) {
  const {
    amount,
    currency = 'PHP',
    description = 'BEACON 2025 Conference Registration',
    payment_method_allowed = ['gcash', 'card', 'paymaya'],
    metadata = {}
  } = params;

  const intentData = {
    data: {
      attributes: {
        amount,
        payment_method_allowed,
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic'
          }
        },
        currency,
        description,
        capture_type: 'automatic',
        metadata,
      }
    }
  };

  const response = await paymongoRequest('/payment_intents', {
    method: 'POST',
    body: JSON.stringify(intentData),
  });

  return response.data;
}

// Retrieve a checkout session
export async function getCheckoutSession(checkoutSessionId: string) {
  const response = await paymongoRequest(`/checkout_sessions/${checkoutSessionId}`);
  return response.data;
}

// Retrieve a payment intent
export async function getPaymentIntent(paymentIntentId: string) {
  const response = await paymongoRequest(`/payment_intents/${paymentIntentId}`);
  return response.data;
}

// Retrieve payment information
export async function getPayment(paymentId: string) {
  const response = await paymongoRequest(`/payments/${paymentId}`);
  return response.data;
}

// Attach payment method to payment intent
export async function attachPaymentMethod(paymentIntentId: string, paymentMethodId: string) {
  const attachData = {
    data: {
      attributes: {
        payment_method: paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/registration/conference/payment/success`,
      }
    }
  };

  const response = await paymongoRequest(`/payment_intents/${paymentIntentId}/attach`, {
    method: 'POST',
    body: JSON.stringify(attachData),
  });

  return response.data;
}

// Helper function to convert PHP amount to centavos
export function phpToCentavos(amount: number): number {
  return Math.round(amount * 100);
}

// Helper function to convert centavos to PHP
export function centavosToPhp(centavos: number): number {
  return centavos / 100;
}

// Validate webhook signature (for webhook endpoint)
export function validateWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// PayMongo error types
export class PayMongoError extends Error {
  public code: string;
  public detail: string;

  constructor(message: string, code: string = 'unknown', detail: string = '') {
    super(message);
    this.name = 'PayMongoError';
    this.code = code;
    this.detail = detail;
  }
}

// Helper function to handle PayMongo webhook events
export function parseWebhookEvent(payload: any) {
  const { data } = payload;

  return {
    id: data.id,
    type: data.type,
    attributes: data.attributes,
    created_at: data.attributes.created_at,
    updated_at: data.attributes.updated_at,
  };
}

export {
  PAYMONGO_PUBLIC_KEY,
  PAYMONGO_BASE_URL,
};