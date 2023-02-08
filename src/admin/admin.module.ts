import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "@common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "@admin/schema/admin.schema";
import { JwtStrategy } from "@admin/strategy/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {expiresIn: jwtConstants.expiresIn },
    }),
    MongooseModule.forFeature([
      {name: Admin.name, schema: AdminSchema}
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    JwtStrategy,
  ],
  exports: [AdminService],
})
export class AdminModule {}
