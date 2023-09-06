import {Action, AppAbility, IPolicyHandler} from "@shared";

/**
 * Admin policy handlers
 */
export class ReadAdminPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Read, 'AdminModel');
    }
}

export class UpdateAdminPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Update, 'AdminModel');
    }
}

export class DeleteAdminPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Delete, 'AdminModel');
    }
}