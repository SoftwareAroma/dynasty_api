import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {AdminController} from "./admin.controller";
import {JWT_EXPIRES_IN, JWT_SECRET, AdminJwtStrategy, CaslModule} from "@shared";

@Module({
  imports: [
    CaslModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN},
    }),
  ],
  providers: [
      AdminService,
      AdminJwtStrategy,
  ],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
