import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {comparePassword, generateSalt, getDefaultPropertyValue, hashPassword} from '@common';
import {PrismaService} from '@shared/prisma/prisma.service';
import {CreateAdminInput} from "@admin/dto/admin.input.dto";
import {LoginAdminInput} from "@admin/dto/login.input.dto";
import {UpdateAdminInput} from "@admin/dto/update.input.dto";
import {Ctx} from "@common/context";
import {ConfigService} from "@nestjs/config";
import {Admin as AdminModel} from "@prisma/client";
import {uploadFile} from "@shared";
import {FileUpload} from "graphql-upload";

@Injectable()
export class AdminService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * create admin
   * @param createAdminInput
   * @param context
   */
  async register(createAdminInput: CreateAdminInput, context: Ctx): Promise<AdminModel> {
    // check if email already exists
    const emailExists = await this.prismaService.admin.findUnique({
      where: { email: createAdminInput.email },
    });
    if (emailExists) {
      // throw an error if email already exists
      throw new HttpException('Email Already Exist.', HttpStatus.CONFLICT);
    }
    if (createAdminInput.userName == null) {
      createAdminInput.userName = `${createAdminInput.firstName}`;
    }
    if(createAdminInput.password != null && createAdminInput.password?.length < 6) {
      throw new HttpException('Password must be at least 6 characters', HttpStatus.BAD_REQUEST);
    }
    // generate salt
    createAdminInput.salt = await generateSalt();
    // hash password add the hashed password to the Input
    createAdminInput.password = await hashPassword(createAdminInput.password, createAdminInput.salt);
    // create a new user
    const admin:AdminModel = await this.prismaService.admin.create({
      data: createAdminInput,
    });
    // generate a token
    const payload = { sub: admin.id, username: admin.email, role: admin.role  };
    const token = await this.jwtService.signAsync(payload);
    /// set cookie
    context.res.cookie('access_token', token, {
      domain: this.configService.get<string>('DOMAIN'),
      httpOnly: true,
    });
    return this.exclude(admin, ['password', 'salt']);
  }

  /**
   * login admin
   * @param loginAdminInput
   * @param context
   */
  async loginAdmin(loginAdminInput: LoginAdminInput, context: Ctx): Promise<AdminModel> {
    const admin = await this.findOne(
        loginAdminInput.email,
        loginAdminInput.password,
    );
    const payload = { username: admin.email, sub: admin.id, role: admin.role };
    const token = await this.jwtService.signAsync(payload);
    context.res.cookie('access_token', token, {
      domain: this.configService.get<string>('DOMAIN'),
      httpOnly: true,
    });
    return this.exclude(admin, ['password', 'salt']);
  }

  /**
   * get all admins
   */
  async getAdmins(): Promise<AdminModel[]> {
    const _admins:AdminModel[] = await this.prismaService.admin.findMany();
    _admins.forEach((_admin:AdminModel) => this.exclude(_admin, ['password', 'salt']));
    return _admins;
  }

  /**
   * get admin profile
   * @param id
   */
  async getProfile(id: string): Promise<AdminModel> {
    const _admin = await this.prismaService.admin.findUnique({where: {id: id}});
    if (!_admin) {
      throw new HttpException('No Record found for the this id', HttpStatus.NOT_FOUND);
    }
    return this.exclude(_admin, ['password', 'salt']);
  }

  /**
   * update admin profile
   * @param id
   * @param updateAdminInput
   */
  async updateProfile(
    id: string,
    updateAdminInput: UpdateAdminInput,
  ): Promise<AdminModel> {
    // console.log(updateAdminInput)
    // first find the admin
    const _admin = await this.prismaService.admin.findUnique({
      where: { id: id },
    });
    if (!_admin) {
      throw new HttpException('No Record found for the this id', HttpStatus.NOT_FOUND);
    }
    if(updateAdminInput.password != null && updateAdminInput.password?.length < 6) {
      throw new HttpException('Password must be at least 6 characters', HttpStatus.BAD_REQUEST);
    }
    // if password is not '' then update the password as well
    if (updateAdminInput.password?.length >= 6) {
      updateAdminInput.password = await hashPassword(
          updateAdminInput.password,
          _admin.salt,
      );
    }
    const updated = await this.prismaService.admin.update({
      where: {id: id},
      data: updateAdminInput,
    });
    return this.exclude(updated, ['password', 'salt']);
  }

  /**
   * update admin avatar
   * @param id
   * @param file
   */
  async updateAvatar(id: string, file: FileUpload): Promise<boolean> {
    const _uploadFile = await uploadFile(
        file,
        `${file.filename?.split('.')[0]}`,
        'dynasty/admin/avatar',
        'dynasty_admin_avatar'
    );

    const _admin: AdminModel = await this.prismaService.admin.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
    });
    return !!_admin;
  }

  /**
   * delete admin avatar
   * @param id
   */
  async deleteAvatar(id: string): Promise<boolean> {
    const saved : AdminModel = await this.prismaService.admin.update({
      where: { id: id },
      data: {
        avatar:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    return !!saved;
  }

  /**
   * delete admin data
   * @param id
   */
  async deleteAdminData(id: string): Promise<boolean> {
    const _admin: AdminModel = await this.prismaService.admin.delete({
      where: { id: id },
    });
    return !!_admin;
  }

  /*
   * -------------------------------------------------------
   * ############## private methods ########################
   * -------------------------------------------------------
   * */

  /**
   * Find a user by email and password
   * @param email
   * @param password
   * @private
   */
  private async findOne(
    email: string,
    password: string,
  ): Promise<AdminModel> {
    const admin: AdminModel = await this.prismaService.admin.findUnique({
      where: {
        email: email,
      },
    });
    if(!admin) {
      throw new HttpException('No Record found for the this email', HttpStatus.NOT_FOUND);
    }
    // compare passwords
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid or Incorrect password', HttpStatus.BAD_REQUEST);
    }
    return this.exclude(admin, ['password', 'salt']);
  }

  /**
   * Exclude the given keys from the user object
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


