import { Injectable } from '@nestjs/common';
import {API_VERSION} from "@shared";

@Injectable()
export class AppService {

  /**
   * Welcome Message to the api
   */
  welcome(): { message: string } {
    return {
      message: `welcome to dynasty urban style API ${API_VERSION}`,
    };
  }
}
