import {InputType, Field} from '@nestjs/graphql';
import {Role} from "@shared";

@InputType()
export class CreateEmployeeInput {
    @Field({nullable: true})
    email: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field({ nullable: true })
    phoneNumber: string;

    @Field({ nullable: true })
    avatar: string;

    @Field({ nullable: true, defaultValue: Role.USER })
    designation: Role;

    @Field({ nullable: true })
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}
