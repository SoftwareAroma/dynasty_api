// add-to-cart.input.ts
import {IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";


export class CreateCartDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    customerId: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    productId: string;

    @IsString()
    @IsOptional()
    @ApiProperty({required: false, default: 1})
    quantity?: number;
}
