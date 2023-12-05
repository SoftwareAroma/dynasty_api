import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSaleDto {
    @IsString()
    @ApiProperty()
    employeeId: string;


    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    amount: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    quantity: string;

    @IsString()
    @ApiProperty()
    products: string[];
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) { }
