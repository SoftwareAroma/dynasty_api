import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration, { AllExceptionFilter, HttpExceptionFilter } from '@common';
import { AdminModule } from '@admin/admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomerModule } from '@customer/customer.module';
import { ProductModule } from '@product/product.module';
import { PrismaModule } from '@prisma/prisma.module';
import { CloudinaryModule } from '@cloudinary/cloudinary.module';
import { JwtStrategy } from '@common/strategy/jwt.strategy';
import * as Joi from 'joi';
import { EmployeeModule } from '@employee/employee.module';
import { PaymentModule } from '@payment/payment.module';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    /// other modules
    AdminModule,
    CustomerModule,
    ProductModule,
    EmployeeModule,
    PaymentModule,

    // prisma for database query and connection
    PrismaModule,
    //Cloudinary Module for file upload and retrieval
    CloudinaryModule,

    /// prevent brute force attack
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    /// configurations
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
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule { }
