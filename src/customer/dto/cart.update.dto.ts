import { InputType, PartialType } from '@nestjs/graphql';
import {CreateCartInput} from "./cart.input.dto";

@InputType()
export class UpdateCartInput extends PartialType(CreateCartInput) {}
