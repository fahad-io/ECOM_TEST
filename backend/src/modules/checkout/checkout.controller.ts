import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@ApiTags('checkout')
@ApiBearerAuth()
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('payment-intent')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a Stripe test-mode PaymentIntent for the cart total',
  })
  createIntent(@CurrentUser('userId') userId: string) {
    return this.checkout.createIntent(userId);
  }

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a payment status before placing the order' })
  confirm(@Body() dto: ConfirmPaymentDto) {
    return this.checkout.confirm(dto);
  }
}
