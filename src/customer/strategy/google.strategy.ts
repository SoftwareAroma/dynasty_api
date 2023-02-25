
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { CustomerService } from "@customer/customer.service";

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {

    constructor(private customerService: CustomerService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: process.env.GOOGLE_CALBACK_URL,
            scope: ['email', 'profile'],
        });
    }

    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos, id, displayName } = profile;
        const user = {
            socialId: id,
            username: emails[0].value,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            displayName: displayName,
            image: photos[0].value,
        }
        // check if user already exists in our db, if not create a new user
        const _user = await this.customerService.validateSocialUser(id, user);
        done(null, _user);
    }
}