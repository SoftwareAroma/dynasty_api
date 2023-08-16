import {ObjectType, Field} from '@nestjs/graphql';
import {Role} from "@common";

@ObjectType()
export class GAdmin {
    @Field(() => String)
    id: string;

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

    @Field({ nullable: true, defaultValue: Role.ADMIN })
    role: string;


    @Field({ nullable: true })
    salt: string;

    @Field({ nullable: true, defaultValue: true })
    isAdmin?: boolean;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}