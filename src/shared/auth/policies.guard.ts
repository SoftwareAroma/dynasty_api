import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppAbility, CaslAbilityFactory } from "@shared/casl/casl-ability.factory/casl-ability.factory";
import { PolicyHandler } from "@shared/casl/interface/policy.interface";
import { CHECK_POLICIES_KEY } from "@shared";
import {GqlExecutionContext} from "@nestjs/graphql";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers : PolicyHandler[] =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // const { user } = context.switchToHttp().getRequest();
    const gqlContext:  GqlExecutionContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req.user;

    const ability : AppAbility = this.caslAbilityFactory.createForUser(user);
    return policyHandlers.every((handler: PolicyHandler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) : boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}