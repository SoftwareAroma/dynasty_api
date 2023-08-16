import * as cloudinary from 'cloudinary'
import {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_NAME
} from "@common";


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
    file: any,
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
            .on('close', () : void => {
                resolve(true)
            })
            .on('error', () => reject(false))
    )

    return result['secure_url'];
}

/**
 * Delete file from cloudinary
 * @param public_id
 */
export const deleteFile = async (public_id: string) : Promise<boolean> =>  {
    const _delete = await cloudinary.v2.uploader.destroy(public_id, {
        invalidate: true,
    });
    return !!_delete;
}
