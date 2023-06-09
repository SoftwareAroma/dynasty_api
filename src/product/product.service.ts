import {Injectable} from '@nestjs/common';
import {Product as ProductModel} from '@prisma/client';
import {PrismaService} from '@prisma/prisma.service';
import {CreateProductDto} from '@product/dto/create.dto';
import {CloudinaryService} from '@cloudinary/cloudinary.service';
import {UpdateProductDto} from '@product/dto/update.dto';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  // create product
  async createProduct(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductModel | any> {
    if(files.length > 0){
      const _images = [];
      for (const image of files) {
        // console.log("data ", files);
        const _fileUrl = await this.cloudinaryService.uploadFile(
            image,
            'dynasty/products',
            `${image.originalname?.split('.')[0]}`,
        );
        _images.push(_fileUrl);
      }
      createProductDto.images = _images;
    }
    createProductDto.price.amount = Number(createProductDto.price.amount);
    // console.log("Product >>>>", createProductDto.images);
    // console.log("Product >>>>", newProduct.id);
    return this.prismaService.product.create({
      data: createProductDto,
    });
  }

  /// get all products
  async getProducts(): Promise<Array<ProductModel>> {
    const _products = await this.prismaService.product.findMany();
    if (_products == null) {
      return undefined;
    }
    return _products;
  }

  /// get product by id
  async getProductById(id: string): Promise<ProductModel> {
    return this.prismaService.product.findUnique({
      where: {
        id: id,
      },
    });
  }

  // get product by name
  async getProductByName(name: string): Promise<ProductModel> {
    return this.prismaService.product.findFirst({
      where: {
        name: name,
      },
    });
  }

  /// update product
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductModel> {
    if(files.length > 0){
      const _images = [];
      for (const image of files) {
        const _fileUrl = await this.cloudinaryService.uploadFile(
          image,
          'dynasty/products',
          `${image.originalname?.split('.')[0]}`,
        );
        _images.push(_fileUrl);
      }
      updateProductDto.images = _images;
    }

    return this.prismaService.product.update({
      where: {id: id},
      data: updateProductDto,
    });
  }

  async deleteProduct(id: string): Promise<boolean> {
    const isDeleted = await this.prismaService.product.delete({
      where: { id: id },
    });
    return !!isDeleted;
  }

  // delete the file from the database
  async deleteProductImage(
    productId: string,
    fileName: string,
  ): Promise<boolean> {
    /// find the product with the product id
    const _product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (productId == null) {
      return false;
    }
    const isDeleted = await this.deleteImageFile(fileName);
    if (isDeleted) {
      const images = _product.images;
      /// delete the image from the product list of images
      images.splice(
        images.findIndex((image) => image == fileName),
        1,
      );
      /// update the images list with the new list of images after the deletion
      _product.images = images;
      /// save the changes made to the product
      const updated = await this.prismaService.product.update({
        where: { id: productId },
        data: {
          images: _product.images,
        },
      });
      return !!updated;
    } else {
      return false;
    }
  }

  /// delete image file
  private async deleteImageFile(fileName: string): Promise<boolean> {
    const _id = fileName?.split('/')[-1];
    const _pub_id = _id?.split('.')[0];
    return await this.cloudinaryService.deleteFile(_pub_id);
  }
}
