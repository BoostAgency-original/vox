import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private localStoragePath: string;

  constructor(private readonly configService: ConfigService) {
    const accessKey = this.configService.get('R2_ACCESS_KEY');
    const secretKey = this.configService.get('R2_SECRET_KEY');
    const endpoint = this.configService.get('R2_ENDPOINT');
    this.bucket = this.configService.get('R2_BUCKET') || 'vox-audio';
    
    // Local storage path - works both in dev and Docker
    // In Docker: /app/uploads, in dev: {project_root}/uploads
    const isDocker = process.env.NODE_ENV === 'production';
    this.localStoragePath = isDocker 
      ? '/app/uploads' 
      : path.resolve(process.cwd(), '../../uploads');
    
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }

    if (accessKey && secretKey && endpoint) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
    }
  }

  async uploadAudio(
    buffer: Buffer,
    originalName: string,
    sessionId: string,
    gender: string,
  ): Promise<string> {
    const ext = originalName.split('.').pop() || 'webm';
    const key = `${sessionId}/${gender}-${uuid()}.${ext}`;

    if (!this.s3Client) {
      // Local storage for development
      const localPath = path.join(this.localStoragePath, sessionId);
      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
      }
      const filePath = path.join(localPath, `${gender}-${uuid()}.${ext}`);
      fs.writeFileSync(filePath, buffer);
      console.log(`[DEV] Saved audio to: ${filePath}`);
      return `local://${filePath}`;
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: `audio/${ext}`,
      }),
    );

    return key;
  }

  async getAudioUrl(key: string): Promise<string> {
    if (!this.s3Client || key.startsWith('local://')) {
      return key;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getAudioBuffer(key: string): Promise<Buffer> {
    // Handle local storage
    if (key.startsWith('local://')) {
      const filePath = key.replace('local://', '');
      if (!fs.existsSync(filePath)) {
        throw new Error(`Local file not found: ${filePath}`);
      }
      return fs.readFileSync(filePath);
    }

    if (!this.s3Client) {
      throw new Error('Storage not configured');
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async deleteAudio(key: string): Promise<void> {
    if (!key) return;

    // Handle local storage
    if (key.startsWith('local://')) {
      const filePath = key.replace('local://', '');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Storage] Deleted local file: ${filePath}`);
      }
      return;
    }

    // S3/R2 deletion would go here if needed
    // For now, just log
    console.log(`[Storage] Would delete from S3: ${key}`);
  }
}

