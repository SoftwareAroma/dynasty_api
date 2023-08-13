import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        return super.canActivate(
            new ExecutionContextHost([req]),
        );
    }

    handleRequest(err: any, user: any) {
        // console.log("user from GqlAuthGuard", user)
        if (err || !user) {
            return new UnauthorizedException;
        }
        return user;
    }
}
