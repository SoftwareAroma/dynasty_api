import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentService } from '@payment/payment.service';
import { Request } from 'express';

@Controller({ path: 'payment', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initialize')
  async initializeTransaction(@Body() data: any): Promise<any> {
    return await this.paymentService.initializeTransaction(data);
  }

  @Post('webhook')
  handlePaystackWebhook(@Req() request: Request, @Body() body: any) {
    const signature: string =
      request?.headers['x-paystack-signature'].toString();
    const isValid = this.paymentService.verifyWebhookSignature(signature, body);

    if (isValid) {
      // handle webhook event
      console.log(request.body);
    } else {
      // handle invalid signature
      console.log(request.body);
    }
  }
}
