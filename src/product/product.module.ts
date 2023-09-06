import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import {CaslModule} from "@shared/casl/casl.module";
import {ProductController} from "./product.controller";

@Module({
  imports: [
      CaslModule,
  ],
  providers: [
    ProductService,
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
