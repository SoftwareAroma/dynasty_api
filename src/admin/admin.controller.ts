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
import { AdminService } from '@admin/admin.service';
import { CreateAdminDto } from '@admin/dto/create.dto';
import { Response } from 'express';
import { LoginAdminDto } from '@admin/dto/login.dto';
import { UpdateAdminDto } from '@admin/dto/update.dto';
import {
  DeleteAdminPolicyHandler,
  ReadAdminPolicyHandler,
  UpdateAdminPolicyHandler,
  CheckPolicies,
  JwtAuthGuard,
  PoliciesGuard
} from '@shared';
import { Admin as AdminModel } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  /**
   * create an admin
   * @param createAdminDto
   * @param response
   */
  @Post('register')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminModel> {
    return await this.adminService.register(createAdminDto, response);
  }

  /**
   * login admin
   * @param loginAdminDto
   * @param response
   */
  @Post('login')
  async loginAdmin(
    @Body() loginAdminDto: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminModel> {
    return await this.adminService.loginAdmin(loginAdminDto, response);
  }

  /**
   * get all admins
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new ReadAdminPolicyHandler())
  @Get('admins')
  async getAllAdmins(): Promise<AdminModel[]> {
    return await this.adminService.getAdmins();
  }

  /**
   * get admin profile
   * @param request
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new ReadAdminPolicyHandler())
  @Get('profile')
  async getProfile(@Req() request: any): Promise<AdminModel | any> {
    const { userId } = request.user;
    return this.adminService.getProfile(userId);
  }

  /**
   * update admin avatar
   * @param id
   * @param avatar
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('avatar/:id')
  async updateCustomerAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.adminService.updateAvatar(id, avatar);
    return { isSaved: saved };
  }

  /**
   * delete-avatar
   * @param id
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @Post('delete-avatar/:id')
  async deleteCustomerAvatar(
    @Param('id') id: string,
  ): Promise<{ isSaved: boolean }> {
    const saved = await this.adminService.deleteAvatar(id);
    return { isSaved: saved };
  }

  /**
   * update admin with id
   * @param id
   * @param updateClientDto
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateAdminPolicyHandler())
  @Patch('update/:id')
  async updateClientProfile(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateAdminDto,
  ): Promise<AdminModel> {
    return this.adminService.updateProfile(id, updateClientDto);
  }

  /**
   * logout admin
   * @param response
   */
  @Get('logout')
  async logoutClient(@Res({ passthrough: true }) response: any): Promise<null> {
    response.cookie('access_token', '', { maxAge: 1 });
    response.redirect('/');
    return null;
  }

  /**
   * delete admin
   * @param id
   * @param response
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
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
