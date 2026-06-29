import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Category } from '../../../common/enums/category.enum';

/** Splits a comma-separated multipart string into a trimmed string[]. */
const toSizes = ({ value }: { value: unknown }): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export class CreateProductDto {
  @ApiProperty({ example: 'Everyday Cotton Tee' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 28, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ example: 42, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Comma-separated sizes, e.g. "S,M,L,XL"',
    example: 'S,M,L,XL',
  })
  @IsOptional()
  @Transform(toSizes)
  @IsString({ each: true })
  sizes?: string[];
}
