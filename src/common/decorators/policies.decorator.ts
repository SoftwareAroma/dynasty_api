import { PolicyHandler } from "@shared/casl/interface/policy.interface";
import { SetMetadata } from "@nestjs/common";

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) => SetMetadata(CHECK_POLICIES_KEY, handlers);