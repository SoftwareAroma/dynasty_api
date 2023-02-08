import { Body, Controller, Get, Post, Req, Res, UseGuards, } from "@nestjs/common";
import { AdminService } from "@admin/admin.service";
import { ConfigService } from "@nestjs/config";
import { CreateAdminDto } from "@admin/dto/create.dto";
import { Response } from "express";
import { LoginAdminDto } from "@admin/dto/login.dto";
import { Admin } from "@admin/schema/admin.schema";
import { JwtAuthGuard } from "@common";

@Controller({path: "admin", version: '1' })
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Res({passthrough: true}) response: Response): Promise<{access_token: string}>{
    const domain = this.configService.get<string>("DOMAIN");
    const token = await this.adminService.register(createAdminDto);
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return { 'access_token': token }
  }

  @Post('login')
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto, @Res({passthrough: true}) response: Response): Promise<{access_token: string}>{
    const admin = await this.adminService.validateAdmin(loginAdminDto);
    const token = await this.adminService.loginAdmin(admin)
    const domain = this.configService.get<string>("DOMAIN");
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return { 'access_token': token }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request):Promise<Admin>{
    const {userId} = request.user;
    return this.adminService.getProfile(userId);
  }
}
