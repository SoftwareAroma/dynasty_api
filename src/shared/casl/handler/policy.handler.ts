import { AppAbility } from '@shared/casl/casl-ability.factory/casl-ability.factory';
import { IPolicyHandler } from '@shared/casl/interface/policy.interface';
import { Action } from 'src/shared/common';

/// customer
// export class CreateCustomerPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.Create, 'CustomerModel');
//   }
// }

export class ReadCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, 'CustomerModel');
  }
}

export class UpdateCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Update, 'CustomerModel');
  }
}

export class DeleteCustomerPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Delete, 'CustomerModel');
  }
}

/// employee
export class CreateEmployeePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Create, 'EmployeeModel');
  }
}
export class ReadEmployeePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, 'EmployeeModel');
  }
}

export class UpdateEmployeePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Update, 'EmployeeModel');
  }
}

export class DeleteEmployeePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Delete, 'EmployeeModel');
  }
}

/// attendance
export class ReadAttendancePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, 'AttendanceModel');
  }
}


/// product
export class CreateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Create, 'ProductModel');
  }
}
export class ReadProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, 'ProductModel');
  }
}

export class UpdateProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Update, 'ProductModel');
  }
}

export class DeleteProductPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Delete, 'ProductModel');
  }
}

/// Admin 
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