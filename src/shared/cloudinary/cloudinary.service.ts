import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary'
import { ConfigService } from '@nestjs/config';
import toStream = require('buffer-to-stream');
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from '@shared/environment';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: CLOUDINARY_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /**
   * Uploads a file to cloudinary.
   * @param file
   * @param folder
   * @param public_id
   * @param tag
   */
  async uploadFile(
    file: Express.Multer.File,
    public_id?: string,
    folder?: string,
    tag?: string,
  ): Promise<string> {
    const uploadFromBuffer = async (): Promise<
      cloudinary.UploadApiResponse | cloudinary.UploadApiErrorResponse
    > => {
      const uniqueFilename = new Date().toISOString()
      return new Promise((resolve, reject) => {
        const upload = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: folder,
            public_id: public_id ?? uniqueFilename,
            tag: tag ?? 'dynasty',
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            } else {
              resolve(result);
            }
          },
        );
        toStream(file.buffer).pipe(upload);
      });
    };
    const response = await uploadFromBuffer();
    return cloudinary.v2.url(response.secure_url);
  }

  /**
   * Uploads multiple files to cloudinary.
   * @param files
   * @param public_ids
   * @param folderName
   * @param tag
   */
  async uploadFiles(
    files: Express.Multer.File[],
    public_ids?: string[],
    folderName?: string,
    tag?: string,
  ): Promise<string[]> {

    const uniqueFilenames: string[] = files.map(() => new Date().toISOString());

    // for each file in files, upload it with the upload method above
    const uploadFromBuffer = async (file: Express.Multer.File, public_id: string): Promise<
      cloudinary.UploadApiResponse | cloudinary.UploadApiErrorResponse> => {
      return new Promise((resolve, reject) => {
        const upload = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: folderName,
            public_id: public_id,
            tag: tag ?? 'dynasty',
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            } else {
              resolve(result);
            }
          },
        );
        toStream(file.buffer).pipe(upload);
      });
    }

    // for each file in files, upload it with the upload method above
    const uploadPromises = files.map(
      async (file, index) => await uploadFromBuffer(file, public_ids[index] ?? uniqueFilenames[index])
    );
    // wait for all uploads to finish
    const responses = await Promise.all(uploadPromises);
    // return the public_ids of the uploaded files
    return responses.map(response => cloudinary.v2.url(response.secure_url));
  }

  /**
   * Deletes an image from cloudinary by public_id.
   * @param public_id
   */
  async deleteFile(public_id: string): Promise<boolean> {
    const _delete = await cloudinary.v2.uploader.destroy(public_id, {
      invalidate: true,
    });
    return !!_delete;
  }
}
