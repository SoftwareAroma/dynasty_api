import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {CaslModule} from "@shared/casl/casl.module";
import {EmployeeController} from "./employee.controller";

@Module({
  imports: [
    CaslModule,
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
