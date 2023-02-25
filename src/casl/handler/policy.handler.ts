import { AppAbility } from '@casl/casl-ability.factory/casl-ability.factory';
import { IPolicyHandler } from '@casl/interface/policy.interface';
import { Actions } from '@common';

/// Customer
export class ReadCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Read, 'CustomerModel');
  }
}

export class UpdateCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Update, 'CustomerModel');
  }
}

export class DeleteCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Delete, 'CustomerModel');
  }
}

/// product
export class CreateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Create, 'ProductModel');
  }
}
export class ReadProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Read, 'ProductModel');
  }
}

export class UpdateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Update, 'ProductModel');
  }
}

export class DeleteProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Delete, 'ProductModel');
  }
}

/// Admin
export class ReadAdminPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Read, 'AdminModel');
  }
}

export class UpdateAdminPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Update, 'AdminModel');
  }
}

export class DeleteAdminPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Actions.Delete, 'AdminModel');
  }
}
