import bcrypt from 'bcrypt';
// import multer from 'multer';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as process from 'process';

// hash password with bcrypt
export const hashPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  return await bcrypt.hash(password, salt);
};

// compare password with bcrypt
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// generate salt
export const generateSalt = async (): Promise<string> => {
  return await bcrypt.genSalt(10);
};

// export const storage = (destination:string) => multer.diskStorage({
//     destination: function (req, file, cb) {
//         const folderPath = path.join(`${process.cwd()}/`, `${destination}`);
//         if(!fs.existsSync(folderPath)){
//             fs.mkdirSync(folderPath, {recursive: true});
//         }
//         cb(null, `${destination}`)
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         const ext = file.mimetype.split('/')[1]
//         console.log(file.fieldname + '-' + uniqueSuffix + '.' + ext)
//         cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
//     }
// });

// Helper function to get the default value for a property type
export const getDefaultPropertyValue = <T>(value: T): T => {
  if (typeof value === 'boolean') {
    return false as T;
  }else if(typeof value === 'string'){
    return '' as T;
  } else if (typeof value === 'number') {
    return 0 as T;
  } else if (typeof value === 'object' && Array.isArray(value)) {
    return [] as T;
  } else if (typeof value === 'object' && value !== null) {
    return {} as T;
  }
  // Add more cases for other types as needed
  return value;
}
