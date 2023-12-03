import { Injectable } from '@nestjs/common';
import { Product as ProductModel } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateProductDto } from '@product/dto/create.dto';
import { CloudinaryService } from '@shared/cloudinary/cloudinary.service';
import { UpdateProductDto } from '@product/dto/update.dto';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  /**
   * Create a new product
   * @param createProductDto - product data to be created
   * @param files - list of files to be uploaded
   * @returns ProductModel
   */
  async createProduct(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductModel> {
    if (files.length > 0) {
      const _images = [];
      for (const image of files) {
        // console.log("data ", files);
        const _fileUrl = await this.cloudinaryService.uploadFile(
          image,
          `${image.filename?.split('.')[0]}`,
          'dynasty/products',
          'dynasty_products'
        );
        _images.push(_fileUrl);
      }
      createProductDto.images = _images;
    }
    createProductDto.price.amount = Number(createProductDto.price.amount);
    return this.prismaService.product.create({
      data: createProductDto,
    });
  }

  /**
   * Find all products
   * @returns List<ProductModel>[] - list of products
   */
  async getProducts(): Promise<Array<ProductModel>> {
    const _products = await this.prismaService.product.findMany();
    if (_products == null) {
      return undefined;
    }
    return _products;
  }

  /**
   * Find a product with the given id
   * @param id - product id
   * @returns ProductModel
   */
  async getProductById(id: string): Promise<ProductModel> {
    return this.prismaService.product.findUnique({
      where: {
        id: id,
      },
    });
  }

  /**
   * Find a product with the given name
   * @param name - product name
   * @returns ProductModel
   */
  async getProductByName(name: string): Promise<ProductModel> {
    return this.prismaService.product.findFirst({
      where: {
        name: name,
      },
    });
  }

  /**
   * update the product with the given id
   * @param id - product id
   * @param updateProductDto - product data to be updated
   * @param files - list of files to be uploaded
   * @returns ProductModel
   */
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductModel> {
    if (files.length > 0) {
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
      where: { id: id },
      data: updateProductDto,
    });
  }

  /**
   * Delete the product with the given id
   * @param id - product id
   * @returns bolean - true if the product is deleted, false otherwise
   */
  async deleteProduct(id: string): Promise<boolean> {
    const isDeleted = await this.prismaService.product.delete({
      where: { id: id },
    });
    return !!isDeleted;
  }

  /**
   * Delete the image with the given file name from the product with the given id
   * @param productId 
   * @param fileName 
   * @returns false if the image is not deleted, true otherwise
   */
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
      const { images } = _product;
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

  /**
   * Create a review for the product with the given id
   * @param productId - product id
   * @param review - review data to be added to the product
   * @returns ProductModel
   */
  async addProductReview(
    productId: string,
    review: CreateReviewDto,
  ): Promise<ProductModel> {
    return this.prismaService.product.update({
      where: { id: productId },
      data: {
        reviews: {
          create: review,
        },
      },
    });
  }

  /**
   * Update the review with the given id for the product with the given id
   * @param productId - product id
   * @param reviewId - review id
   * @param review - review data to be updated
   * @returns ProductModel
   */
  async updateProductReview(
    productId: string,
    reviewId: string,
    review: UpdateReviewDto,
  ): Promise<ProductModel> {
    return this.prismaService.product.update({
      where: { id: productId },
      data: {
        reviews: {
          update: { where: { id: reviewId }, data: review },
        },
      },
    });
  }

  /**
   * Delete the review with the given id for the product with the given id
   * @param productId - product id
   * @param reviewId - review id
   * @returns true if the review is deleted, false otherwise
   */
  async deleteProductReview(
    productId: string,
    reviewId: string,
  ): Promise<boolean> {
    const response = await this.prismaService.product.update({
      where: { id: productId },
      data: {
        reviews: {
          delete: { id: reviewId },
        },
      },
    });
    return !!response;
  }

  /**
   * delete the image with the given file name from the cloudinary storage
   * @param fileName - file name of the image to be deleted
   * @returns true the response from cloudinary is 200, false otherwise
   */
  private async deleteImageFile(fileName: string): Promise<boolean> {
    const _id = fileName?.split('/')[-1];
    const _pub_id = _id?.split('.')[0];
    return await this.cloudinaryService.deleteFile(_pub_id);
  }
}
