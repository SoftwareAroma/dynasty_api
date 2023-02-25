import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  social: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  displayName: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  salt: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  avatar: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  roles: string[];
}
