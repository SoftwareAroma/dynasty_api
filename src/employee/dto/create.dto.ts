import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @IsString()
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
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @ApiProperty()
  designation: string;

  @IsString()
  @ApiProperty({required: false})
  avatar?: string;
}

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({required: false})
  closeTime: string;
}
