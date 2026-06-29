import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, StripeService],
  exports: [StripeService],
})
export class CheckoutModule {}
