import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ description: 'Product id to add' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Max(99)
  qty: number;

  @ApiPropertyOptional({ description: 'Selected size, if the product has sizes' })
  @IsOptional()
  @IsString()
  size?: string;
}
