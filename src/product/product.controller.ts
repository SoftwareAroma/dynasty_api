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
import { CheckPolicies, JwtAuthGuard } from '@common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateProductDto } from '@product/dto/update.dto';
import { PoliciesGuard } from '@common/guards/policies.guard';
import {
  CreateProductPolicyHandler,
  DeleteProductPolicyHandler,
  UpdateProductPolicyHandler,
} from '@casl/handler/policy.handler';

@Controller({ path: 'product', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /// create a new product
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @Post('create')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Product | any> {
    const _productDto = createProductDto;
    // convert price string to json object
    _productDto.price = JSON.parse(_productDto.price.toString());
    return this.productService.createProduct(_productDto, files);
  }

  // get all products
  @Get('products')
  async getProducts(): Promise<Array<Product>> {
    return await this.productService.getProducts();
  }

  // get product by id
  @Get('product/:id')
  async getProductById(@Param('id') id: string): Promise<Product> {
    console.log(id);
    return await this.productService.getProductById(id);
  }

  @Get('product/:name')
  async getProductByName(@Param('name') name: string): Promise<Product> {
    return await this.productService.getProductByName(name);
  }

  // update product
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Patch('product/:id')
  async updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto, files);
  }

  // delete product image
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Post('product/:id/:image')
  async deleteProductImage(@Param() params): Promise<boolean> {
    const { id, fileName } = params;
    return await this.productService.deleteProductImage(id, fileName);
  }

  // delete product
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteProductPolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Delete('product/:id')
  async deleteProduct(@Param('id') id: string): Promise<boolean> {
    return await this.productService.deleteProduct(id);
  }
}
