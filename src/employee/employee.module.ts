import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {EmployeeController} from "./employee.controller";
import {SecureModule} from "@shared/secure/secure.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {JWT_EXPIRES_IN, JWT_SECRET} from "@shared";

@Module({
  imports: [
      SecureModule,
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
