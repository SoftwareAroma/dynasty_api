import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '@common';
import { AdminModule } from '@admin/admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomerModule } from '@customer/customer.module';
import { ProductModule } from '@product/product.module';
import { PrismaModule } from '@shared/prisma/prisma.module';
import Joi from 'joi';
import { EmployeeModule } from '@employee/employee.module';
import { APP_FILTER } from '@nestjs/core';
import { AppResolver } from './app.resolver';
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import {
  GqlExceptionFilter,
  HttpExceptionFilter,
  PrismaClientExceptionFilter
} from "@shared";
import { join } from 'path';

@Module({
  imports: [
    /// other modules
    AdminModule,
    CustomerModule,
    ProductModule,
    EmployeeModule,

    // prisma for database query and connection
    PrismaModule,

    /// prevent brute force attack
    ThrottlerModule.forRoot({
      ttl: 1000 * 60 * 60,
      limit: 100,
    }),

    /// GRAPHQL MODULE CONFIGURATION
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      driver: ApolloDriver,
      subscriptions: {
        'graphql-ws': true
      },
      // autoSchemaFile: true,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.graphql'),
      sortSchema: true,
      introspection: true, // Enable introspection
      playground: false,
      uploads: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault()
      ],
      debug: true,
      cors: {
        origin: true,
        credentials: true,
      },
      // add context object for request and response
      context: ({ req, res }) => {
        return { req, res };
      },
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
  providers: [
    AppService,
    AppResolver,
    // JwtStrategy,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GqlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule { }
