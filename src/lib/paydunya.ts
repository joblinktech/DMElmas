// PayDunya API integration (Node.js)
import axios from 'axios';

const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY || '';
const PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY || '';
const PAYDUNYA_TOKEN = process.env.PAYDUNYA_TOKEN || '';
const PAYDUNYA_MODE = process.env.PAYDUNYA_MODE || 'live';

export interface PaydunyaCheckoutData {
  invoice: {
    items: Array<{ name: string; quantity: number; unit_price: number }>;
    total_amount: number;
    description: string;
  };
  store: {
    name: string;
    tagline: string;
  };
  actions: {
    return_url: string;
    cancel_url: string;
    callback_url: string;
  };
}

export interface PaydunyaResponse {
  response_code: string;
  response_text: string;
  token: string;
  checkout_url: string;
}

export async function createPaydunyaCheckout(data: PaydunyaCheckoutData): Promise<PaydunyaResponse> {
  const url = 'https://app.paydunya.com/api/v1/checkout-invoice/create';
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': PAYDUNYA_TOKEN,
      'PAYDUNYA-MODE': PAYDUNYA_MODE
    }
  });
  return response.data.response;
};
