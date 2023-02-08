import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { VersioningType } from "@nestjs/common";

/*
 * ######################################################
 * ############### BOOTSTRAP THE APP ####################
 * ######################################################
 * */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "debug", "verbose"], // 'log' // remove log to disable logging
  });
  // app config service
  const configService = app.get(ConfigService);
  const origin = configService.get<string>('FRONTEND_URL');
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
  * ########################################################
  * ######## PREVENT XSS ATTACKS AND SQL INJECTION #########
  * ########################################################
  * */
  // app.use(
  //   csurf({
  //     cookie: {
  //       sameSite: true,
  //       secure:true,
  //     }
  //   }),
  // );
  // get the port from the config file
  const port = configService.get<number>('PORT');
  await app.listen(port).then(() => {
    console.log(`Server running on port http://localhost:${port}`);
    // console.log(`Swagger running on port http://localhost:${port}/api`);
    console.log("Press CTRL-C to stop server");
  }).catch((err) => {
    console.log("There was an error starting server. ", err);
  });
}

/// start the app
bootstrap().then(() => console.log());
