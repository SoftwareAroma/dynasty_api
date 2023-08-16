import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import {graphqlUploadExpress} from "graphql-upload";

/*
 * The main function that bootstraps the app
 * takes no arguments and returns void
 * It creates an instance of the Nest application
 * */
const bootstrap = async (): Promise<void> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  // app environment service
  const configService = app.get(ConfigService);
  app.enableShutdownHooks();

  /// graphql file upload
  app.use(
      '/graphql',
      graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }),
  );

  /// enable CORS
  app.enableCors({
    origin: "*",
      credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  /// middlewares
  app.use(cookieParser());

  /// USE HELMET TO ADD A SECURITY LAYER
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  /// Validation pipe
  app.useGlobalPipes(new ValidationPipe());

  /// get the port from the environment file
  const port = configService.get<number>('PORT');
  await app
    .listen(port)
    .then((): void => {
      console.log(`Server running on port http://localhost:${port}/api`);
      console.log(`Server running on port http://localhost:${port}/graphql`);
      console.log('Press CTRL-C to stop server');
    })
    .catch((err): void => {
      console.log('There was an error starting server. ', err);
    });
};

/// start the app
bootstrap().then(() => console.log());
