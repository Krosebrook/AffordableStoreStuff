import { Storage, type File } from "@google-cloud/storage";
import type { Response } from "express";

export class ObjectStorageService {
  private storage: Storage;
  private bucketId: string;
  private publicObjectSearchPaths: string[];
  private privateObjectDir: string;

  constructor() {
    this.storage = new Storage();
    this.bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
    this.publicObjectSearchPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").filter(Boolean);
    this.privateObjectDir = process.env.PRIVATE_OBJECT_DIR || ".private";
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.publicObjectSearchPaths) {
      const fullPath = `${searchPath}/${filePath}`;
      const file = this.storage.bucket(this.bucketId).file(fullPath);
      const [exists] = await file.exists();
      if (exists) return file;
    }
    return null;
  }

  async downloadObject(file: File, res: Response): Promise<void> {
    const [metadata] = await file.getMetadata();
    if (metadata.contentType) res.setHeader("Content-Type", metadata.contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    file.createReadStream().pipe(res);
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const fileName = `${this.privateObjectDir}/uploads/${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const file = this.storage.bucket(this.bucketId).file(fileName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "application/octet-stream",
    });
    return url;
  }

  normalizeObjectEntityPath(imageURL: string): string {
    try {
      const url = new URL(imageURL);
      return url.pathname.replace(/^\//, "");
    } catch {
      return imageURL;
    }
  }
}
