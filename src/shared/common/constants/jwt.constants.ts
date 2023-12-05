import {JWT_EXPIRES_IN, JWT_SECRET} from "@shared/environment";

export const jwtConstants = {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
}