import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from '@customer/dto/create.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
