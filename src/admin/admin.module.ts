import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import {AdminController} from "./admin.controller";
import {
  AdminJwtStrategy,
  SecureModule
} from "@shared";

@Module({
  imports: [
    // PrismaModule,
    SecureModule,
  ],
  providers: [
      AdminService,
      AdminJwtStrategy,
  ],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
