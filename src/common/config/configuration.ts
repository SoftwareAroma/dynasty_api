export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  domain: process.env.DOMAIN,
  database: process.env.DATABASE_URL,
  origin: process.env.ORIGIN_URL,
  uploadsDir: process.env.UPLOADS_DIR,
});
