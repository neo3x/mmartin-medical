import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function uploadFile(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ key: string; url: string }> {
  const key = `${folder}/${nanoid()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
  return { key, url: publicUrl };
}

export async function getFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function uploadUserFile(
  userId: string,
  file: Buffer,
  fileName: string,
  contentType: string,
  type: 'exam' | 'medication' | 'profile' | 'other'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, contentType, `users/${userId}/${type}`);
}

export async function uploadBase64File(
  base64Data: string,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ key: string; url: string }> {
  const buffer = Buffer.from(base64Data, 'base64');
  return uploadFile(buffer, fileName, contentType, folder);
}
