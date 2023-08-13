import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';

/*
 * ######################################################
 * ############### BOOTSTRAP THE APP ####################
 * ######################################################
 * */
const bootstrap = async (): Promise<void> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  // app config service
  const configService = app.get(ConfigService);
  app.enableShutdownHooks();
  // global prefix
  app.setGlobalPrefix('api');
  // enable CORS
  app.enableCors({
    origin: "*",
      credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  /// middlewares
  app.use(cookieParser());
  /// APP VERSIONING
  app.enableVersioning({
    type: VersioningType.URI,
  });

  /* USE HELMET TO ADD A SECURITY LAYER */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  /*
   * ###########################################################
   * #################### USE GLOBAL PIPES #####################
   * ###########################################################
   * */
  app.useGlobalPipes(new ValidationPipe());

  // get the port from the config file
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
