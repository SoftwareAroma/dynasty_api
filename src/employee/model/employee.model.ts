import {ObjectType, Field, ID} from '@nestjs/graphql';
import {GAttendance} from "@employee/model/attendance.model";

@ObjectType()
export class GEmployee {
    @Field(() => ID)
    id: string;

    @Field({nullable: true})
    email: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    designation: string;

    @Field({ nullable: true })
    phoneNumber: string;

    @Field({ nullable: true })
    avatar: string;

    @Field(() =>[GAttendance], {nullable: true})
    attendance: GAttendance[];

    @Field({ nullable: true })
    createdAt: Date;

    @Field({ nullable: true })
    updatedAt: Date;
}
