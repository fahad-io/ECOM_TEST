import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'The PaymentIntent id to verify' })
  @IsString()
  paymentIntentId: string;
}
