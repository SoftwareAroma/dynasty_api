import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {jwtConstants, Role} from '@common';
import {CustomerService} from '@customer/customer.service';
import {AdminService} from '@admin/admin.service';
import {Admin as AdminModel, Customer as CustomerModel} from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private customerService: CustomerService,
    private adminService: AdminService,
  ) {
    super({
      // get access token form request object
      jwtFromRequest: (request: Request) => {
        // console.log("Request Cookie ", request.headers.cookie);
        // console.log("Request Cookie ", request.headers.cookie);
        if (!request || !request.cookies) {
          return null;
        }
        else if (request.cookies['access_token'] != undefined || request.cookies['access_token'] != null) {
          // console.log("Request Cookie ", request.cookies['access_token']);
          return request.cookies['access_token'];
        }else{
          // console.log("Request Cookie Header ", request.headers.cookie);
          return request.headers.cookie;
        }

      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: any):Promise<AdminModel | CustomerModel>{
    // console.log(payload);
    if(payload.role == Role.ADMIN){
      // console.log("Admin Role ", payload.role);
      return await this.adminService.getProfile(payload.sub);
    }else{
      // console.log("Else Role ", payload.role);
      // console.log("Else id ", payload.sub);
      return await this.customerService.getProfile(payload.sub);
    }
  }
}
