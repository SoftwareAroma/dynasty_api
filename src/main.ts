import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from '@shared/prisma/prisma.service';

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
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  // string from environment file
  const origin: string = configService.get<string>('FRONTEND_URL');
  // api version
  const apiVersion: string = configService.get<string>('API_VERSION');
  const swaggerPath = 'swagger';
  // global prefix
  // app.setGlobalPrefix('api');
  // enable CORS
  app.enableCors({
    origin: origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  // middlewares
  app.use(cookieParser());
  /* APP VERSIONING */
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
    .setTitle(`DYNASTY URBAN STYLE API version ${apiVersion}`)
    .setDescription(
      'This is the backend api interface for the DYNASTY URBAN STYLE web project',
    )
    .setVersion(`${apiVersion}`)
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  // path for swagger
  SwaggerModule.setup(`${swaggerPath}`, app, document);

  // get the port from the config file
  const port = configService.get<number>('PORT');
  await app
    .listen(port)
    .then((): void => {
      console.log(`Server running on port http://localhost:${port}/api`);
      console.log(
        `Swagger running on port http://localhost:${port}/${swaggerPath}`,
      );
      console.log('Press CTRL-C to stop server');
    })
    .catch((err): void => {
      console.log('There was an error starting server. ', err);
    });
};

/// start the app
bootstrap().then(() => console.log());
