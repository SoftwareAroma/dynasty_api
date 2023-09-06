import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {ValidationPipe, VersioningType} from '@nestjs/common';
import {graphqlUploadExpress} from "graphql-upload";
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from "@nestjs/swagger";
import {API_VERSION, PORT, SWAGGER_PATH} from "src/shared/common";

/*
 * The main function that bootstraps the app
 * takes no arguments and returns void
 * It creates an instance of the Nest application
 * */
const bootstrap = async (): Promise<void> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  app.enableShutdownHooks();
  /// global prefix
  app.setGlobalPrefix('api');

  /* APP VERSIONING */
  app.enableVersioning({
    type: VersioningType.URI,
  });

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

  /**
   * Enable validation pipe
   */
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
  );

  /*
   * ###########################################################
   * ##################### SWAGGER CONFIG ######################
   * ###########################################################
   * */
  const config: Omit<OpenAPIObject, any> = new DocumentBuilder()
      .setTitle(`DYNASTY URBAN STYLE API version ${API_VERSION}`)
      .setDescription(
          'This is the backend api interface for the DYNASTY URBAN STYLE web project',
      )
      .setVersion(`${API_VERSION}`)
      .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  // path for swagger
  SwaggerModule.setup(`${SWAGGER_PATH}`, app, document);

  /**
   * Start the app
   */
  await app
    .listen(PORT)
    .then((): void => {
      console.log(`Application started successfully at http://localhost:${PORT}/`);
      console.log(`Server running on port http://localhost:${PORT}/${SWAGGER_PATH}`);
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
