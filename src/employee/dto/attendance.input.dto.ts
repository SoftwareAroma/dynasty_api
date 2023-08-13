import {InputType, Field} from '@nestjs/graphql';
@InputType()
export class CreateAttendanceInput {
    @Field()
    startTime: string;

    @Field({nullable: true})
    closeTime: string;

    @Field()
    employeeId: string;
}
