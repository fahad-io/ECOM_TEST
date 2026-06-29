import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Thin wrapper over the Stripe SDK. When STRIPE_SECRET_KEY is absent the
 * service reports itself disabled and callers fall back to a clearly-marked
 * mock payment (no real charge, test/assessment friendly).
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger('Stripe');
  private readonly client: Stripe | null;

  constructor(config: ConfigService) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.client = new Stripe(key);
      this.logger.log('Stripe enabled (test mode)');
    } else {
      this.client = null;
      this.logger.warn('STRIPE_SECRET_KEY not set — using mock payment fallback');
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  createPaymentIntent(
    amountCents: number,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.client) {
      throw new Error('Stripe is not enabled');
    }
    return this.client.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata,
    });
  }

  retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    if (!this.client) {
      throw new Error('Stripe is not enabled');
    }
    return this.client.paymentIntents.retrieve(id);
  }
}
