import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LoginAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({required: true})
  email: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({required: true})
  password: string;
}
