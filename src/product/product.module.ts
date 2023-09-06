import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import {ProductController} from "./product.controller";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {JWT_EXPIRES_IN, JWT_SECRET} from "@shared";

@Module({
  imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN},
    }),
  ],
  providers: [
    ProductService,
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
