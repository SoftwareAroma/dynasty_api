import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {jwtConstants} from '@common';
import { AdminResolver } from './admin.resolver';
import {CaslModule} from "@casl/casl.module";

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
      AdminService,
      AdminResolver,
  ],
  exports: [AdminService],
})
export class AdminModule {}
