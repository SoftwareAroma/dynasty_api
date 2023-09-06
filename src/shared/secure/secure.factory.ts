import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import {
    Admin as AdminModel,
} from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {Role,Action} from "@shared";


export type AppAbility = PureAbility<
    [
        string,
        (
            | 'all'
            | Subjects<{
            AdminModel: AdminModel;
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
