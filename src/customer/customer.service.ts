import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Customer as CustomerModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, generateSalt, hashPassword, getDefaultPropertyValue } from '@shared';
import { CreateCustomerDto } from '@customer/dto/create.dto';
import { UpdateCustomerDto } from '@customer/dto/update.dto';
import { LoginCustomerDto } from '@customer/dto/login.dto';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CloudinaryService } from '@shared/cloudinary/cloudinary.service';
import { Response } from 'express';

@Injectable()
export class CustomerService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) { }

  /// create a customer
  async register(createCustomerDto: CreateCustomerDto, response: Response): Promise<string> {
    const _response = await this.createCustomer(createCustomerDto);
    const payload = { sub: _response.id, username: _response.email };
    // generate a token
    const token = this.jwtService.sign(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
    });
    return token;
  }

  // log in customer
  async loginCustomer(loginCustomerDto: LoginCustomerDto, response: Response): Promise<string> {
    const customer = await this.findOne(
      loginCustomerDto.email,
      loginCustomerDto.password,
    );
    const payload = { username: customer.email, sub: customer.id };
    const token = this.jwtService.sign(payload);
    response.cookie('access_token', token, {
      httpOnly: true,
    });
    return token;
  }

  // get user profile
  async getProfile(id: string): Promise<CustomerModel> {
    return await this.getCustomerProfile(id);
  }

  // get the profile of a  customer (user)
  async validateUser(id: string): Promise<CustomerModel | undefined> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (!customer) {
      // throw an error if email already exists
      return undefined;
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  // validate social user
  async validateSocialUser(
    socialId: string,
    user: any,
  ): Promise<CustomerModel> {
    // check if user already exists in our db, if not create a new user
    const _customer = await this.prismaService.customer.findFirst({
      where: { social: socialId },
    });
    if (!_customer) {
      // create a new user
      return this.prismaService.customer.create({
        data: user,
      });
    }
    return this.exclude(_customer, ['password', 'salt']);
  }

  // get all customers
  async getCustomers(): Promise<CustomerModel[]> {
    const _customers = await this.prismaService.customer.findMany();
    if (_customers == null) {
      return []
    }
    _customers.forEach((_customer) =>
      this.exclude(_customer, ['password', 'salt']),
    );
    return _customers;
  }

  // update customer profile
  async updateProfile(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerModel> {
    return this.updateCustomerProfile(id, updateCustomerDto);
  }

  // reset password
  async resetCustomerPassword(id: string, newPassword: string): Promise<boolean> {
    const _user = await this.prismaService.customer.findUnique({
      where: {
        id: id
      }
    })
    if (!_user) {
      throw new HttpException("No record found for user", HttpStatus.NOT_FOUND);
    }

    // generate salt
    const salt = await generateSalt();
    const hashNewPassword = await hashPassword(newPassword, salt)

    // update user password 
    const _updated = await this.prismaService.customer.update({
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

  /// update the avatar of customer
  async updateAvatar(id: string, file: Express.Multer.File): Promise<boolean> {
    // check if user exist
    const _exists = await this.prismaService.customer.findUnique({
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
      'dynasty_customer_avatar'
    );


    const _customer = await this.prismaService.customer.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
    });
    return !!_customer;
  }

  /// delete the customer avatar
  async deleteAvatar(id: string): Promise<boolean> {
    const _customer: CustomerModel = await this.prismaService.customer.findUnique({
      where: { id: id },
    });

    if (!_customer) {
      throw new HttpException('No Record found for user', HttpStatus.NOT_FOUND);
    }
    const url: URL = new URL(_customer.avatar);
    const pathnameParts: string[] = url.pathname.split('/');
    const publicId: string = pathnameParts[pathnameParts.length - 1].replace(/\.[^/.]+$/, "");

    // console.log(publicId);
    await this.cloudinaryService.deleteFile(publicId);

    const saved = await this.prismaService.customer.update({
      where: { id: id },
      data: {
        avatar:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    return !!saved;
  }

  // delete customer data from database
  async deleteCustomerData(id: string): Promise<boolean> {
    const _customer = await this.prismaService.customer.delete({
      where: { id: id },
    });
    return !!_customer;
  }

  /*
   * ##################################################
   * ######### private methods ########################
   * ##################################################
   * */

  // find one customer (user)
  private async findOne(
    email: string,
    password: string,
  ): Promise<CustomerModel> {
    if (email == null || password == null) {
      throw new HttpException('Please provide a valid email and password', HttpStatus.BAD_REQUEST);
    }
    const customer = await this.prismaService.customer.findUnique({
      where: { email: email },
    });
    if (!customer) {
      throw new HttpException(`No Records found for user with email ${email}`, HttpStatus.NOT_FOUND);
    }
    // compare passwords
    const isPasswordValid = await comparePassword(password, customer.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid email or passowrd', HttpStatus.BAD_REQUEST);
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  // create a new customer
  private async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerModel> {
    // check if email already exists
    const emailExists = await this.prismaService.customer.findUnique({
      where: { email: createCustomerDto.email },
    });
    if (emailExists) {
      // throw an error if email already exists
      throw new HttpException('Email Already Exist', HttpStatus.CONFLICT);
    }
    if (createCustomerDto.userName == null) {
      createCustomerDto.userName = `${createCustomerDto.firstName} ${createCustomerDto.lastName}`;
    }
    if (createCustomerDto.password != null && createCustomerDto.password?.length < 8) {
      throw new HttpException('Password must be at least 8 characters', HttpStatus.BAD_REQUEST);
    }
    // generate salt
    const salt = await generateSalt();
    // add the salt to the dto
    createCustomerDto.salt = salt;
    // hash password
    // add the hashed password to the dto
    createCustomerDto.password = await hashPassword(
      createCustomerDto.password,
      salt,
    );
    // create a new user
    const _customer = await this.prismaService.customer.create({
      data: createCustomerDto,
    });
    return this.exclude(_customer, ['password', 'salt']);
  }


  // update profile
  private async updateCustomerProfile(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerModel> {
    if (id == null) {
      // throw an error if email already exists
      throw new HttpException('Please provide a valid user id', HttpStatus.BAD_REQUEST);
    }
    // first find the admin
    await this.prismaService.customer.update({
      where: { id: id },
      data: updateCustomerDto,
    });
    return this.getProfile(id);
  }

  // get the profile of a  customer (user)
  private async getCustomerProfile(id: string): Promise<CustomerModel> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (!customer) {
      // throw an error if email already exists
      throw new HttpException('No records found for this customer', HttpStatus.NOT_FOUND);
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  /**
   * Exclude properties from a user object
   * @param user
   * @param keys
   * @private
   */
  private exclude<CustomerModel, Key extends keyof CustomerModel>(
    user: CustomerModel,
    keys: Key[],
  ): CustomerModel {
    for (const key of keys) {
      // Populate the value with a default value of its type
      user[key] = getDefaultPropertyValue(user[key]);
    }
    return user;
  }

}
