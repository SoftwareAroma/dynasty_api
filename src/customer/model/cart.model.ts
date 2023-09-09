import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {GCustomer} from "@customer/model/customer.model";
import {GProduct} from "@product/model/product.model";

@ObjectType()
export class GCart {
    @Field(() => ID)
    id: string;

    @Field(() => GCustomer)
    customer: GCustomer;

    @Field(() => GProduct)
    product: GProduct;

    @Field(() => Int)
    quantity: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
