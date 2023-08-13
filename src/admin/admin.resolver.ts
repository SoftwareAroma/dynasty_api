import {Args, Context, Mutation, Query, Resolver} from '@nestjs/graphql';
import {AdminService} from "@admin/admin.service";
import {GAdmin} from "@admin/models/admin.model";
import {CreateAdminInput} from "@admin/dto/admin.input.dto";
import {Ctx,} from "@common/context";
import {UpdateAdminInput} from "@admin/dto/update.input.dto";
import {IAdmin} from "@admin/interface/admin.interface";
import {Admin as AdminModel} from "@prisma/client";
import {LoginAdminInput} from "@admin/dto/login.input.dto";
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "@common/guards";
import {CheckPolicies, PoliciesGuard} from "@common";
import {
    DeleteAdminPolicyHandler,
    ReadAdminPolicyHandler,
    UpdateAdminPolicyHandler
} from "@casl/handler/policy.handler";

@Resolver(() => GAdmin)
export class AdminResolver {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    /// Create an admin
    @Mutation(() => GAdmin, {name: "createAdmin"})
    async createAdmin(
        @Args('createAdminInput') createAdminInput: CreateAdminInput,
        @Context() context: Ctx,
    ): Promise<IAdmin> {
        return await this.adminService.register(createAdminInput, context);
    }

    /// log in admin
    @Mutation(() => GAdmin, {name: "loginAdmin"})
    async loginAdmin(
        @Args('loginAdminInput') loginAdminInput: LoginAdminInput,
        @Context() context: Ctx,
    ): Promise<AdminModel> {
        // Your logic for creating an admin goes here
        return await this.adminService.loginAdmin(loginAdminInput, context);
    }

    /// Get all admins
    @Query(() => [GAdmin], {name: "getAdmins"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admins(): Promise<IAdmin[]> {
        return await this.adminService.getAdmins();
    }

    /// get the profile of the admin
    @Query(() => GAdmin, {name: "getAdminProfile"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async profile(@Context() context: Ctx): Promise<IAdmin> {
        // console.log(context.req.user);
        const user:any = context.req.user;
        return this.adminService.getProfile(user.id);
    }

    /// Get admin by id
    @Query(() => GAdmin, {name: "getAdminById"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadAdminPolicyHandler())
    async admin(@Args('id') id: string): Promise<IAdmin> {
        return await this.adminService.getProfile(id);
    }

    /// update avatar
    // @Mutation(() => Boolean)
    // @CheckPolicies(new UpdateAdminPolicyHandler())
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // async updateAdminAvatar(
    //     @Args('id') id: string,
    //     @Args('avatar', { type: () => GraphQLUpload }) avatar: FileUpload,
    // ): Promise<boolean> {
    //     return await this.adminService.updateAvatar(id, avatar);
    // }

    /// delete avatar
    @Mutation(() => Boolean, {name: "deleteAdminAvatar"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async deleteAvatar(
        @Args('id') id: string,
    ): Promise<boolean> {
        return await this.adminService.deleteAvatar(id);
    }

    /// update admin
    @Mutation(() => GAdmin, {name: "updateAdmin"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateAdminPolicyHandler())
    async updateAdminProfile(
        @Args('id') id: string,
        @Args('updateAdminInput') updateAdminInput: UpdateAdminInput,
    ): Promise<IAdmin> {
        return await this.adminService.updateProfile(id, updateAdminInput)
    }


    /// logout admin
    @Query(() => Boolean, {name: "logoutAdmin"})
    async logoutAdmin(@Context() context:any): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        return true;
    }

    /// delete admin
    @Mutation(() => Boolean, {name: "deleteAdmin"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new DeleteAdminPolicyHandler())
    async deleteAdmin(
        @Args('id') id: string,
        @Context() context:Ctx,
    ): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        return await this.adminService.deleteAdminData(id);
    }

}
