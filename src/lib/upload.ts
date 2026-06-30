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

export async function saveUpload(
  file: File,
  subdir: "resumes" | "photos"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext =
    path.extname(file.name) || extFromMime(file.type) || ".bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir = path.join(UPLOAD_DIR, subdir);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}
