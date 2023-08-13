import {Query, Resolver} from '@nestjs/graphql';
import {AppService} from "@app/app.service";
import {GMessage} from "@app/entity/message.entity";



@Resolver(() => GMessage)
export class AppResolver {
    constructor(
        private readonly appService: AppService,
    ) {}
    @Query(() => GMessage)
    sayHello(): {message: string } {
        return this.appService.welcome();
    }
}
