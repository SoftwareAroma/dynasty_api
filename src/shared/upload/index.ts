import * as cloudinary from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from "@shared/common";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import toStream = require('buffer-to-stream');


/**
 * Returns image url by upload file.
 *
 * @remarks
 * This method is part of the {@link @shared/upload}.
 *
 * @param file - 1st input
 *
 * @param public_id
 * @param folderName
 * @param tag
 * @returns The string mean of `createReadStream`
 *
 * @beta
 */
export const uploadFile = async (
    file: Express.Multer.File,
    public_id?: string,
    folderName?: string,
    tag?: string,
): Promise<string> => {
    cloudinary.v2.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    })

    const uniqueFilename: string = new Date().toISOString()
    const uploadFromBuffer = async (): Promise<
        UploadApiResponse | UploadApiErrorResponse
    > => {
        return new Promise((resolve, reject): void => {
            const upload = cloudinary.v2.uploader.upload_stream(
                {
                    folder: folderName ?? 'dynasty',
                    public_id: public_id ?? uniqueFilename,
                    tags: tag ?? 'dynasty'
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
 * Returns image urls by upload files.
 * @param files
 * @param public_ids
 * @param folderName
 * @param tag
 */
export const uploadFiles = async (
    files: Express.Multer.File[],
    public_ids?: string[],
    folderName?: string,
    tag?: string,
): Promise<string[]> => {
    cloudinary.v2.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    })

    const uniqueFilenames: string[] = files.map(() => new Date().toISOString());

    const uploadPromises: Promise<string>[] = files.map((file: any, index: number) => {
        const public_id: string = public_ids ? public_ids[index] : undefined;
        return new Promise<string>(async (resolve, reject): Promise<void> => {
            file.createReadStream().pipe(
                cloudinary.v2.uploader.upload_stream(
                    {
                        folder: folderName ?? 'dynasty',
                        public_id: public_id ?? uniqueFilenames[index],
                        tags: tag ?? 'dynasty'
                    },
                    (err: cloudinary.UploadApiErrorResponse, image: cloudinary.UploadApiResponse): void => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(image.secure_url);
                        }
                    }
                )
            )
                .on('error', (error: any): void => {
                    reject(error);
                });
        });
    });

    try {
        // console.log('secureUrls', secureUrls);
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
}



/**
 * Delete file from cloudinary
 * @param public_id
 */
export const deleteFile = async (public_id: string): Promise<boolean> => {
    cloudinary.v2.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    })
    const _delete = await cloudinary.v2.uploader.destroy(public_id, {
        invalidate: true,
    });
    return !!_delete;
}


/**
 * use this to store images on the local server
 * it takes the destination path in a string format
 * @param destination
 */
export const storage = (destination: string) => multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.join(`${process.cwd()}/`, `${destination}`);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, `${destination}`)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = file.mimetype.split('/')[1]
        console.log(file.fieldname + '-' + uniqueSuffix + '.' + ext)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
    }
});
