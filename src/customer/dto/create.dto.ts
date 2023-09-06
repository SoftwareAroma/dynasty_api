import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Role} from "src/shared/common";

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  @ApiProperty({required: false})
  social?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({required: false})
  password?: string;

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
  @ApiProperty()
  userName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({required: false})
  salt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({required: false})
  avatar?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({required: false, default: Role.USER})
  role: Role;

  @IsString()
  @IsOptional()
  @ApiProperty({required: false, default: false})
  isAdmin: boolean;
}
