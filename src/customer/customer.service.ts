import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { Customer as CustomerModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  PrismaService,
  comparePassword,
  generateSalt,
  getDefaultPropertyValue,
  hashPassword,
  deleteFile, uploadFile
} from '@shared';
import {ConfigService} from "@nestjs/config";
import {Response} from 'express';
import {CreateCartDto, CreateCustomerDto} from "@customer/dto/create.dto";
import {LoginCustomerDto} from "@customer/dto/login.dto";
import {UpdateCartDto, UpdateCustomerDto} from "@customer/dto/update.dto";

@Injectable()
export class CustomerService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * register customer
   * @param createCustomerDto
   * @param response
   */
  async register(createCustomerDto: CreateCustomerDto, response:Response): Promise<CustomerModel> {
    // check if email already exists
    const emailExists = await this.prismaService.customer.findUnique({
      where: { email: createCustomerDto.email },
    });
    if (emailExists) {
      throw new HttpException( 'Email already exists', HttpStatus.CONFLICT);
    }
    if (createCustomerDto.userName == null) {
      createCustomerDto.userName = `${createCustomerDto.firstName}`;
    }
    // generate salt
    createCustomerDto.salt = await generateSalt();
    // hash password , add the hashed password to the dto
    createCustomerDto.password = await hashPassword(
        createCustomerDto.password,
        createCustomerDto.salt,
    );

    // create a new user
    const _customer: CustomerModel = await this.prismaService.customer.create({
      data: createCustomerDto,
      include: {Cart: true}
    });
    // generate a token
    const payload = { sub: _customer.id, username: _customer.email, role: _customer.role };
    const token = await this.jwtService.signAsync(payload);
    /// set cookie
    response.cookie('access_token', token, {
      domain: this.configService.get<string>('DOMAIN'),
      httpOnly: true,
    });
    return this.exclude(_customer, ['password', 'salt']);
  }

  /**
   * login customer
   * @param loginCustomerDto
   * @param response
   */
  async loginCustomer(loginCustomerDto: LoginCustomerDto, response:Response): Promise<CustomerModel> {
    const customer: CustomerModel = await this.prismaService.customer.findUnique({
      where: { email: loginCustomerDto.email },
      include: {Cart: true}
    });
    if (!customer) {
      throw new HttpException('No record found for this email', HttpStatus.BAD_REQUEST);
    }
    // compare passwords
    const isPasswordValid = await comparePassword(loginCustomerDto.password, customer.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
    // generate a token
    const payload = { username: customer.email, sub: customer.id, role: customer.role  };
    const token = await this.jwtService.signAsync(payload);
    /// set cookie
    response.cookie('access_token', token, {
      domain: this.configService.get<string>('DOMAIN'),
      httpOnly: true,
    });
    return this.exclude(customer, ['password', 'salt']);
  }
  

  /**
   * get customer by id
   * @param id
   */
  async getProfile(id: string): Promise<CustomerModel> {
    // console.log("Customer Id ", id);
    const customer: CustomerModel = await this.prismaService.customer.findUnique({
      where: { id: id },
      include: {Cart: true}
    });
    if (!customer) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  /**
   * get all customers
   */
  async getCustomers(): Promise<CustomerModel[]> {
    const _customers: CustomerModel[] = await this.prismaService.customer.findMany({
        include: {Cart: true}
    });
    _customers.forEach((_customer) =>
      this.exclude(_customer, ['password', 'salt']),
    );
    return _customers;
  }

  /**
   * update profile
   * @param id
   * @param updateCustomerDto
   */
  async updateProfile(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerModel> {
    const updated: CustomerModel = await this.prismaService.customer.update({
      where: { id: id },
      data: updateCustomerDto,
    });
    return this.exclude(updated, ['password', 'salt']);
  }

  /**
   * add to cart
   * @param id
   * @param cartDto
   */
  async addToCart(
      id: string,
      cartDto: CreateCartDto,
  ): Promise<CustomerModel> {
    return this.prismaService.customer.update({
      where: { id: id },
      data: {
        Cart: {
          create: cartDto,
        },
      },
      include: {
        Cart: true,
      },
    });
  }

  /// update cart
  async updateCart(
      customerId: string,
      cartId: string,
      updateCartDto: UpdateCartDto,
  ): Promise<CustomerModel> {
    return this.prismaService.customer.update({
      where: { id: customerId },
      data: {
        Cart: {
          update: {
            where: { id: cartId },
            data: updateCartDto,
          },
        },
      },
      include: {
        Cart: true,
      },
    });
  }

  /**
   * update avatar
   * @param id
   * @param file
   */
  async updateAvatar(id: string, file: Express.Multer.File): Promise<boolean> {
    // console.log(`File name > ${file.filename?.split('.')[0]}`);
    const _uploadFile = await uploadFile(
        file,
        `${file.filename?.split('.')[0]}`,
        'dynasty/customer/avatar',
        'dynasty_customer_avatar'
    );

    // console.log(`public id > ${_uploadFile}`);
    const _customer : CustomerModel = await this.prismaService.customer.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
    });
    return !!_customer;
  }

  /**
   * delete avatar
   * @param id
   */
  async deleteAvatar(id: string): Promise<boolean> {
    const _customer: CustomerModel = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (!_customer) {
      throw new HttpException('No Record found for the this id', HttpStatus.NOT_FOUND);
    }
    const url : URL = new URL(_customer.avatar);
    const pathnameParts : string[] = url.pathname.split('/');
    const publicId : string = pathnameParts[pathnameParts.length - 1].replace(/\.[^/.]+$/, "");

    // console.log(publicId);
    await deleteFile(publicId);

    const saved : CustomerModel = await this.prismaService.customer.update({
      where: { id: id },
      data: {
        avatar:
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    return !!saved;
  }

  /**
   * delete customer
   * @param id
   */
  async deleteCustomerData(id: string): Promise<boolean> {
    const _customerData: CustomerModel = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (!_customerData) {
      throw new HttpException('No Record found for the this id', HttpStatus.NOT_FOUND);
    }
    const url : URL = new URL(_customerData.avatar);
    const pathnameParts : string[] = url.pathname.split('/');
    const publicId : string = pathnameParts[pathnameParts.length - 1].replace(/\.[^/.]+$/, "");

    // console.log(publicId);
    await deleteFile(publicId);
    const _customer : CustomerModel = await this.prismaService.customer.delete({
      where: { id: id },
    });
    return !!_customer;
  }

  /**
   * --------------------------------------------------
   * ------------ private methods ---------------------
   * --------------------------------------------------
   * */

  /// validate social user
  // async validateSocialUser(
  //   socialId: string,
  //   user: any,
  // ): Promise<CustomerModel | any> {
  //   // check if user already exists in our db, if not create a new user
  //   const _customer = await this.prismaService.customer.findFirst({
  //     where: { social: socialId },
  //   });
  //   if (!_customer) {
  //     // create a new user
  //     return this.prismaService.customer.create({
  //       data: user,
  //     });
  //   }
  //   return this.exclude(_customer, ['password', 'salt']);
  // }


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
