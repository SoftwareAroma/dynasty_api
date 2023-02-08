import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, IsPhoneNumber, IsString } from "class-validator";
import { HydratedDocument, ObjectId } from "mongoose";
import { Exclude, Transform } from "class-transformer";

export type AdminModel = HydratedDocument<Admin>;

@Schema({timestamps: true})
export class Admin {

  @Transform(({value}) => value.toString())
  _id: ObjectId

  @IsEmail()
  @Prop({required: true, unique: true})
  email: string;

  @IsString()
  @Prop({required: true, minlength: 8})
  @Exclude()
  password: string;

  @IsString()
  @Prop({required: true})
  firstName: string;

  @IsString()
  @Prop({required: true})
  lastName: string;

  @IsString()
  @Prop({required: false})
  displayName: string;

  @IsPhoneNumber()
  @Prop({required: false, minlength: 10, maxlength: 15})
  phone: string;

  @IsString()
  @Prop({required: false})
  avatar: string;

  @IsString()
  @Prop({required: false,})
  @Exclude()
  salt: string;

  @IsString()
  @Prop({required: false, default: ["admin", "user"]})
  roles: string[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
