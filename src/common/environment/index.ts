import * as dotenv from 'dotenv'
dotenv.config();

const PORT: number = parseInt(process.env.PORT, 10) || 5000
const DOMAINS : string = process.env.DOMAINS
const DATABASE_URL : string = process.env.DATABASE_URL
const ORIGIN_URL : string = process.env.ORIGIN_URL
const UPLOADS_DIR : string = process.env.UPLOADS_DIR
const STRIPE_SECRET_KEY : string = process.env.STRIPE_SECRET_KEY
const CLOUDINARY_NAME : string = process.env.CLOUDINARY_NAME
const CLOUDINARY_API_KEY : string = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET : string = process.env.CLOUDINARY_API_SECRET
const API_VERSION : string = process.env.API_VERSION
// JWT VARIABLES
const JWT_SECRET : string = process.env.JWT_SECRET
const JWT_ALGORITHM : string = process.env.JWT_ALGORITHM
const JWT_EXPIRES_IN : string = process.env.JWT_EXPIRES_IN

export default () => ({
  PORT,
  DOMAINS,
  DATABASE_URL,
  ORIGIN_URL,
  UPLOADS_DIR,
  STRIPE_SECRET_KEY,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  API_VERSION,
  JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
});

export {
  PORT,
  DOMAINS,
  DATABASE_URL,
  ORIGIN_URL,
  UPLOADS_DIR,
  STRIPE_SECRET_KEY,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  API_VERSION,
  JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
}
