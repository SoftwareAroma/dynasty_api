import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeResolver } from './employee.resolver';
import {CaslModule} from "@casl/casl.module";

@Module({
  imports: [
    CaslModule,
  ],
  providers: [EmployeeService, EmployeeResolver],
  exports: [EmployeeService],
})
export class EmployeeModule {}
