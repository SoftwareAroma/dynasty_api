import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class GMessage {
    @Field()
    message: string;
}