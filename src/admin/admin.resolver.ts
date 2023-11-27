import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminService } from "@admin/admin.service";
import {AdminResolverResponse, AdminAuthResponse} from "@admin/models/admin.model";
import { CreateAdminInput } from "@admin/dto/admin.input.dto";
import { UpdateAdminInput } from "@admin/dto/update.input.dto";
import { Admin as AdminModel } from "@prisma/client";
import { LoginAdminInput } from "@admin/dto/login.input.dto";
import {UseGuards} from "@nestjs/common";
import { CheckPolicies, PoliciesGuard, GqlAuthGuard } from "@shared";
import {
    DeleteAdminPolicyHandler,
    ReadAdminPolicyHandler,
    UpdateAdminPolicyHandler
} from "@shared/casl/handler/policy.handler";
import { GraphQLUpload } from "graphql-upload";

@Resolver(() => AdminResolverResponse)
export class AdminResolver {
    constructor(
        private readonly adminService: AdminService,
    ) { }

    /**
     * create admin
     * @param createAdminInput
     * @param context
     */
    @Mutation(() => AdminAuthResponse, { name: "createAdmin" })
    async createAdmin(
        @Args('createAdminInput') createAdminInput: CreateAdminInput,
        @Context() context: any,
    ): Promise<{access_token:string}> {
        return await this.adminService.register(createAdminInput, context);
    }

    /**
     * login admin
     * @param loginAdminInput
     * @param context
     */
    @Mutation(() => AdminAuthResponse, { name: "loginAdmin" })
    async loginAdmin(
        @Args('loginAdminInput') loginAdminInput: LoginAdminInput,
        @Context() context: any,
    ): Promise<{access_token:string}> {
        return await this.adminService.loginAdmin(loginAdminInput, context);
    }

    /**
     * get all admins
     */
    @Query(() => [AdminResolverResponse], { name: "getAdmins" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admins(): Promise<AdminModel[]> {
        return await this.adminService.getAdmins();
    }

    /**
     * get admin profile
     * @param context
     */
    @Query(() => AdminResolverResponse, { name: "getAdminProfile" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async profile(@Context() context: any): Promise<AdminModel> {
        // console.log(context.req.user);
        const user: any = context.req.user;
        return this.adminService.getProfile(user.id);
    }

    /**
     * get admin by id
     * @param id
     */
    @Query(() => AdminResolverResponse, { name: "getAdminById" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admin(@Args('id') id: string): Promise<AdminModel> {
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
    @Mutation(() => AdminResolverResponse, { name: "updateAdmin" })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async updateAdminProfile(
        @Args('id') id: string,
        @Args('updateAdminInput') updateAdminInput: UpdateAdminInput,
    ): Promise<AdminModel> {
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
