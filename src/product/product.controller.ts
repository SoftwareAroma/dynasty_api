import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from '@product/product.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from '@product/dto/create.dto';
import { CheckPolicies, JwtAuthGuard, PoliciesGuard } from '@shared';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateProductDto } from '@product/dto/update.dto';
import {
  CreateProductPolicyHandler,
  DeleteProductPolicyHandler,
  UpdateProductPolicyHandler,
} from '@casl/handler/policy.handler';
import { CreateReviewDto } from './dto/review.dto';

@Controller({ path: 'product', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  /**
   * Create a new product
   * @param createProductDto - product data to be created
   * @param files - list of files to be uploaded
   * @returns Product
   */
  @CheckPolicies(new CreateProductPolicyHandler())
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @Post('create')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Product> {
    const _productDto = createProductDto;
    // convert price string to json object
    _productDto.price = JSON.parse(_productDto.price.toString());
    _productDto.numInStock = parseInt(_productDto.numInStock ? _productDto.numInStock.toString() : "0", 10);
    _productDto.numReviews = parseInt(_productDto.numReviews != null ? _productDto.numReviews.toString() : "0", 10);
    _productDto.rating = parseInt(_productDto.rating != null ? _productDto.rating?.toString() : "0", 10);

    // console.log(`create dto - ${_productDto.price.amount}`);
    return await this.productService.createProduct(_productDto, files);
  }

  /**
   * Get all products
   * @returns List<Product> - list of products
   */
  @Get('products')
  async getProducts(): Promise<Array<Product>> {
    return await this.productService.getProducts();
  }

  /**
   * Get product by id
   * @param id - product id
   * @returns Product
   */
  @Get('product/:id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    // console.log(id);
    return await this.productService.getProductById(id);
  }

  /**
   * Get product by name
   * @param name - product name
   * @returns Product
   */
  @Get('product/:name')
  async getProductByName(@Param('name') name: string): Promise<Product> {
    return await this.productService.getProductByName(name);
  }

  /**
   * Update the product with the given id
   * @param updateProductDto - product data
   * @param id - product id
   * @param files - list of files to be uploaded
   * @returns Product
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(JwtAuthGuard)
  @Patch('product/:id')
  async updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Product> {
    const _productDto = updateProductDto;
    // convert price string to json object
    _productDto.price = JSON.parse(_productDto.price.toString());
    _productDto.numInStock = parseInt(_productDto.numInStock ? _productDto.numInStock.toString() : "0", 10);
    _productDto.numReviews = parseInt(_productDto.numReviews != null ? _productDto.numReviews.toString() : "0", 10);
    _productDto.rating = parseInt(_productDto.rating != null ? _productDto.rating?.toString() : "0", 10);
    return await this.productService.updateProduct(id, _productDto, files);
  }

  /**
   * Delete a product image
   * @returns Product
   * @param params
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Post('product/:id/:image')
  async deleteProductImage(@Param() params: any): Promise<boolean> {
    const { id, fileName } = params;
    return await this.productService.deleteProductImage(id, fileName);
  }

  /**
   * Delete a product with the given id
   * @param id - product id
   * @returns true if the product is deleted, false otherwise
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Delete('product/:id')
  async deleteProduct(@Param('id') id: string): Promise<boolean> {
    return await this.productService.deleteProduct(id);
  }

  /**
   * Add a new review to product
   * @param id - product id
   * @param reviewDto - review data
   * @returns Product
   */
  @Post('product/:id/review')
  async addReview(
    @Param('id') id: string,
    @Body() reviewDto: CreateReviewDto,
  ): Promise<Product> {
    return await this.productService.addProductReview(id, reviewDto);
  }

  /**
   * Update the review with the given id
   * @param id - product id
   * @param reviewId - review id
   * @param reviewDto - review data
   * @returns Product
   */
  @Patch('product/:id/review/:reviewId')
  async updateReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Body() reviewDto: CreateReviewDto,
  ): Promise<Product> {
    return await this.productService.updateProductReview(id, reviewId, reviewDto);
  }

  /**
   * Delete a review from product
   * @param id - product id
   * @param reviewId - review id
   * @returns true if the review is deleted, false otherwise
   */
  @Delete('product/:id/review/:reviewId')
  async deleteReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
  ): Promise<boolean> {
    return await this.productService.deleteProductReview(id, reviewId);
  }
}
