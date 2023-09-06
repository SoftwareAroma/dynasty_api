import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/shared/common';
import { AdminModule } from '@admin/admin.module';
import {ThrottlerModule} from '@nestjs/throttler';
import Joi from 'joi';
import {APP_FILTER} from '@nestjs/core';
import {
  HttpExceptionFilter,
  PrismaClientExceptionFilter,
  PrismaModule
} from "@shared";
import {AppController} from "./app.controller";
import {CustomerModule} from "@customer/customer.module";
import {ProductModule} from "@product/product.module";
import {EmployeeModule} from "@employee/employee.module";

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    CustomerModule,
    ProductModule,
    EmployeeModule,

    ThrottlerModule.forRoot({
      ttl: 1000 * 60 * 60,
      limit: 100,
    }),

    ConfigModule.forRoot({
      load: [configuration],
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
  ],
  controllers: [
      AppController,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
  exports: [AppService]
})
export class AppModule { }
