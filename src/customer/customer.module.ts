import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {CaslModule} from '@shared/casl/casl.module';
import { CustomerResolver } from './customer.resolver';
import {CustomerJwtStrategy} from "@shared/strategy/customer-jwt.strategy";
import {JWT_EXPIRES_IN, JWT_SECRET} from "@shared";

@Module({
  imports: [
    CaslModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  providers: [
      CustomerService,
      CustomerResolver,
      CustomerJwtStrategy,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
