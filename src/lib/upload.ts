import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

export async function saveUpload(
  file: File,
  subdir: "resumes" | "photos"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || ".bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir = path.join(UPLOAD_DIR, subdir);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}
