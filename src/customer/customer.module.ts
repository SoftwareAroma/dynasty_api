import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@common';
import {CaslModule} from '@shared/casl/casl.module';
import { CustomerResolver } from './customer.resolver';

@Module({
  imports: [
    CaslModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [
      CustomerService,
      CustomerResolver,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
