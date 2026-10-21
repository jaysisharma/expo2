import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { getAdminSession } from "@/lib/session";

// Visitors can only upload payment screenshots; everything else needs an admin login
const PUBLIC_FOLDER = "gala-screenshots";
const PUBLIC_MAX_BYTES = 10 * 1024 * 1024;
const PUBLIC_TYPES = /^(image\/(png|jpe?g|webp|heic|heif)|application\/pdf)$/i;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isAdmin = !!(await getAdminSession(req));

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = isAdmin ? (formData.get("folder") as string) || "expo" : PUBLIC_FOLDER;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      if (!isAdmin && (file.size > PUBLIC_MAX_BYTES || !PUBLIC_TYPES.test(file.type))) {
        return NextResponse.json(
          { success: false, error: "Please upload an image or PDF under 10MB" },
          { status: 400 }
        );
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "File size exceeds 50MB limit" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `expo/${folder.replace(/^expo\/?/, "")}`,
            resource_type: "auto",
          },
          (error, res) => {
            if (error || !res) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve(res);
            }
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    // JSON upload with base64 data URI or remote image URL
    if (contentType.includes("application/json")) {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const { image, folder = "expo" } = body;

      if (!image) {
        return NextResponse.json(
          { success: false, error: "No image URL or base64 data provided" },
          { status: 400 }
        );
      }

      const result = await cloudinary.uploader.upload(image, {
        folder: `expo/${folder.replace(/^expo\/?/, "")}`,
        resource_type: "auto",
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported Content-Type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Cloudinary upload route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
