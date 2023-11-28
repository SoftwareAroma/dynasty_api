import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@shared';

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
  @MinLength(8)
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
  userName: string;

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

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  role: Role;
}
