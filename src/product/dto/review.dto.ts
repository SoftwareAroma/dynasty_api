import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    comment: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) { }