import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { CaslModule } from '@casl/casl.module';

@Module({
  imports: [
    CaslModule
  ],
  providers: [SaleService],
  controllers: [SaleController],
  exports: [SaleService],
})
export class SaleModule { }
