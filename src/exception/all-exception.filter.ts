import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {GqlArgumentsHost} from "@nestjs/graphql";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }
    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const gqlHost = GqlArgumentsHost.create(host);
        const context = gqlHost.getContext();
        const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string;

        if (exception instanceof HttpException) {
            // console.log("HTTP error ", exception)
            console.log("HTTP error ", exception.getResponse()['message'])
            // console.log("HTTP error ", exception.message)
            message = exception.getResponse()['message'];
        } else if (typeof exception === 'string') {
            // console.log("string error ", exception)
            message = exception; // If the exception is just a string message
        } else if (exception instanceof Error) {
            // console.log("Error error ", exception)
            message = exception.message; // If the exception is a standard JavaScript Error object
        }else {
            console.log("others error ", exception)
            message = 'Internal server error'; // Fallback for any other unknown cases
        }

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: message,
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
} 