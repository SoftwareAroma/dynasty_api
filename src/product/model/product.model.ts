import {ObjectType, Field, Int, Float, ID} from '@nestjs/graphql';
import {PriceType} from "@common";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class GProduct {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    description: string;

    @Field(() => GraphQLJSON)
    price: PriceType;

    @Field(() => [String])
    images: string[];

    @Field()
    depo: string;

    @Field()
    category: string;

    @Field(() => [String], { nullable: true })
    cart: string[];

    @Field({ nullable: true })
    cartId?: string;

    @Field({ nullable: true })
    brand?: string;

    @Field(() => Float, { nullable: true, defaultValue: 0.0 })
    rating?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    numReviews?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    numInStock?: number;

    @Field(() =>[String])
    colors: string[];

    @Field(() =>[String])
    sizes: string[];

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}
