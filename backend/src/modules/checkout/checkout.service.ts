import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { StripeService } from './stripe.service';

export interface PaymentIntentResponse {
  /** Whether this is a real Stripe intent or the mock fallback. */
  mock: boolean;
  amount: number; // order total in dollars
  paymentIntentId: string;
  clientSecret: string | null;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly cart: CartService,
    private readonly stripe: StripeService,
  ) {}

  /**
   * Creates a PaymentIntent for the user's current cart total. The amount is
   * always derived server-side from the cart — never sent by the client.
   */
  async createIntent(userId: string): Promise<PaymentIntentResponse> {
    const cart = await this.cart.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }
    const amount = cart.total;

    if (!this.stripe.enabled) {
      // Clearly-marked mock: no real charge. The frontend treats this as an
      // instantly-succeeded payment and proceeds to POST /orders.
      return {
        mock: true,
        amount,
        paymentIntentId: `mock_pi_${userId}_${cart.total}`,
        clientSecret: null,
      };
    }

    const intent = await this.stripe.createPaymentIntent(
      Math.round(amount * 100),
      { userId },
    );
    return {
      mock: false,
      amount,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  /**
   * Verifies a payment before the order is placed. In mock mode this always
   * reports success; with Stripe it retrieves the intent and reports its status.
   */
  async confirm(
    dto: ConfirmPaymentDto,
  ): Promise<{ status: string; mock: boolean }> {
    if (!this.stripe.enabled) {
      return { status: 'succeeded', mock: true };
    }
    const intent = await this.stripe.retrievePaymentIntent(dto.paymentIntentId);
    return { status: intent.status, mock: false };
  }
}
