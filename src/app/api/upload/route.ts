import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user and verify admin privileges
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "dao-blogs";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // 3. Validate Mime Type
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a valid image (PNG, JPG, WebP, GIF, SVG).",
        },
        { status: 400 }
      );
    }

    // 4. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 400 }
      );
    }

    // 5. Convert to Buffer (Sanitize if SVG) and Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    if (file.type === "image/svg+xml") {
      const rawSvg = buffer.toString("utf-8");
      // Sanitize SVG without heavy Node jsdom dependencies: remove scripts and inline event handlers
      const cleanSvg = rawSvg
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
        .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
      buffer = Buffer.from(cleanSvg, "utf-8");
    }

    const result = await uploadImageToCloudinary(buffer, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload image to Cloudinary.",
      },
      { status: 500 }
    );
  }
}
