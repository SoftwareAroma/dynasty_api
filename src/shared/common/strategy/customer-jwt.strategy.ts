import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {CustomerService} from '@customer/customer.service';
import {Customer as CustomerModel} from "@prisma/client";
import {JWT_SECRET} from "@shared/common";

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private customerService: CustomerService,
  ) {
    super({
      jwtFromRequest: (request: Request) => {
        if (!request || !request.cookies) {
          return null;
        }
        else if (request.cookies['access_token'] != undefined || request.cookies['access_token'] != null) {
          return request.cookies['access_token'];
        }else{
          return request.headers.cookie;
        }
      },
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }
  async validate(payload: any):Promise<CustomerModel>{
    return await this.customerService.getProfile(payload.sub);
  }
}
