import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {AdminService} from '@admin/admin.service';
import {Admin as AdminModel} from "@prisma/client";
import {JWT_SECRET} from "@common";

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
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
  async validate(payload: any):Promise<AdminModel>{
    return await this.adminService.getProfile(payload.sub);
  }
}
