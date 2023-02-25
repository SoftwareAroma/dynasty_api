import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { jwtConstants } from '@common';
import { CustomerService } from '@customer/customer.service';
import { AdminService } from '@admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private customerService: CustomerService,
    private adminService: AdminService,
  ) {
    super({
      // get access token form request object
      jwtFromRequest: (request: Request) => {
        if (!request || !request.cookies) return null;
        return request.cookies['access_token'];
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: any) {
    const _user = await this.customerService.getProfile(payload.sub);
    if (_user?.id != undefined) {
      return {
        _id: _user.id,
        role: _user.role,
        userId: _user.id,
        username: _user.email,
      };
    } else {
      const _admin = await this.adminService.getProfile(payload.sub);
      if (_admin?.id == payload.sub) {
        return {
          _id: _admin.id,
          role: _admin.role,
          userId: _admin.id,
          username: _admin.email,
        };
      }
    }
  }
}
