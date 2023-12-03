import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSaleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    productId: string;

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
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) { }