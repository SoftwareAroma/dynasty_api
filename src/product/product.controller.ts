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
import {ProductService} from '@product/product.service';
import {Product as ProductModel} from '@prisma/client';
import {CreateProductDto} from '@product/dto/create.dto';
import {CheckPolicies, JwtAuthGuard} from 'src/shared/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {UpdateProductDto} from '@product/dto/update.dto';
import {PoliciesGuard} from '@shared/common/guards/policies.guard';
import {
  CreateProductPolicyHandler,
  DeleteProductPolicyHandler,
  UpdateProductPolicyHandler,
} from '@shared';

@Controller({ path: 'product', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * create a new product
   * @param createProductDto
   * @param files
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new CreateProductPolicyHandler())
  @UseInterceptors(FilesInterceptor('images'))
  @Post('create')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<ProductModel> {

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
   * get all products
   */
  @Get('products')
  async getProducts(): Promise<Array<ProductModel>> {
    return await this.productService.getProducts();
  }

  /**
   * get product by id
   * @param id
   */
  @Get('product/:id')
  async getProductById(@Param('id') id: string): Promise<ProductModel> {
    console.log(id);
    return await this.productService.getProductById(id);
  }

  @Get('product/:name')
  async getProductByName(@Param('name') name: string): Promise<ProductModel> {
    return await this.productService.getProductByName(name);
  }

  /**
   * update product
   * @param updateProductDto
   * @param id
   * @param files
   */
  @UseGuards(JwtAuthGuard,PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @UseInterceptors(FilesInterceptor('images'))
  @Patch('product/:id')
  async updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<ProductModel> {
      const _productDto : UpdateProductDto = updateProductDto;
      // convert price string to json object
      _productDto.price = JSON.parse(_productDto.price.toString());
      _productDto.numInStock = parseInt(_productDto.numInStock ? _productDto.numInStock.toString() : "0", 10);
      _productDto.numReviews = parseInt(_productDto.numReviews != null ? _productDto.numReviews.toString() : "0", 10);
      _productDto.rating = parseInt(_productDto.rating != null ? _productDto.rating?.toString() : "0", 10);
    return await this.productService.updateProduct(id, _productDto, files);
  }

  /**
   *  delete product image
   * @param params
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @Post('product/:id/:image')
  async deleteProductImage(@Param() params : any): Promise<boolean> {
    const { id, fileName } = params;
    return await this.productService.deleteProductImage(id, fileName);
  }

  /**
   * delete product
   * @param id
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new DeleteProductPolicyHandler())
  @Delete('product/:id')
  async deleteProduct(@Param('id') id: string): Promise<boolean> {
    return await this.productService.deleteProduct(id);
  }
}
