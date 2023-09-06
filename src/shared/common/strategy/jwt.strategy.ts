import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {CustomerService} from '@customer/customer.service';
import {AdminService} from '@admin/admin.service';
import {Admin as AdminModel, Customer as CustomerModel} from "@prisma/client";
import {JWT_SECRET} from "@shared/common/environment";
import {Role} from "@shared/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private customerService: CustomerService,
    private adminService: AdminService,
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
  async validate(payload: any):Promise<AdminModel | CustomerModel>{
    if(payload.role == Role.ADMIN){
      return await this.adminService.getProfile(payload.sub);
    }else{
      return await this.customerService.getProfile(payload.sub);
    }
  }
}
