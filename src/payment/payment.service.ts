import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import paystack = require('paystack');
import crypto = require('crypto');

@Injectable()
export class PaymentService {
  private paystackClient: paystack;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('PAY_STACK_API_KEY');
    this.paystackClient = paystack(apiKey);
  }

  async initializeTransaction(data: any): Promise<any> {
    const response = await this.paystackClient.transaction.initialize(data);
    return response.data;
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    const hmac = crypto.createHmac(
      'sha512',
      this.configService.get<string>('PAY_STACK_API_KEY'),
    );
    const hash = hmac.update(body).digest('hex');
    return hash === signature;
  }
}
