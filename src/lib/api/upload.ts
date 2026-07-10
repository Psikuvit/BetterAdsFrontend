import { apiRequest } from "../http";

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export function presignUpload(key: string, contentType: string) {
  return apiRequest<{ url: string }>("/api/upload/presign", {
    method: "POST",
    body: { key, contentType },
  });
}

export async function putToS3(url: string, file: File, contentType: string) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed with status ${res.status}`);
  }
}

export function confirmUpload(input: {
  campaignId: number;
  title: string;
  storageKey: string;
  targetLocale?: string;
}) {
  return apiRequest<{ status: string; adId: number }>("/api/upload/confirm", {
    method: "POST",
    body: input,
  });
}
