import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminResolver } from './admin.resolver';
import { CaslModule } from "@shared/casl/casl.module";
import {AdminJwtStrategy} from "@shared/strategy/admin-jwt.strategy";
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
    AdminService,
    AdminResolver,
    AdminJwtStrategy,
  ],
  exports: [AdminService],
})
export class AdminModule { }
