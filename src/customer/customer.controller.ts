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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerService } from '@customer/customer.service';
import { Response } from 'express';
import { CheckPolicies, JwtAuthGuard, PoliciesGuard } from '@shared';
import { UpdateCustomerDto } from '@customer/dto/update.dto';
import { Customer } from '@prisma/client';
import { LoginCustomerDto } from '@customer/dto/login.dto';
import { CreateCustomerDto } from '@customer/dto/create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DeleteCustomerPolicyHandler,
  ReadCustomerPolicyHandler,
  UpdateCustomerPolicyHandler,
} from '@casl/handler/policy.handler';

@Controller({ path: 'customer', version: '1' })
export class CustomerController {
  constructor(
    private readonly configService: ConfigService,
    private readonly customerService: CustomerService,
  ) { }

  @Post('register')
  async createAdmin(
    @Body() createCustomerDto: CreateCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ access_token: string }> {
    const token = await this.customerService.register(createCustomerDto, response);
    return { access_token: token };
  }

  @Post('login')
  async loginAdmin(
    @Body() loginCustomerDto: LoginCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ access_token: string }> {
    const token = await this.customerService.loginCustomer(loginCustomerDto, response);
    return { access_token: token };
  }

  @CheckPolicies(new ReadCustomerPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Get('customers')
  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerService.getCustomers();
  }


  @CheckPolicies(new ReadCustomerPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Get('profile')
  async getProfile(@Req() request): Promise<Customer> {
    const { userId } = request.user;
    return this.customerService.getProfile(userId);
  }

  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch('avatar/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateCustomerAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.customerService.updateAvatar(id, avatar);
    return { isSaved: saved };
  }


  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Post('delete-avatar/:id')
  async deleteCustomerAvatar(
    @Param('id') id: string,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.customerService.deleteAvatar(id);
    return { isSaved: saved };
  }


  @CheckPolicies(new UpdateCustomerPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch('update/:id')
  async updateCustomerProfile(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.updateProfile(id, updateCustomerDto);
  }

  @Get('logout')
  async logoutCustomer(@Res({ passthrough: true }) response): Promise<boolean> {
    response.cookie('access_token', '', { maxAge: 1 });
    return true;
  }

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
