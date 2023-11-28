import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from '@shared';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  price: PriceType;

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  images: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  depo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  brand: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  rating: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  numReviews: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  numInStock: number;

  @IsNotEmpty()
  @ApiProperty()
  colors: string[];

  @IsNotEmpty()
  @ApiProperty()
  sizes: string[];
}
