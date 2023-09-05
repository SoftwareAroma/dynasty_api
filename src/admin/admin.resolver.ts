import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminService } from "@admin/admin.service";
import { GAdmin } from "@admin/models/admin.model";
import { CreateAdminInput } from "@admin/dto/admin.input.dto";
import { UpdateAdminInput } from "@admin/dto/update.input.dto";
import { IAdmin } from "@admin/interface/admin.interface";
import { Admin as AdminModel } from "@prisma/client";
import { LoginAdminInput } from "@admin/dto/login.input.dto";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@common/guards";
import { CheckPolicies, PoliciesGuard } from "@common";
import {
    DeleteAdminPolicyHandler,
    ReadAdminPolicyHandler,
    UpdateAdminPolicyHandler
} from "@shared/casl/handler/policy.handler";
import { GraphQLUpload } from "graphql-upload";
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {Ctx} from "@common/context";

@Resolver(() => GAdmin)
export class AdminResolver {
    constructor(
        private readonly adminService: AdminService,
        private readonly jwtService: JwtService,
        // private readonly configService: ConfigService,
    ) { }

    /**
     * create admin
     * @param createAdminInput
     * @param response
     */
    @Mutation(() => GAdmin, { name: "createAdmin" })
    async createAdmin(
        @Args('createAdminInput') createAdminInput: CreateAdminInput,
        @Context('res') response: Response,
    ): Promise<IAdmin> {
        const admin : AdminModel = await this.adminService.register(createAdminInput);
        const payload = { username: admin.email, sub: admin.id, role: admin.role };
        const token : string = await this.jwtService.signAsync(payload);
        response.cookie('access_token', token, {
            // domain: this.configService.get<string>('DOMAIN'),
            httpOnly: true,
            // sameSite: 'none',
            // secure: true,
        });
        return admin;
    }

    /**
     * login admin
     * @param loginAdminInput
     * @param response
     */
    @Mutation(() => GAdmin, { name: "loginAdmin" })
    async loginAdmin(
        @Args('loginAdminInput') loginAdminInput: LoginAdminInput,
        // @Context() context: Ctx,
        @Context('res') response: Response,
    ): Promise<AdminModel> {
        const admin : AdminModel = await this.adminService.loginAdmin(loginAdminInput);
        const payload = { username: admin.email, sub: admin.id, role: admin.role };
        const token : string = await this.jwtService.signAsync(payload);
        response.cookie('access_token', token, {
            // domain: this.configService.get<string>('DOMAIN'),
            httpOnly: true,
            // sameSite: 'none',
            // secure: true,
        });
        return admin;
    }

    /**
     * get all admins
     */
    @Query(() => [GAdmin], { name: "getAdmins" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admins(): Promise<IAdmin[]> {
        return await this.adminService.getAdmins();
    }

    /**
     * get admin profile
     * @param context
     */
    @Query(() => GAdmin, { name: "getAdminProfile" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async profile(@Context() context: Ctx): Promise<IAdmin> {
        // console.log(context.req.user);
        const user: any = context.req.user;
        return this.adminService.getProfile(user.id);
    }

    /**
     * get admin by id
     * @param id
     */
    @Query(() => GAdmin, { name: "getAdminById" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admin(@Args('id') id: string): Promise<IAdmin> {
        return await this.adminService.getProfile(id);
    }

    /**
     * update admin avatar
     * @param id
     * @param avatar
     */
    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async updateAdminAvatar(
        @Args('id') id: string,
        @Args('avatar', { type: () => GraphQLUpload }) avatar: any,
    ): Promise<boolean> {
        return await this.adminService.updateAvatar(id, avatar);
    }

    /**
     * delete admin avatar
     * @param id
     *
     */
    @Mutation(() => Boolean, { name: "deleteAdminAvatar" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async deleteAdminAvatar(
        @Args('id') id: string,
    ): Promise<boolean> {
        return await this.adminService.deleteAvatar(id);
    }

    /**
     * update admin profile
     * @param id
     * @param updateAdminInput
     */
    @Mutation(() => GAdmin, { name: "updateAdmin" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async updateAdminProfile(
        @Args('id') id: string,
        @Args('updateAdminInput') updateAdminInput: UpdateAdminInput,
    ): Promise<IAdmin> {
        return await this.adminService.updateProfile(id, updateAdminInput)
    }


    /**
     * logout admin
     * @param context
     */
    @Query(() => Boolean, { name: "logoutAdmin" })
    async logoutAdmin(@Context() context: any): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        return true;
    }

    /**
     * delete admin
     * @param id
     * @param context
     */
    @Mutation(() => Boolean, { name: "deleteAdmin" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new DeleteAdminPolicyHandler())
    async deleteAdmin(
        @Args('id') id: string,
        @Context() context: any,
    ): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        return await this.adminService.deleteAdminData(id);
    }

}
