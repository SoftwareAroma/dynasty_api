import {ObjectType, Field} from '@nestjs/graphql';
import {Role} from "@shared";
import {GCart} from "@customer/model/cart.model";

@ObjectType()
export class GCustomer {
    @Field(() => String)
    id: string;

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
    phone?: string;

    @Field({ nullable: true })
    avatar: string;

    @Field({ nullable: true, defaultValue: Role.ADMIN })
    role: string;


    @Field({ nullable: true })
    salt: string;

    @Field({ nullable: true, defaultValue: false })
    isAdmin: boolean;

    @Field(() =>[GCart], {nullable: true})
    cart: GCart[];

    @Field({ nullable: true })
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}
