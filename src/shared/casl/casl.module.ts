import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from "@shared/casl/casl-ability.factory/casl-ability.factory";

@Module({
  providers:[CaslAbilityFactory],
  exports:[CaslAbilityFactory],
})
export class CaslModule {}
