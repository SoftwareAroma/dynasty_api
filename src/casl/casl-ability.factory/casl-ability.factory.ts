import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Actions } from '@common/enums/actions.enum';
import { Role } from '@common';
import {
  Admin as AdminModel,
  Customer as CustomerModel,
  Product as ProductModel,
} from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';

export type AppAbility = PureAbility<
  [
    string,
    (
      | 'all'
      | Subjects<{
          CustomerModel: CustomerModel;
          AdminModel: AdminModel;
          ProductModel: ProductModel;
        }>
    ),
  ],
  PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: CustomerModel | AdminModel) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.role == Role.USER) {
      can(Actions.Create, 'CustomerModel');
      can(Actions.Read, 'CustomerModel');
      can(Actions.Read, 'AdminModel');
      can(Actions.Read, 'ProductModel');
      cannot(Actions.Create, 'ProductModel');
      cannot(Actions.Update, 'ProductModel');
      cannot(Actions.Delete, 'ProductModel');
    } else {
      can(Actions.Manage, 'all');
    }

    can([Actions.Update, Actions.Delete], ['AdminModel'], { id: user.id });

    can([Actions.Update, Actions.Delete], ['CustomerModel'], { id: user.id });

    return build();
  }
}
