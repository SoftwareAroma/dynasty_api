import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerService } from '@customer/customer.service';
import { Response } from 'express';
import { UpdateCartDto, UpdateCustomerDto } from '@customer/dto/update.dto';
import { Customer as CustomerModel } from '@prisma/client';
import { LoginCustomerDto } from '@customer/dto/login.dto';
import { CreateCartDto, CreateCustomerDto } from '@customer/dto/create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  API_URI_VERSION,
  CheckPolicies,
  DeleteCustomerPolicyHandler,
  JwtAuthGuard,
  ReadCustomerPolicyHandler,
  UpdateCustomerPolicyHandler
} from "@shared";
import { PoliciesGuard } from "@shared/secure/policy.guard";

@Controller({ path: 'customer', version: API_URI_VERSION })
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) { }

  /**
   * register a customer
   * @param createCustomerDto
   * @param response
   */
  @Post('register')
  async createAdmin(
    @Body() createCustomerDto: CreateCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerModel> {
    return await this.customerService.register(createCustomerDto, response);
  }

  /**
   * login a customer
   * @param loginCustomerDto
   * @param response
   */
  @Post('login')
  async loginAdmin(
    @Body() loginCustomerDto: LoginCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerModel> {
    return await this.customerService.loginCustomer(loginCustomerDto, response);
  }

  /**
   * get all customers
   */
  @Get('customers')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new ReadCustomerPolicyHandler())
  async getAllCustomers(): Promise<CustomerModel[]> {
    return await this.customerService.getCustomers();
  }

  /**
   * get customer profile
   * @param request
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new ReadCustomerPolicyHandler())
  @Get('profile')
  async getProfile(@Req() request: any): Promise<CustomerModel> {
    const { userId } = request.user;
    return this.customerService.getProfile(userId);
  }

  /**
   * update customer avatar
   * @param id
   * @param avatar
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @Patch('avatar/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateCustomerAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.customerService.updateAvatar(id, avatar);
    return { isSaved: saved };
  }

  /**
   * delete avatar
   * @param id
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @Post('delete-avatar/:id')
  async deleteCustomerAvatar(
    @Param('id') id: string,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.customerService.deleteAvatar(id);
    return { isSaved: saved };
  }

  /**
   * update customer
   * @param id
   * @param updateCustomerDto
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @Patch('update/:id')
  async updateCustomerProfile(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerModel> {
    return await this.customerService.updateProfile(id, updateCustomerDto);
  }

  /**
   * update cart
   * @param id
   * @param createCartDto
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @Patch('cart/:id')
  async addToCart(
    @Param('id') id: string,
    @Body() createCartDto: CreateCartDto,
  ): Promise<CustomerModel> {
    return await this.customerService.addToCart(id, createCartDto);
  }

  /**
   * update cart item
   * @param id
   * @param cartId
   * @param updateCartDto
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @Patch('update-cart/:id/:cartId')
  async updateCart(
    @Param('id') id: string,
    @Param('cartId') cartId: string,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<CustomerModel> {
    return await this.customerService.updateCart(id, cartId, updateCartDto);
  }

  /**
   * logout customer
   * @param response
   */
  @Get('logout')
  async logoutCustomer(@Res({ passthrough: true }) response: Response): Promise<null> {
    response.cookie('access_token', '', { maxAge: 1 });
    response.redirect('/');
    return null;
  }

  /**
   * delete customer
   * @param id
   * @param response
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new DeleteCustomerPolicyHandler())
  @Delete('delete/:id')
  async deleteCustomerData(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    response.cookie('access_token', '', { maxAge: 1 });
    return this.customerService.deleteCustomerData(id);
  }
}
