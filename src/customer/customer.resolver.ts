import {Args, Context, Mutation, Query, Resolver} from '@nestjs/graphql';
import {CustomerAuthResponse, GCustomer} from "@customer/model/customer.model";
import {CustomerService} from "@customer/customer.service";
import Ctx from "@shared/context";
import {CreateCustomerInput} from "@customer/dto/customer.input.dto";
import {LoginCustomerInput} from "@customer/dto/login.input.dto";
import {UpdateCustomerInput} from "@customer/dto/update.input.dto";
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "@shared/guards";
import {CheckPolicies, PoliciesGuard} from "@shared";
import {
    ReadCustomerPolicyHandler,
    UpdateCustomerPolicyHandler,
    DeleteCustomerPolicyHandler,
} from "@shared/casl/handler/policy.handler";
import {CreateCartInput} from "@customer/dto/cart.input.dto";
import {UpdateCartInput} from "@customer/dto/cart.update.dto";
import {PubSub} from "graphql-subscriptions";
import {Customer as CustomerModel} from "@prisma/client";
import {FileUpload, GraphQLUpload} from "graphql-upload";

/// pub sub
const pubSub : PubSub = new PubSub();

@Resolver(() => GCustomer)
export class CustomerResolver {
    constructor(private readonly customerService: CustomerService) {}

    /// create a customer
    @Mutation(() => CustomerAuthResponse, {name: "createCustomer"})
    async createCustomer(
        @Args("createCustomerInput") createCustomerInput: CreateCustomerInput,
        @Context() context: Ctx ,
    ): Promise<{access_token:string}> {
        return await this.customerService.register(createCustomerInput, context);
    }

    /// login customer
    @Mutation(() => CustomerAuthResponse, {name: "loginCustomer"})
    async loginCustomer(
        @Args("loginCustomerInput") loginCustomerInput: LoginCustomerInput,
        @Context() context: Ctx,
    ): Promise<{access_token:string}> {
        return await this.customerService.loginCustomer(loginCustomerInput, context);
    }

    /// get all customers
    @Query(() => [GCustomer], {name: "getCustomers"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadCustomerPolicyHandler())
    async getCustomers(): Promise<CustomerModel[]> {
        return await this.customerService.getCustomers();
    }

    @Query(() => GCustomer, {name: "getCustomerProfile"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadCustomerPolicyHandler())
    async getCustomerProfile(
        @Context() context: Ctx,
    ): Promise<CustomerModel> {
        // console.log(context.req.user);
        const user:any = context.req.user;
        return await this.customerService.getProfile(user.id);
    }

    /// get customer by id
    @Query(() => GCustomer, {name: "getCustomerById"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new ReadCustomerPolicyHandler())
    async getCustomerById(
        @Args('id') id: string,
    ): Promise<CustomerModel> {
        return await this.customerService.getProfile(id);
    }

    /// update customer
    @Mutation(() => GCustomer, {name: "updateCustomer"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async updateCustomer(
        @Args('id') id: string,
        @Args("updateCustomerInput") updateCustomerInput: UpdateCustomerInput,
    ): Promise<CustomerModel> {
        const _customer: CustomerModel = await this.customerService.updateProfile(id, updateCustomerInput);
        await pubSub.publish('customerUpdated', {userUpdated: _customer});
        return _customer;
    }

    /// update avatar
    @Mutation(() => Boolean, {name: "updateCustomerAvatar"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async updateCustomerAvatar(
        @Args('id') id: string,
        @Args('avatar', { type: () => GraphQLUpload }) avatar: FileUpload,
    ): Promise<boolean> {
        return await this.customerService.updateAvatar(id, avatar);
    }

    /// update customer -> delete avatar
    @Mutation(() => Boolean, {name: "deleteCustomerAvatar"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async deleteCustomerAvatar(
        @Args('id') id: string,
    ): Promise<boolean> {
        const _customer : boolean = await this.customerService.deleteAvatar(id);
        await pubSub.publish('avatarUpdated', {userUpdated: _customer});
        return _customer;
    }

    /// add to cart
    @Mutation(() => GCustomer, {name: "addToCustomerCart"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async addToCustomerCart(
        @Args('id') id: string,
        @Args("createCartInput") createCartInput: CreateCartInput,
    ): Promise<CustomerModel> {
        const _customer : CustomerModel = await this.customerService.addToCart(id, createCartInput);
        await pubSub.publish('customerUpdated', {userUpdated: _customer});
        return _customer;
    }

    /// update cart
    @Mutation(() => GCustomer, {name: "updateCustomerCart"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async updateCustomerCart(
        @Args('id') id: string,
        @Args('cartId') cartId: string,
        @Args("updateCartInput") updateCartInput: UpdateCartInput,
    ): Promise<CustomerModel> {
        const _customer : CustomerModel = await this.customerService.updateCart(id, cartId, updateCartInput);
        await pubSub.publish('customerUpdated', {userUpdated: _customer});
        return _customer;
    }

    /// log out customer
    @Query(() => Boolean, {name: "logoutCustomer"})
    async logoutCustomer(
        @Context() context: Ctx,
    ): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        return true;
    }


    /// delete customer
    @Mutation(() => Boolean, {name: "deleteCustomer"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new DeleteCustomerPolicyHandler())
    async deleteCustomer(
        @Args('id') id: string,
        @Context() context: Ctx,
    ): Promise<boolean> {
        context.res.cookie('access_token', undefined, { maxAge: 1 });
        const result: boolean = await this.customerService.deleteCustomerData(id);
        await pubSub.publish('customerDeleted', {userDeleted: result});
        return result;
    }

}
