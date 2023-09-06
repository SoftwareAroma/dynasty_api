import { Module } from '@nestjs/common';
import {SecuredFactory} from "@shared";

@Module({
    providers:[SecuredFactory],
    exports:[SecuredFactory],
})
export class SecureModule {}
