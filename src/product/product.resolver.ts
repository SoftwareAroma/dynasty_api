import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {PubSub} from "graphql-subscriptions";
import {GProduct} from "@product/model/product.model";
import {ProductService} from "@product/product.service";
import {IProduct} from "@product/interface/product.interface";
import {CreateProductInput} from "@product/dto/product.input.dto";
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "@common/guards";
import {CheckPolicies, PoliciesGuard} from "@common";
import {CreateProductPolicyHandler} from "@casl/handler/policy.handler";
import {Product as ProductModel} from "@prisma/client";
import {UpdateProductInput} from "@product/dto/update.input.dto";

/// pub sub
const pubSub : PubSub = new PubSub();
@Resolver(() => GProduct)
export class ProductResolver {
    constructor(private readonly productService: ProductService) {}

    /// create product
    @Mutation(() => GProduct, { name: 'createProduct' })
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new CreateProductPolicyHandler())
    async createProduct(
        @Args('createProductInput') createProductInput: CreateProductInput,
    ): Promise<IProduct> {
        const _productDto = this.formatInput(createProductInput);
        const product = await this.productService.createProduct(_productDto);
        await pubSub.publish('productCreated', { productCreated: product });
        return product;
    }

    /// get all products
    @Query(() => [GProduct], { name: 'getProducts' })
    async getProducts(): Promise<IProduct[]> {
        return this.productService.getProducts();
    }

    /// get product by id
    @Query(() => GProduct, { name: 'getProductById' })
    async getProductById(@Args('id') id: string): Promise<IProduct> {
        return this.productService.getProductById(id);
    }

    /// get product by name
    @Query(() => GProduct, { name: 'getProductByName' })
    async getProductByName(@Args('name') name: string): Promise<IProduct> {
        return this.productService.getProductByName(name);
    }

    /// update product
    @Mutation(() => GProduct, { name: 'updateProduct' })
    async updateProduct(
        @Args('id') id: string,
        @Args('updateProductInput') updateProductInput: UpdateProductInput,
    ): Promise<IProduct> {
        const _productDto = this.formatInput(updateProductInput);
        const product: ProductModel = await this.productService.updateProduct(id, _productDto);
        await pubSub.publish('productUpdated', { productUpdated: product });
        return product;
    }

    /// delete product image
    @Mutation(() => Boolean, { name: 'deleteProductImage' })
    async deleteProductImage(
        @Args('id') id: string,
        @Args('image') image: string,
    ): Promise<boolean> {
        const result : boolean = await this.productService.deleteProductImage(id, image);
        await pubSub.publish('productUpdated', { productUpdated: result });
        return result;
    }

    /// delete product by id
    @Mutation(() => Boolean, { name: 'deleteProduct' })
    async deleteProductById(@Args('id') id: string): Promise<boolean> {
        return this.productService.deleteProduct(id);
    }

    private formatInput = (input: CreateProductInput | UpdateProductInput): any => {
        // convert price string to json object
        input.price = JSON.parse(input.price.toString());
        input.numInStock = parseInt(input.numInStock ? input.numInStock.toString() : "0", 10);
        input.numReviews = parseInt(input.numReviews != null ? input.numReviews.toString() : "0", 10);
        input.rating = parseInt(input.rating != null ? input.rating?.toString() : "0", 10);
        return input;
    }
}
