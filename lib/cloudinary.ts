import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
}

export async function uploadToCloudinary(
  source: string,
  folder = 'food-photographer'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(source, {
    folder,
    transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
    resource_type: 'image',
  });
  return { url: result.secure_url, publicId: result.public_id, bytes: result.bytes };
}
