import bcrypt from 'bcrypt';

// hash password with bcrypt
export const hashPassword = async (password: string, salt: string): Promise<string> => {
    return await bcrypt.hash(password, salt);
};

// compare password with bcrypt
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

// generate salt
export const generateSalt = async (): Promise<string> => {
    return await bcrypt.genSalt(10);
};