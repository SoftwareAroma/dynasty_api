import {ObjectType, Field, ID} from '@nestjs/graphql';

@ObjectType()
export class GAttendance {
    @Field(() => ID)
    id: string;

    @Field()
    startTime: string;

    @Field({nullable: true})
    closeTime: string;

    @Field()
    employeeId: string;

    @Field({ nullable: true })
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}
