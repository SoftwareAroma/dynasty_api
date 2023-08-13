import { InputType, PartialType } from '@nestjs/graphql';
import {CreateCustomerInput} from "@customer/dto/customer.input.dto";

@InputType()
export class UpdateCustomerInput extends PartialType(CreateCustomerInput) {}
