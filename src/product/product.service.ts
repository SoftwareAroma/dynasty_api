import {HttpException, Injectable} from '@nestjs/common';
import {Product as ProductModel} from '@prisma/client';
import {PrismaService} from '@shared/prisma/prisma.service';
import {CreateProductInput} from "@product/dto/product.input.dto";
import {UpdateProductInput} from "@product/dto/update.input.dto";
import {deleteFile, uploadFile, uploadFiles} from "@shared";
import {FileUpload} from "graphql-upload";

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
  ) { }

  /**
     * create a new product
     * @param createProductDto
     * @param files
     */
    async createProduct(
      createProductDto: CreateProductInput,
      files?: Array<FileUpload>,
    ): Promise<ProductModel> {
      if (files && files.length > 0) {
        const public_ids: string[] = files?.map((file: FileUpload) => {
          const fileName: string = file.filename;
          return fileName.replace(/\.[^/.]+$/, "");
        });
        createProductDto.images = await uploadFiles(files, public_ids, 'dynasty_product_image');
      }
      createProductDto.price.amount = Number(createProductDto.price.amount);
      console.log("Product >>>>", createProductDto.images);
      return this.prismaService.product.create({
        data: createProductDto,
      });
    }

  /**
   * get all products
   */
  async getProducts(): Promise<ProductModel[]> {
    return this.prismaService.product.findMany();
  }

  /**
   * get product by id
   * @param id
   */
  async getProductById(id: string): Promise<ProductModel> {
    return this.prismaService.product.findUnique({
      where: {
        id: id,
      },
    });
  }

  /**
   * get product by name
   * @param name
   */
  async getProductByName(name: string): Promise<ProductModel> {
    return this.prismaService.product.findFirst({
      where: {
        name: name,
      },
    });
  }

  /**
   * update product
   * @param id
   * @param updateProductDto
   * @param files
   */
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductInput,
    files?: Array<FileUpload>,
  ): Promise<ProductModel> {
    if(files.length > 0){
      const _images : any[] = [];
      for (const image of files) {
        const _fileUrl : string = await uploadFile(
          image,
          `${image.filename?.split('.')[0]}`,
          'dynasty/products',
            'dynasty_product_image'
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
    const isDeleted : ProductModel = await this.prismaService.product.delete({
      where: { id: id },
    });
    return !!isDeleted;
  }

  /**
   * delete the product image from the cloudinary storage
   * @param productId
   * @param fileName
   */
  async deleteProductImage(
    productId: string,
    fileName: string,
  ): Promise<boolean> {
    /// find the product with the product id
    if (productId == null) {
      throw new HttpException("Product id is required", 400);
    }
    const _product : ProductModel = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    const isDeleted : boolean = await this.deleteImageFile(fileName);
    if (isDeleted) {
      const images : string[] = _product.images;
      /// delete the image from the product list of images
      images.splice(
        images.findIndex((image:string) : boolean => image == fileName),
        1,
      );
      /// update the images list with the new list of images after the deletion
      _product.images = images;
      /// save the changes made to the product
      const updated : ProductModel = await this.prismaService.product.update({
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
   * delete the file from the cloudinary storage
   * @param fileName
   * @private
   */
  private async deleteImageFile(fileName: string): Promise<boolean> {
    const _id : string = fileName?.split('/')[-1];
    const _pub_id : string = _id?.split('.')[0];
    return await deleteFile(_pub_id);
  }
}
