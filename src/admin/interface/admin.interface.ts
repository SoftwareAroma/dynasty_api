import { Document } from "mongoose";

interface IAdmin extends Document{
  readonly _id?: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly password?: string;
  readonly lastName?: string;
  readonly displayName?: string;
  readonly avatar?: string | any;
  readonly roles?: string[];
  readonly salt?: string[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IAdmin;