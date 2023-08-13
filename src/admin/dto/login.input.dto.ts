import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginAdminInput {
    @Field({ nullable: false })
    email: string;

    @Field({ nullable: false })
    password: string;
}
