import { InputType, Field } from '@nestjs/graphql';
import {Role} from "@common";

@InputType()
export class CreateAdminInput {
    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field({ nullable: true })
    userName?: string;

    @Field({ nullable: true })
    phone?: string;

    @Field({ nullable: true })
    avatar?: string;

    @Field({ nullable: true, defaultValue: Role.ADMIN })
    role?: Role;


    @Field({ nullable: true })
    salt?: string;

    @Field({ nullable: true, defaultValue: true })
    isAdmin?: boolean;
}
