const envCloudinaryUrl = process.env.CLOUDINARY_URL;
if (envCloudinaryUrl && !envCloudinaryUrl.startsWith("cloudinary://")) {
  // The Cloudinary SDK treats CLOUDINARY_URL as a connection string and
  // requires the cloudinary:// protocol. If a CDN URL or invalid value is
  // present in the environment, ignore it and use explicit credentials.
  delete process.env.CLOUDINARY_URL;
}

const { v2: cloudinary } = await import("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Recommended for Next.js apps
});

export default cloudinary;