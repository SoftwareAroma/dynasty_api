import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import {HttpArgumentsHost} from "@nestjs/common/interfaces";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) : void {
    console.error(exception.message);
    const ctx : HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message : string = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        const status : HttpStatus.CONFLICT = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
