import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "debug", "verbose"], // 'log' // remove log to disable logging
  });
  await app.listen(5000);
}

/// start the app
bootstrap().then(() => console.log());
