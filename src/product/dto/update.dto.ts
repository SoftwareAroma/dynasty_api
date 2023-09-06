import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from '@product/dto/create.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
