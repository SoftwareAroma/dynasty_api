import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {Role,Action} from "@shared";

import {
    Admin as AdminModel,
    Customer as CustomerModel,
    Product as ProductModel,
    Cart as CartModel,
    Attendance as AttendanceModel,
    Employee as EmployeeModel,
} from '@prisma/client';

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
export class SecuredFactory {
    createForUser(user: any) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(
            createPrismaAbility,
        );

        if (user.role == Role.ADMIN) {
            can(Action.Manage, 'all');
        } else {
            can(Action.Read, 'all');

            cannot(Action.Manage, 'all');
            cannot(Action.Create, 'all');
            cannot(Action.Delete, 'all');
            cannot(Action.Update, 'all');
        }
        can([Action.Update, Action.Delete], ['AdminModel'], { id: user.id });

        return build();
    }
}
