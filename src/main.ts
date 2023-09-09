import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { graphqlUploadExpress } from "graphql-upload";
import { DOMAINS, PORT } from "@shared";

/**
 * The main function that bootstraps the app
 * takes no arguments and returns void
 * It creates an instance of the Nest application
 * */
const bootstrap = async (): Promise<void> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  /// Enable app hooks
  app.enableShutdownHooks();

  /**
   * Enable graphql upload
   */
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }),
  );

  /**
   * Enable cors
   * it is not recommended to use the wildcard * for production
   */
  app.enableCors({
    origin: DOMAINS,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  /**
   * Enable cookie parser
   */
  app.use(cookieParser());

  /**
   * Enable helmet
   */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  /**
   * Enable validation pipe
   */
  app.useGlobalPipes(new ValidationPipe());

  /**
   * Start the app
   */
  const port: number = PORT;
  await app
    .listen(port)
    .then((): void => {
      console.log(`Application started successfully at http://localhost:${port}/`);
      console.log(`Server running on port http://localhost:${port}/graphql`);
      console.log('Press CTRL-C to stop server');
    })
    .catch((err): void => {
      console.log('There was an error starting server. ', err);
    });
};

/**
 * Call the bootstrap function to start the app
 */
bootstrap().then(() => console.log());
