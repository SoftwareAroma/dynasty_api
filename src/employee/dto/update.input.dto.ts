import { InputType, PartialType } from '@nestjs/graphql';
import {CreateEmployeeInput} from "@employee/dto/employee.input.dto";

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {}
