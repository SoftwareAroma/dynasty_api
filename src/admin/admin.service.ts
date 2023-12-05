import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from '@admin/dto/create.dto';
import { comparePassword, generateSalt, hashPassword, getDefaultPropertyValue } from '@shared';
import { LoginAdminDto } from '@admin/dto/login.dto';
import { UpdateAdminDto } from '@admin/dto/update.dto';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Admin as AdminModel } from '@prisma/client';
import { CloudinaryService } from '@shared/cloudinary/cloudinary.service';
import { Response } from 'express';

@Injectable()
export class AdminService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) { }

  /// create an admin
  async register(createAdminDto: CreateAdminDto, response: Response): Promise<string> {
    const _response = await this.createAdmin(createAdminDto);
    // generate a token
    const payload = { sub: _response.id, username: _response.email };
    const token = this.jwtService.sign(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
    });
    return token;
  }

  // log in admin
  async loginAdmin(loginAdminDto: LoginAdminDto, response: Response,): Promise<string> {
    const admin = await this.findOne(
      loginAdminDto.email,
      loginAdminDto.password,
    );
    const payload = { username: admin.email, sub: admin.id };
    const token = this.jwtService.sign(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
    });
    return token;
  }

  // get all customers
  async getAdmins(): Promise<AdminModel[]> {
    const _admins = await this.prismaService.admin.findMany();
    if (_admins == null) {
      return []
    }
    _admins.forEach((_admin) => this.exclude(_admin, ['password', 'salt']));
    return _admins;
  }

  // get user profile
  async getProfile(id: string): Promise<AdminModel> {
    return await this.getAdminProfile(id);
  }

  async validateAdmin(id: string): Promise<AdminModel | undefined> {
    const admin = await this.prismaService.admin.findUnique({
      where: { id: id },
    });
    if (!admin) {
      // throw an error if email already exists
      return undefined;
    }
    return this.exclude(admin, ['password', 'salt']);
  }

  // update client profile
  async updateProfile(
    id: string,
    updateClientDto: UpdateAdminDto,
  ): Promise<AdminModel> {
    return this.updateAdminProfile(id, updateClientDto);
  }

  /// update the avatar of customer
  async updateAvatar(id: string, file: Express.Multer.File): Promise<boolean> {

    // check if user exist
    const _exists = await this.prismaService.admin.findUnique({
      where: {
        id: id,
      }
    })

    if (!_exists) {
      throw new HttpException('No Record found for user', HttpStatus.NOT_FOUND);
    }

    const _uploadFile = await this.cloudinaryService.uploadFile(
      file,
      `${file.filename?.split('.')[0]}`,
      'dynasty/admin/avatar',
      'dynasty_admin_avatar'
    );

    const _admin = await this.prismaService.admin.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
    });
    return !!_admin;
  }

  /// delete the customer avatar
  async deleteAvatar(id: string): Promise<boolean> {
    const _admin: AdminModel = await this.prismaService.admin.findUnique({
      where: { id: id },
    });

    if (!_admin) {
      throw new HttpException('No Record found for user', HttpStatus.NOT_FOUND);
    }
    const url: URL = new URL(_admin.avatar);
    const pathnameParts: string[] = url.pathname.split('/');
    const publicId: string = pathnameParts[pathnameParts.length - 1].replace(/\.[^/.]+$/, "");

    // console.log(publicId);
    await this.cloudinaryService.deleteFile(publicId);

    const saved = await this.prismaService.admin.update({
      where: { id: id },
      data: {
        avatar:
          'https://res.cloudinary.com/dynasty-urban-style/image/upload/v1701686160/defaults/account_afhqmj.png',
      },
    });
    return !!saved;
  }

  async resetAdminPassword(id: string, newPassword: string): Promise<boolean> {
    const _admin = await this.prismaService.admin.findUnique({
      where: {
        id: id
      }
    })
    if (!_admin) {
      throw new HttpException("No record found for user", HttpStatus.NOT_FOUND);
    }

    // generate salt
    const salt = await generateSalt();
    const hashNewPassword = await hashPassword(newPassword, salt)

    // update user password 
    const _updated = await this.prismaService.admin.update({
      where: {
        id: id
      },
      data: {
        salt: salt,
        password: hashNewPassword,
      }
    })

    return !!_updated;
  }


  // delete client data from database
  async deleteAdminData(id: string): Promise<boolean> {
    if (id == null) {
      throw new HttpException(`No record found for this admin`, HttpStatus.BAD_REQUEST);
    }
    const _admin = await this.prismaService.admin.delete({
      where: { id: id },
    });
    return !!_admin;
  }

  /*
   * ##################################################
   * ######### private methods ########################
   * ##################################################
   * */

  // find one client (user)
  private async findOne(
    email: string,
    password: string,
  ): Promise<AdminModel | any> {
    if (email == null || password == null) {
      throw new HttpException(`Please provide a valid email and password`, HttpStatus.BAD_REQUEST);
    }
    const _admin = await this.prismaService.admin.findUnique({
      where: {
        email: email,
      },
    });
    // if _admin is null throw an error with no user found for this email
    if (_admin == null) {
      throw new HttpException(`No Record found for user with email ${email}`, HttpStatus.NOT_FOUND);
    }

    // compare passwords
    const isPasswordValid = await comparePassword(password, _admin.password);
    if (!isPasswordValid) {
      throw new HttpException(`Invalid email or password`, HttpStatus.BAD_REQUEST);
    }
    return this.exclude(_admin, ['password', 'salt']);
  }

  // create a new admin
  private async createAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<AdminModel | any> {
    // check if email already exists
    const emailExists = await this.prismaService.admin.findUnique({
      where: { email: createAdminDto.email },
    });
    if (emailExists) {
      // throw an error if email already exists
      throw new HttpException('Email Already Exist. Consider Login in', HttpStatus.CONFLICT);
    }
    if (createAdminDto.userName == null) {
      createAdminDto.userName = `${createAdminDto.firstName}`;
    }
    if (createAdminDto.password != null && createAdminDto.password?.length < 8) {
      throw new HttpException('Password must be at least 8 characters', HttpStatus.BAD_REQUEST);
    }

    if (createAdminDto.userName == null) {
      createAdminDto.userName = `${createAdminDto.firstName} ${createAdminDto.lastName}`;
    }
    // generate salt
    const salt = await generateSalt();
    // add the salt to the dto
    createAdminDto.salt = salt;
    // hash password
    // add the hashed password to the dto
    createAdminDto.password = await hashPassword(createAdminDto.password, salt);
    // create a new user
    const _admin = await this.prismaService.admin.create({
      data: createAdminDto,
    });
    return this.exclude(_admin, ['password', 'salt']);
  }

  // update profile
  private async updateAdminProfile(
    id: string,
    updateClientDto: UpdateAdminDto,
  ): Promise<AdminModel> {
    // first find the admin
    const _admin = await this.prismaService.admin.findUnique({
      where: { id: id },
    });
    if (_admin != null) {
      // find and update the client
      if (updateClientDto.firstName && updateClientDto.lastName) {
        updateClientDto.userName = `${updateClientDto.firstName} ${updateClientDto.lastName}`;
      }
      if (updateClientDto.firstName && updateClientDto.lastName.length < 0) {
        updateClientDto.userName = `${updateClientDto.firstName} ${_admin.lastName}`;
      }
      if (updateClientDto.firstName.length < 0 && updateClientDto.lastName) {
        updateClientDto.userName = `${_admin.firstName} ${updateClientDto.lastName}`;
      }
      // if password is not '' then update the password as well
      if (updateClientDto.password.length > 6) {
        updateClientDto.password = await hashPassword(
          updateClientDto.password,
          _admin.salt,
        );
      }
      await this.prismaService.admin.update({
        where: { id: id },
        data: updateClientDto,
      });
      return this.getProfile(id);
    }
  }

  // get the profile of a  client (user)
  private async getAdminProfile(id: string): Promise<AdminModel | any> {
    if (id == null) {
      throw new HttpException(`Invalid admin id`, HttpStatus.BAD_REQUEST);
    }
    const _admin = await this.prismaService.admin.findUnique({
      where: {
        id: id,
      },
    });
    if (_admin == null) {
      throw new HttpException(`No record found for this user`, HttpStatus.NOT_FOUND);
    }
    return this.exclude(_admin, ['password', 'salt']);
  }

  /**
    * Exclude properties from a user object
    * @param user
    * @param keys
    * @private
    */
  private exclude<AdminModel, Key extends keyof AdminModel>(
    user: AdminModel,
    keys: Key[],
  ): AdminModel {
    for (const key of keys) {
      // Populate the value with a default value of its type
      user[key] = getDefaultPropertyValue(user[key]);
    }
    return user;
  }
}
