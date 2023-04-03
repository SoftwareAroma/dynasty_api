import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from '@common';

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
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  price: PriceType;

  @IsArray()
  @IsOptional()
  @IsNotEmpty()
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
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  brand: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  rating: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  numReviews: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  numInStock: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  colors: string[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  sizes: string[];
}
