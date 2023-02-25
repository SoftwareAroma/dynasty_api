import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_API_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    public_id: string,
  ): Promise<string> {
    const uploadFromBuffer = async (): Promise<
      UploadApiResponse | UploadApiErrorResponse
    > => {
      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: folder,
            public_id: public_id,
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
    return cloudinary.url(response.secure_url);
  }

  async deleteFile(public_id: string): Promise<boolean> {
    const _delete = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
    });
    return !!_delete;
  }
}
