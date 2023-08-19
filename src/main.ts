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
  const configService : ConfigService<unknown, boolean> = app.get(ConfigService);
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
    origin: "*",
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

  // add csrf protection
  //   app.use(csurf());

    // app.use((req: any, res: any, next: any) : void  => {
    //     const token = req.csrfToken();
    //     res.cookie('XSRF-TOKEN', token);
    //     res.locals.csrfToken = token;
    //
    //     next();
    // });

  /**
   * Enable validation pipe
   */
  app.useGlobalPipes(new ValidationPipe());

  /**
   * Start the app
   */
  const port = configService.get<number>('PORT');
  await app
    .listen(port)
    .then((): void => {
      console.log(`Application started successfully at ${app.getUrl()}`);
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
