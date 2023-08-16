import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import {CaslModule} from "@shared/casl/casl.module";

@Module({
  imports: [
      CaslModule,
  ],
  providers: [
    ProductService,
    ProductResolver
  ],
  exports: [ProductService],
})
export class ProductModule {}
