import { ApiProperty, PartialType } from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateSaleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    currency: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    quantity: number;

    @IsArray()
    @ApiProperty()
    products: string[]
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) { }