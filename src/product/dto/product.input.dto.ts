import {InputType, Field, Int, Float} from '@nestjs/graphql';
import {PriceType} from "@shared";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreateProductInput {
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

    @Field({ nullable: true })
    brand?: string;

    @Field(() => Float, { nullable: true, defaultValue: 0 })
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
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}