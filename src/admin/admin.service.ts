import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from '@admin/dto/create.dto';
import { comparePassword, generateSalt, hashPassword } from '@common';
import { LoginAdminDto } from '@admin/dto/login.dto';
import { UpdateAdminDto } from '@admin/dto/update.dto';
import { PrismaService } from '@prisma/prisma.service';
import { Admin as AdminModel } from '@prisma/client';
import { CloudinaryService } from '@cloudinary/cloudinary.service';

@Injectable()
export class AdminService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /// create an admin
  async register(createAdminDto: CreateAdminDto): Promise<string> {
    const response = await this.createAdmin(createAdminDto);
    if (response.id) {
      // generate a token
      const payload = { sub: response.id, username: response.email };
      return this.jwtService.sign(payload);
    }
    return response;
  }

  // log in admin
  async loginAdmin(loginAdminDto: LoginAdminDto): Promise<string> {
    const admin = await this.validateAdmin(loginAdminDto);
    const payload = { username: admin.email, sub: admin.id };
    return this.jwtService.sign(payload);
  }

  // validate client
  async validateAdmin(loginAdminDto: LoginAdminDto): Promise<AdminModel> {
    const admin = await this.findOne(
      loginAdminDto.email,
      loginAdminDto.password,
    );
    if (admin === undefined) {
      return undefined;
    }
    return admin;
  }

  // get all customers
  async getAdmins(): Promise<AdminModel[]> {
    const _admins = await this.prismaService.admin.findMany();
    _admins.forEach((_admin) => this.exclude(_admin, ['password', 'salt']));
    return _admins;
  }

  // get user profile
  async getProfile(id: string): Promise<AdminModel> {
    const client = await this.getAdminProfile(id);
    if (client === undefined) {
      return undefined;
    }
    return client;
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
    const _uploadFile = await this.cloudinaryService.uploadFile(
      file,
      'admin_avatar',
      `${file.originalname?.split('.')[0]}`,
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
    const saved = await this.prismaService.admin.update({
      where: { id: id },
      data: {
        avatar:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    return !!saved;
  }

  // delete client data from database
  async deleteAdminData(id: string): Promise<boolean> {
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
    const admin = await this.prismaService.admin.findUnique({
      where: {
        email: email,
      },
    });
    // compare passwords
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }
    return this.exclude(admin, ['password', 'salt']);
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
      return {
        status: 'error',
        message: 'Email already exists',
      };
    }
    if (createAdminDto.displayName == null) {
      createAdminDto.displayName = `${createAdminDto.firstName} ${createAdminDto.lastName}`;
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
        updateClientDto.displayName = `${updateClientDto.firstName} ${updateClientDto.lastName}`;
      }
      if (updateClientDto.firstName && updateClientDto.lastName.length < 0) {
        updateClientDto.displayName = `${updateClientDto.firstName} ${_admin.lastName}`;
      }
      if (updateClientDto.firstName.length < 0 && updateClientDto.lastName) {
        updateClientDto.displayName = `${_admin.firstName} ${updateClientDto.lastName}`;
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
    const _admin = await this.prismaService.admin.findUnique({
      where: {
        id: id,
      },
    });
    return this.exclude(_admin, ['password', 'salt']);
  }

  // Exclude keys from user
  private exclude<AdminModel, Key extends keyof AdminModel>(
    user: AdminModel,
    keys: Key[],
  ): Omit<AdminModel, Key> {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }
}
