import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/shared/common';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ required: true })
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
  @IsNotEmpty()
  @ApiProperty({required: false})
  userName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({required: false})
  phone?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({required: false})
  avatar?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ required: false, default: Role.ADMIN })
  role?: Role;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({required: false})
  salt?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({required:  false, default: false })
  isAdmin: boolean;
}
