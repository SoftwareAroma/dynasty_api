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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from '@admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { CreateAdminDto } from '@admin/dto/create.dto';
import { Response } from 'express';
import { LoginAdminDto } from '@admin/dto/login.dto';
import { CheckPolicies, JwtAuthGuard } from '@common';
import { UpdateAdminDto } from '@admin/dto/update.dto';
import { PoliciesGuard } from '@common/guards/policies.guard';
import {
  DeleteAdminPolicyHandler,
  ReadAdminPolicyHandler,
  UpdateAdminPolicyHandler,
} from '@casl/handler/policy.handler';
import { Admin as AdminModel } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ access_token: string }> {
    const domain = this.configService.get<string>('DOMAIN');
    const token = await this.adminService.register(createAdminDto);
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return { access_token: token };
  }

  @Post('login')
  async loginAdmin(
    @Body() loginAdminDto: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ access_token: string }> {
    const token = await this.adminService.loginAdmin(loginAdminDto);
    const domain = this.configService.get<string>('DOMAIN');
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return { access_token: token };
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadAdminPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Get('admins')
  async getAllAdmins(): Promise<AdminModel[]> {
    return await this.adminService.getAdmins();
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadAdminPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request): Promise<AdminModel | any> {
    const { userId } = request.user;
    return this.adminService.getProfile(userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('avatar/:id')
  async updateCustomerAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.adminService.updateAvatar(id, avatar);
    return { isSaved: saved };
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Post('delete-avatar/:id')
  async deleteCustomerAvatar(
    @Param('id') id: string,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.adminService.deleteAvatar(id);
    return { isSaved: saved };
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async updateClientProfile(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateAdminDto,
  ): Promise<AdminModel> {
    return this.adminService.updateProfile(id, updateClientDto);
  }

  @Get('logout')
  async logoutClient(@Res({ passthrough: true }) response): Promise<null> {
    response.cookie('access_token', '', { maxAge: 1 });
    response.redirect('/');
    return null;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteAdminPolicyHandler())
  @Delete('delete/:id')
  async deleteAdminData(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    response.cookie('access_token', '', { maxAge: 1 });
    return this.adminService.deleteAdminData(id);
  }
}
