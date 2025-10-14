/**
 * AWS Services Configuration
 * Handles S3, KMS, EKS, RDS, CloudTrail, and other AWS services
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';
import { EKSClient } from '@aws-sdk/client-eks';
import { RDSClient } from '@aws-sdk/client-rds';
import { CloudTrailClient } from '@aws-sdk/client-cloudtrail';
import { config } from 'dotenv';

config();

// AWS Configuration
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// S3 Client
export const s3Client = new S3Client(awsConfig);

// KMS Client for encryption
export const kmsClient = new KMSClient(awsConfig);

// EKS Client
export const eksClient = new EKSClient(awsConfig);

// RDS Client
export const rdsClient = new RDSClient(awsConfig);

// CloudTrail Client
export const cloudTrailClient = new CloudTrailClient(awsConfig);

// S3 Bucket Configuration
export const s3Buckets = {
  imaging: process.env.S3_BUCKET_IMAGING || 'biomedical-imaging-data',
  features: process.env.S3_BUCKET_FEATURES || 'biomedical-features',
  models: process.env.S3_BUCKET_MODELS || 'biomedical-models',
  exports: process.env.S3_BUCKET_EXPORTS || 'biomedical-exports',
  auditLogs: process.env.HIPAA_AUDIT_LOG_BUCKET || 'biomedical-audit-logs',
  backups: process.env.HIPAA_BACKUP_BUCKET || 'biomedical-backups',
};

// KMS Key Configuration
export const kmsKeyId = process.env.AWS_KMS_KEY_ID || '';

/**
 * Upload file to S3 with server-side encryption using KMS
 */
export async function uploadToS3(
  bucket: string,
  key: string,
  data: Buffer | string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: kmsKeyId,
      Metadata: metadata,
    });

    await s3Client.send(command);
    return `s3://${bucket}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Download file from S3
 */
export async function downloadFromS3(bucket: string, key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as any;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  } catch (error) {
    console.error('Error downloading from S3:', error);
    throw error;
  }
}

/**
 * Encrypt data using AWS KMS
 */
export async function encryptData(plaintext: Buffer | string): Promise<{
  ciphertext: Buffer;
  keyId: string;
}> {
  try {
    const command = new EncryptCommand({
      KeyId: kmsKeyId,
      Plaintext: Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext),
    });

    const response = await kmsClient.send(command);

    return {
      ciphertext: Buffer.from(response.CiphertextBlob!),
      keyId: response.KeyId || kmsKeyId,
    };
  } catch (error) {
    console.error('Error encrypting data with KMS:', error);
    throw error;
  }
}

/**
 * Decrypt data using AWS KMS
 */
export async function decryptData(ciphertext: Buffer): Promise<Buffer> {
  try {
    const command = new DecryptCommand({
      CiphertextBlob: ciphertext,
    });

    const response = await kmsClient.send(command);
    return Buffer.from(response.Plaintext!);
  } catch (error) {
    console.error('Error decrypting data with KMS:', error);
    throw error;
  }
}

/**
 * Generate a data encryption key (envelope encryption)
 */
export async function generateDataKey(): Promise<{
  plaintext: Buffer;
  ciphertext: Buffer;
}> {
  try {
    const command = new GenerateDataKeyCommand({
      KeyId: kmsKeyId,
      KeySpec: 'AES_256',
    });

    const response = await kmsClient.send(command);

    return {
      plaintext: Buffer.from(response.Plaintext!),
      ciphertext: Buffer.from(response.CiphertextBlob!),
    };
  } catch (error) {
    console.error('Error generating data key:', error);
    throw error;
  }
}

/**
 * Upload encrypted file to S3 using envelope encryption
 */
export async function uploadEncryptedToS3(
  bucket: string,
  key: string,
  data: Buffer,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    // Generate data encryption key
    const { plaintext: dataKey, ciphertext: encryptedDataKey } = await generateDataKey();

    // Encrypt data with data key (using AES-256-GCM)
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);

    const encryptedData = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Combine encrypted data key, IV, auth tag, and encrypted data
    const combinedData = Buffer.concat([
      Buffer.from([encryptedDataKey.length]),
      encryptedDataKey,
      iv,
      authTag,
      encryptedData,
    ]);

    // Upload to S3
    return await uploadToS3(bucket, key, combinedData, metadata);
  } catch (error) {
    console.error('Error uploading encrypted file to S3:', error);
    throw error;
  }
}

/**
 * Download and decrypt file from S3
 */
export async function downloadDecryptedFromS3(bucket: string, key: string): Promise<Buffer> {
  try {
    // Download encrypted file
    const combinedData = await downloadFromS3(bucket, key);

    // Extract components
    const encryptedDataKeyLength = combinedData[0];
    let offset = 1;

    const encryptedDataKey = combinedData.slice(offset, offset + encryptedDataKeyLength);
    offset += encryptedDataKeyLength;

    const iv = combinedData.slice(offset, offset + 16);
    offset += 16;

    const authTag = combinedData.slice(offset, offset + 16);
    offset += 16;

    const encryptedData = combinedData.slice(offset);

    // Decrypt data key using KMS
    const dataKey = await decryptData(encryptedDataKey);

    // Decrypt data using data key
    const crypto = require('crypto');
    const decipher = crypto.createDecipheriv('aes-256-gcm', dataKey, iv);
    decipher.setAuthTag(authTag);

    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decryptedData;
  } catch (error) {
    console.error('Error downloading and decrypting file from S3:', error);
    throw error;
  }
}

/**
 * Get presigned URL for temporary access
 */
export async function getPresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

export default {
  s3Client,
  kmsClient,
  eksClient,
  rdsClient,
  cloudTrailClient,
  s3Buckets,
  uploadToS3,
  downloadFromS3,
  encryptData,
  decryptData,
  generateDataKey,
  uploadEncryptedToS3,
  downloadDecryptedFromS3,
  getPresignedUrl,
};
