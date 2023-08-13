import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GqlExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);
        const ctx = gqlHost.getContext();

        // console.log('GqlExceptionFilter', exception);

        // Customize your error response as needed
        ctx.res?.status(exception.getStatus()).json({
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
            message: exception.message,
        });
    }
}
