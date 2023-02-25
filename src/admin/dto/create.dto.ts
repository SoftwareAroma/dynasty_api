import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@common';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

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
  avatar: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ default: Role.ADMIN })
  role: Role;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ required: true })
  password: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  salt: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: false })
  isAdmin: boolean;
}
