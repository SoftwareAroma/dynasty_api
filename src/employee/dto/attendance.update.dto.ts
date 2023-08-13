import { InputType, PartialType } from '@nestjs/graphql';
import {CreateAttendanceInput} from "./attendance.input.dto";

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {}
