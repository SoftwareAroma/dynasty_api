import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "@common";
import * as Joi from 'joi';
import {config} from 'dotenv';
import { MongooseModule } from "@nestjs/mongoose";
import { AdminModule } from "@admin/admin.module";
import { ThrottlerModule } from "@nestjs/throttler";

/// load env files and get database string
config();
const databaseUrl = process.env.MONGO_URI;

@Module({
  imports: [
    /// other modules
    AdminModule,

    /// prevent brute force attack
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    /// configurations
    ConfigModule.forRoot({
      load: [configuration],
      // envFilePath: [".env", ".env.production"],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(5000),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    // connect to mongodb database
    MongooseModule.forRoot(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
