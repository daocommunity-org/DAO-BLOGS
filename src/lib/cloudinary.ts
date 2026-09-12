import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string = "dao-blogs"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ],
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extracts the Cloudinary public_id (including folder) from a full Cloudinary URL.
 * Only extracts if the URL belongs to this app's Cloudinary account.
 */
export function extractCloudinaryPublicId(
  url: string,
  cloudName: string = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
): string | null {
  if (!url || typeof url !== "string") return null;
  if (!cloudName) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes(cloudName)) return null;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = pathname.slice(uploadIndex + "/upload/".length);
    // Strip transformation parameters and version prefix (e.g. c_fill,w_300/v1789156383/)
    pathAfterUpload = pathAfterUpload.replace(/^(?:[a-z0-9_,-]+\/)*v\d+\//, "");
    // Also handle URLs without version prefix but with transformations
    pathAfterUpload = pathAfterUpload.replace(/^(?:[a-z]_[^/]+\/)+/, "");

    // Strip file extension (.png, .jpg, etc.)
    const lastDotIndex = pathAfterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.slice(0, lastDotIndex);
    }

    return pathAfterUpload.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Deletes a single image from Cloudinary by its public_id or full URL.
 * Safe and fail-tolerant (returns boolean, does not throw).
 */
export async function deleteImageFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  try {
    if (!urlOrPublicId) return false;
    const publicId = urlOrPublicId.startsWith("http")
      ? extractCloudinaryPublicId(urlOrPublicId)
      : urlOrPublicId;

    if (!publicId) return false;

    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    return result?.result === "ok" || result?.result === "not found";
  } catch (error) {
    console.error("Cloudinary delete error for", urlOrPublicId, ":", error);
    return false;
  }
}

/**
 * Extracts all Cloudinary image URLs from article HTML content and cover image.
 */
export function extractAllCloudinaryUrls(
  content: string = "",
  coverImage?: string,
  cloudName: string = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
): string[] {
  const urls = new Set<string>();
  if (!cloudName) return [];

  if (coverImage && coverImage.includes("res.cloudinary.com") && coverImage.includes(cloudName)) {
    urls.add(coverImage.trim());
  }

  if (content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(content)) !== null) {
      const src = match[1]?.trim();
      if (src && src.includes("res.cloudinary.com") && src.includes(cloudName)) {
        urls.add(src);
      }
    }
  }

  return Array.from(urls);
}

/**
 * Compares previously saved image URLs against newly submitted image URLs,
 * and deletes any orphaned images from Cloudinary in a non-blocking background batch.
 */
export async function deleteOrphanedCloudinaryImages(
  oldUrls: string[],
  newUrls: string[]
): Promise<void> {
  const newSet = new Set(newUrls);
  const orphanedUrls = oldUrls.filter((url) => !newSet.has(url));

  if (orphanedUrls.length === 0) return;

  // Run asynchronously with Promise.allSettled so failures never crash the caller
  const deletePromises = orphanedUrls.map(async (url) => {
    try {
      await deleteImageFromCloudinary(url);
    } catch (err) {
      console.error("Error deleting orphaned image:", url, err);
    }
  });

  await Promise.allSettled(deletePromises);
}

export { cloudinary };

