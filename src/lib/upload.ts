import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

function extFromMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
  };
  return map[mime] ?? "";
}

function useR2() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function validateUpload(
  file: File,
  type: "resume" | "photo"
): string | null {
  const allowed = type === "photo" ? PHOTO_TYPES : RESUME_TYPES;
  const maxSize = type === "photo" ? MAX_PHOTO_BYTES : MAX_RESUME_BYTES;

  if (!allowed.has(file.type)) {
    return type === "photo"
      ? "请上传 JPG、PNG、WebP 或 GIF 图片"
      : "请上传 PDF、Word 或图片文件";
  }

  if (file.size > maxSize) {
    return type === "photo" ? "图片不能超过 5MB" : "文件不能超过 10MB";
  }

  return null;
}

async function saveToR2(
  buffer: Buffer,
  file: File,
  subdir: "resumes" | "photos",
  filename: string
): Promise<string> {
  const key = `${subdir}/${filename}`;
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${publicUrl}/${key}`;
}

async function saveLocally(
  buffer: Buffer,
  subdir: "resumes" | "photos",
  filename: string
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}

export async function saveUpload(
  file: File,
  subdir: "resumes" | "photos"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext =
    path.extname(file.name) || extFromMime(file.type) || ".bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  if (useR2()) {
    return saveToR2(buffer, file, subdir, filename);
  }

  return saveLocally(buffer, subdir, filename);
}
