import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  welcome(): { message: string } {
    return {
      message: `welcome to dynasty urban style API ${this.configService.get<string>(
        'API_VERSION',
      )}`,
    };
  }
}
