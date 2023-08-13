import { InputType, PartialType } from '@nestjs/graphql';
import {CreateAdminInput} from "@admin/dto/admin.input.dto";

@InputType()
export class UpdateAdminInput extends PartialType(CreateAdminInput) {}
