import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto, CreateCartDto } from '@customer/dto/create.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
export class UpdateCartDto extends PartialType(CreateCartDto) {}