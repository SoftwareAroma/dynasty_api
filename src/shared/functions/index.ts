import bcrypt from 'bcrypt';
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
