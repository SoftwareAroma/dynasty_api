import {InputType, Field} from '@nestjs/graphql';
import {Role} from "@common";

@InputType()
export class CreateCustomerInput {
    @Field({nullable: true})
    social: string;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field({ nullable: true })
    userName: string;

    @Field({ nullable: true })
    phone: string;

    @Field({ nullable: true })
    avatar: string;

    @Field({ nullable: true, defaultValue: Role.USER })
    role: Role;


    @Field({ nullable: true })
    salt: string;

    @Field({ nullable: true, defaultValue: false })
    isAdmin?: boolean;

    @Field({ nullable: true })
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}
