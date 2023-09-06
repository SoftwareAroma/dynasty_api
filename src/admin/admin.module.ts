import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import {AdminController} from "./admin.controller";
import {
  AdminJwtStrategy, JWT_EXPIRES_IN, JWT_SECRET, PrismaModule
} from "@shared";
import {SecureModule} from "@shared/secure/secure.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    SecureModule,
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
