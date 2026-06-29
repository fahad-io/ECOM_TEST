import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ShippingAddressDto {
  @ApiProperty({ example: 'Alex Rivera' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12 Linden Street' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  street: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'EC1A 1BB' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  postalCode: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({
    description: 'Stripe PaymentIntent id from a confirmed test-mode payment',
  })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}
