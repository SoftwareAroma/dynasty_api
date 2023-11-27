import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import {
    Admin as AdminModel,
    Customer as CustomerModel,
    Product as ProductModel,
    Cart as CartModel,
    Attendance as AttendanceModel,
    Employee as EmployeeModel,
} from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Role, Action } from '@shared';

export type AppAbility = PureAbility<
  [
    string,
    (
      | 'all'
      | Subjects<{
        CustomerModel: CustomerModel;
        AdminModel: AdminModel;
        ProductModel: ProductModel;
        CartModel: CartModel;
        AttendanceModel: AttendanceModel;
        EmployeeModel: EmployeeModel;
      }>
    ),
  ],
  PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any) : AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.role == Role.ADMIN) {
        can(Action.Manage, 'all');
        can(Action.Create, 'all');
        can(Action.Delete, 'all');
        can(Action.Update, 'all');
        can([Action.Update, Action.Delete], ['AdminModel'], { id: user.id });
    }else if(user.role == Role.USER){
        // console.log("Status Role :", user.role);
        can(Action.Read, 'all');

        can(Action.Create, 'CustomerModel');
        can([Action.Update, Action.Delete], ['CustomerModel'], { id: user.id });

        cannot(Action.Create, ['AdminModel', 'ProductModel']);
        cannot(Action.Delete, ['AdminModel', 'ProductModel']);
        cannot(Action.Update, ['AdminModel', 'ProductModel']);
    } else {
      can(Action.Read, 'all');
      cannot(Action.Manage, 'all');
    }

    return build();
  }
}
