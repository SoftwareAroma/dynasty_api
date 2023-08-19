import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { Customer as CustomerModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {comparePassword, generateSalt, getDefaultPropertyValue, hashPassword} from '@common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {Ctx} from "@common/context";
import {ConfigService} from "@nestjs/config";
import {CreateCustomerInput} from "@customer/dto/customer.input.dto";
import {LoginCustomerInput} from "@customer/dto/login.input.dto";
import {UpdateCustomerInput} from "@customer/dto/update.input.dto";
import {CreateCartInput} from "@customer/dto/cart.input.dto";
import {UpdateCartInput} from "@customer/dto/cart.update.dto";
import {FileUpload} from "graphql-upload";
import {deleteFile, uploadFile} from "@shared";

@Injectable()
export class CustomerService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * register customer
   * @param createCustomerInput
   * @param context
   */
  async register(createCustomerInput: CreateCustomerInput, context:Ctx): Promise<CustomerModel> {
    // check if email already exists
    const emailExists = await this.prismaService.customer.findUnique({
      where: { email: createCustomerInput.email },
    });
    if (emailExists) {
      throw new HttpException( 'Email already exists', HttpStatus.CONFLICT);
    }
    if (createCustomerInput.userName == null) {
      createCustomerInput.userName = `${createCustomerInput.firstName}`;
    }
    // generate salt
    createCustomerInput.salt = await generateSalt();
    // hash password , add the hashed password to the dto
    createCustomerInput.password = await hashPassword(
        createCustomerInput.password,
        createCustomerInput.salt,
    );

    // create a new user
    const _customer: CustomerModel = await this.prismaService.customer.create({
      data: createCustomerInput,
      include: {Cart: true}
    });
    // generate a token
    const payload = { sub: _customer.id, username: _customer.email, role: _customer.role };
    const token = await this.jwtService.signAsync(payload);
    /// set cookie
    context.res.cookie('access_token', token, {
      domain: this.configService.get<string>('DOMAIN'),
      httpOnly: true,
    });
    return this.exclude(_customer, ['password', 'salt']);
  }

  /**
   * login customer
   * @param loginCustomerDto
   * @param context
   */
  async loginCustomer(loginCustomerDto: LoginCustomerInput, context:Ctx): Promise<CustomerModel> {
    const customer = await this.prismaService.customer.findUnique({
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
    context.res.cookie('access_token', token, {
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
    updateCustomerDto: UpdateCustomerInput,
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
   * @param cartInput
   */
  async addToCart(
      id: string,
      cartInput: CreateCartInput,
  ): Promise<CustomerModel> {
    return this.prismaService.customer.update({
      where: { id: id },
      data: {
        Cart: {
          create: cartInput,
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
      updateCartInput: UpdateCartInput,
  ): Promise<CustomerModel> {
    return this.prismaService.customer.update({
      where: { id: customerId },
      data: {
        Cart: {
          update: {
            where: { id: cartId },
            data: updateCartInput,
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
  async updateAvatar(id: string, file: FileUpload): Promise<boolean> {
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

  /*
   * ##################################################
   * ######### private methods ########################
   * ##################################################
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
