import { PartialType } from '@nestjs/swagger';
import { CreateAttendanceDto, CreateEmployeeDto } from './create.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
