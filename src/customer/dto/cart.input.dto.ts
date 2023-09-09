import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCartInput {
    @Field()
    customerId: string;

    @Field()
    productId: string;

    @Field(() => Int, { nullable: true, defaultValue: 1 })
    quantity?: number;
}
