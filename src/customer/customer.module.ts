import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {JWT_EXPIRES_IN, JWT_SECRET, CustomerJwtStrategy} from '@shared';
import {CustomerController} from "./customer.controller";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  controllers: [
      CustomerController,
  ],
  providers: [
      CustomerService,
      CustomerJwtStrategy,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
