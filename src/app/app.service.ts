import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  welcome(): { message: string } {
    return { message: "Hello and welcome to dynasty urban style" };
  }
}
