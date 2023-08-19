import * as cloudinary from 'cloudinary'
import {CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME} from "@common";
import {FileUpload} from "graphql-upload";


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
    file: FileUpload,
    public_id?: string,
    folderName?: string,
    tag?: string,
): Promise<string> => {
    cloudinary.v2.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    })

    const uniqueFilename = new Date().toISOString()

    const result = await new Promise(async (resolve, reject) : Promise<any> =>
        file
            .createReadStream()
            .pipe(
                cloudinary.v2.uploader.upload_stream(
                    {
                        folder: folderName ?? 'dynasty',
                        public_id: public_id ?? uniqueFilename,
                        tags: tag ?? 'dynasty'
                    }, // directory and tags are optional
                    (err, image) : void => {
                        if (err) {
                            reject(err)
                        }
                        resolve(image)
                    }
                )
            )
            .on('error', () => reject(false))
    );

    // console.log('result ', result);

    return result['secure_url'];
}


/**
 * Returns image urls by upload files.
 * @param files
 * @param public_ids
 * @param folderName
 * @param tag
 */
export const uploadFiles = async (
    files: FileUpload[],
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

    const uploadPromises : Promise<string>[] = files.map((file:any, index:number) => {
        const public_id : string = public_ids ? public_ids[index] : undefined;
        return new Promise<string>(async (resolve, reject): Promise<void> => {
            file.createReadStream().pipe(
                cloudinary.v2.uploader.upload_stream(
                    {
                        folder: folderName ?? 'dynasty',
                        public_id: public_id ?? uniqueFilenames[index],
                        tags: tag ?? 'dynasty'
                    },
                    (err: cloudinary.UploadApiErrorResponse, image : cloudinary.UploadApiResponse) : void => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(image.secure_url);
                        }
                    }
                )
            )
                .on('error', (error: any) : void => {
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
export const deleteFile = async (public_id: string) : Promise<boolean> =>  {
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
