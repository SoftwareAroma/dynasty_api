import { Injectable } from "@nestjs/common";
import { Admin, AdminModel } from "@admin/schema/admin.schema";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { CreateAdminDto } from "@admin/dto/create.dto";
import { comparePassword, generateSalt, hashPassword } from "@common";
import IAdmin from "@admin/interface/admin.interface";
import { LoginAdminDto } from "@admin/dto/login.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminModel>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  /// create an admin
  async register(createAdminDto: CreateAdminDto): Promise<string>{
    try{
      const response = await this.createAdmin(createAdminDto)
      if(response._id){
        // generate a token
        const payload = { sub: response._id, username: response.email };
        return this.jwtService.sign(payload);
      }
    }catch (error){
      return error;
    }
  }

  // log in admin
  async loginAdmin(user:Admin|any): Promise<string> {
    try{
      const payload = { username: user.email, sub: user._id };
      return this.jwtService.sign(payload);
    }catch(error){
      return error;
    }
  }

  // validate client
  async validateAdmin(loginAdminDto: LoginAdminDto):Promise<Admin>{
    const admin = await this.findOne( loginAdminDto.email, loginAdminDto.password);
    if(admin === undefined) {
      return undefined;
    }
    return admin;
  }

  // get user profile
  async getProfile(id: string): Promise<Admin>{
    const client = await this.getAdminProfile(id);
    if(client === undefined) {
      return undefined;
    }
    return client;
  }

  // delete client data from database
  async deleteAdminData(id:string): Promise<boolean>{
    const _admin = await this.adminModel.findOneAndDelete({_id: id});
    return !!_admin;
  }

  /*
  * ##################################################
  * ######### private methods ########################
  * ##################################################
  * */

  // find one client (user)
  private async findOne(email: string, password:string): Promise<Admin> {
    try{
      const admin = await this.adminModel.findOne({email: email});
      if(!admin) {
        return undefined;
      }
      // compare passwords
      const isPasswordValid = await comparePassword(password, admin.password);
      if(!isPasswordValid) {
        return null;
      }
      return admin;
    }catch(error){
      return error;
    }
  }


  // create a new admin
  private async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin|any> {
    try{
      // check if email already exists
      const emailExists = await this.adminModel.findOne({email: createAdminDto.email});
      if(emailExists){
        return {
          status: "error",
          message: "Email already exists"
        }
      }
      if(createAdminDto.displayName == null){
        createAdminDto.displayName = createAdminDto.firstName + ' ' + createAdminDto.lastName;
      }
      // generate salt
      const salt = await generateSalt();
      // add the salt to the dto
      createAdminDto.salt = salt;
      // hash password
      // add the hashed password to the dto
      createAdminDto.password = await hashPassword(createAdminDto.password, salt);
      // create a new user
      const createdAdmin = new this.adminModel(createAdminDto);
      return await createdAdmin.save();
    }catch(error){
      return error;
    }
  }

  // update profile
  private async updateAdminProfile(id: string, updateClientDto: CreateAdminDto): Promise<Admin>{
    try{
      // first find the admin
      const _admin = await this.adminModel.findOne({_id: id});
      if(_admin != null){
        // find and update the client
        if(updateClientDto.firstName && updateClientDto.lastName){
          updateClientDto.displayName = updateClientDto.firstName + ' ' + updateClientDto.lastName;
        }
        if(updateClientDto.firstName && updateClientDto.lastName.length < 0){
          updateClientDto.displayName = updateClientDto.firstName + ' ' + _admin.lastName;
        }
        if(updateClientDto.firstName.length < 0 && updateClientDto.lastName){
          updateClientDto.displayName = _admin.firstName + ' ' + updateClientDto.lastName;
        }
        // if password is not '' then update the password as well
        if(updateClientDto.password.length > 6){
          updateClientDto.password = await hashPassword(updateClientDto.password, _admin.salt);
        }
        return await this.adminModel.findOneAndUpdate({ _id: id }, updateClientDto, { new: true });
      }
    }catch(error){
      return error;
    }
  }

  // get the profile of a  client (user)
  private async getAdminProfile(id: string): Promise<Admin> {
    try{
      const admin = await this.adminModel.findOne({_id: id});
      if(!admin) {
        return undefined;
      }
      return admin;
    }catch(error){
      return undefined;
    }
  }
}
