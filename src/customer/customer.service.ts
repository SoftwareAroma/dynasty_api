import { Injectable } from '@nestjs/common';
import { Customer as CustomerModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, generateSalt, hashPassword } from '@common';
import { CreateCustomerDto } from '@customer/dto/create.dto';
import { UpdateCustomerDto } from '@customer/dto/update.dto';
import { LoginCustomerDto } from '@customer/dto/login.dto';
import { PrismaService } from '@prisma/prisma.service';
import { CloudinaryService } from '@cloudinary/cloudinary.service';

@Injectable()
export class CustomerService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /// create a customer
  async register(createCustomerDto: CreateCustomerDto): Promise<string> {
    const response = await this.createCustomer(createCustomerDto);
    if (response.id) {
      // generate a token
      const payload = { sub: response.id, username: response.email };
      return this.jwtService.sign(payload);
    }
    return response;
  }

  // log in customer
  async loginCustomer(loginCustomerDto: LoginCustomerDto): Promise<string> {
    const customer = await this.validateCustomer(loginCustomerDto);
    const payload = { username: customer.email, sub: customer.id };
    return this.jwtService.sign(payload);
  }

  // validate customer
  async validateCustomer(
    loginCustomerDto: LoginCustomerDto,
  ): Promise<CustomerModel> {
    const customer = await this.findOne(
      loginCustomerDto.email,
      loginCustomerDto.password,
    );
    if (customer === undefined) {
      return undefined;
    }
    return customer;
  }

  // get user profile
  async getProfile(id: string): Promise<CustomerModel> {
    const customer = await this.getCustomerProfile(id);
    if (customer === undefined) {
      return undefined;
    }
    return customer;
  }

  // get all customers
  async getCustomers(): Promise<CustomerModel[]> {
    const _customers = await this.prismaService.customer.findMany();
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

  /// update the avatar of customer
  async updateAvatar(id: string, file: Express.Multer.File): Promise<boolean> {
    const _uploadFile = await this.cloudinaryService.uploadFile(
      file,
      'customer_avatar',
      `${file.originalname?.split('.')[0]}`,
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
    const _customer = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (_customer != null) {
      _customer.avatar =
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    }
    const saved = await this.prismaService.customer.update({
      where: { id: id },
      data: {
        avatar: _customer.avatar,
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
  ): Promise<CustomerModel | any> {
    const customer = await this.prismaService.customer.findUnique({
      where: { email: email },
    });
    if (!customer) {
      return undefined;
    }
    // compare passwords
    const isPasswordValid = await comparePassword(password, customer.password);
    if (!isPasswordValid) {
      return null;
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  // create a new customer
  private async createCustomer(
    createCustomerDto: any,
  ): Promise<CustomerModel | any> {
    // check if email already exists
    const emailExists = await this.prismaService.customer.findUnique({
      where: { email: createCustomerDto.email },
    });
    if (emailExists) {
      return {
        status: 'error',
        message: 'Email already exists',
      };
    }
    if (createCustomerDto.displayName == null) {
      createCustomerDto.displayName = `${createCustomerDto.firstName} ${createCustomerDto.lastName}`;
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

  // validate social user
  async validateSocialUser(
    socialId: string,
    user: any,
  ): Promise<CustomerModel | any> {
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

  // update profile
  private async updateCustomerProfile(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerModel | any> {
    // first find the admin
    await this.prismaService.customer.update({
      where: { id: id },
      data: updateCustomerDto,
    });
    return this.getProfile(id);
  }

  // get the profile of a  customer (user)
  private async getCustomerProfile(id: string): Promise<CustomerModel | any> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: id },
    });
    if (!customer) {
      return undefined;
    }
    return this.exclude(customer, ['password', 'salt']);
  }

  // Exclude keys from user
  private exclude<CustomerModel, Key extends keyof CustomerModel>(
    user: CustomerModel,
    keys: Key[],
  ): Omit<CustomerModel, Key> {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }
}
