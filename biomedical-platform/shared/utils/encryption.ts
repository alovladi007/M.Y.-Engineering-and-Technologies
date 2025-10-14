/**
 * Encryption Utilities for HIPAA Compliance
 * AES-256-GCM encryption for PHI data
 */

import crypto from 'crypto';
import { encryptData as kmsEncrypt, decryptData as kmsDecrypt } from '../config/aws';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Generate a secure encryption key from password
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Generate a random salt
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Generate a random IV (Initialization Vector)
 */
export function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encryptAES256(data: string | Buffer, key: Buffer): {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
} {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');

  const encrypted = Buffer.concat([
    cipher.update(dataBuffer),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return { encrypted, iv, authTag };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decryptAES256(
  encrypted: Buffer,
  key: Buffer,
  iv: Buffer,
  authTag: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted;
}

/**
 * Encrypt PHI data with envelope encryption (AWS KMS + AES-256)
 */
export async function encryptPHI(data: string | Buffer): Promise<{
  encryptedData: string; // Base64 encoded
  metadata: {
    algorithm: string;
    keyId: string;
    iv: string;
    authTag: string;
    encryptedAt: string;
  };
}> {
  try {
    // Generate data encryption key
    const dataKey = crypto.randomBytes(KEY_LENGTH);

    // Encrypt the data with the data key
    const { encrypted, iv, authTag } = encryptAES256(data, dataKey);

    // Encrypt the data key with AWS KMS
    const { ciphertext: encryptedDataKey, keyId } = await kmsEncrypt(dataKey);

    // Combine encrypted data key and encrypted data
    const combined = Buffer.concat([
      Buffer.from([encryptedDataKey.length]),
      encryptedDataKey,
      iv,
    authTag,
      encrypted,
    ]);

    return {
      encryptedData: combined.toString('base64'),
      metadata: {
        algorithm: ALGORITHM,
        keyId,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encryptedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error encrypting PHI:', error);
    throw new Error('PHI encryption failed');
  }
}

/**
 * Decrypt PHI data
 */
export async function decryptPHI(encryptedData: string): Promise<Buffer> {
  try {
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract encrypted data key length
    const encryptedDataKeyLength = combined[0];
    let offset = 1;

    // Extract encrypted data key
    const encryptedDataKey = combined.slice(offset, offset + encryptedDataKeyLength);
    offset += encryptedDataKeyLength;

    // Extract IV
    const iv = combined.slice(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;

    // Extract auth tag
    const authTag = combined.slice(offset, offset + AUTH_TAG_LENGTH);
    offset += AUTH_TAG_LENGTH;

    // Extract encrypted data
    const encrypted = combined.slice(offset);

    // Decrypt data key using AWS KMS
    const dataKey = await kmsDecrypt(encryptedDataKey);

    // Decrypt data using data key
    const decrypted = decryptAES256(encrypted, dataKey, iv, authTag);

    return decrypted;
  } catch (error) {
    console.error('Error decrypting PHI:', error);
    throw new Error('PHI decryption failed');
  }
}

/**
 * Hash sensitive data (one-way, for comparisons)
 */
export function hashData(data: string, salt?: Buffer): {
  hash: string;
  salt: string;
} {
  const finalSalt = salt || generateSalt();
  const hash = crypto.pbkdf2Sync(data, finalSalt, 100000, 64, 'sha512');

  return {
    hash: hash.toString('hex'),
    salt: finalSalt.toString('hex'),
  };
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, 'hex');
  const computedHash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512');

  return computedHash.toString('hex') === hash;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt object fields selectively
 */
export async function encryptObjectFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): Promise<T & { __encrypted_fields: string[] }> {
  const encrypted = { ...obj } as any;
  const encryptedFieldsList: string[] = [];

  for (const field of fieldsToEncrypt) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const value = typeof obj[field] === 'string' ? obj[field] : JSON.stringify(obj[field]);
      const { encryptedData } = await encryptPHI(value);
      encrypted[field] = encryptedData;
      encryptedFieldsList.push(field as string);
    }
  }

  encrypted.__encrypted_fields = encryptedFieldsList;

  return encrypted;
}

/**
 * Decrypt object fields
 */
export async function decryptObjectFields<T extends Record<string, any>>(
  obj: T & { __encrypted_fields?: string[] }
): Promise<T> {
  if (!obj.__encrypted_fields || obj.__encrypted_fields.length === 0) {
    return obj;
  }

  const decrypted = { ...obj } as any;

  for (const field of obj.__encrypted_fields) {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      try {
        const decryptedData = await decryptPHI(decrypted[field]);
        const value = decryptedData.toString('utf8');

        // Try to parse as JSON if it's an object
        try {
          decrypted[field] = JSON.parse(value);
        } catch {
          decrypted[field] = value;
        }
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
      }
    }
  }

  delete decrypted.__encrypted_fields;

  return decrypted;
}

/**
 * Generate checksum for data integrity verification
 */
export function generateChecksum(data: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Verify checksum
 */
export function verifyChecksum(data: Buffer | string, checksum: string): boolean {
  const computed = generateChecksum(data);
  return computed === checksum;
}

/**
 * Encrypt file for storage
 */
export async function encryptFile(fileBuffer: Buffer): Promise<{
  encryptedFile: Buffer;
  metadata: {
    algorithm: string;
    iv: string;
    authTag: string;
    checksum: string;
    encryptedAt: string;
  };
}> {
  // Generate checksum of original file
  const checksum = generateChecksum(fileBuffer);

  // Encrypt file using envelope encryption
  const { encryptedData, metadata } = await encryptPHI(fileBuffer);

  return {
    encryptedFile: Buffer.from(encryptedData, 'base64'),
    metadata: {
      ...metadata,
      checksum,
    },
  };
}

/**
 * Decrypt file
 */
export async function decryptFile(
  encryptedFile: Buffer,
  expectedChecksum?: string
): Promise<Buffer> {
  const decrypted = await decryptPHI(encryptedFile.toString('base64'));

  // Verify checksum if provided
  if (expectedChecksum && !verifyChecksum(decrypted, expectedChecksum)) {
    throw new Error('File integrity check failed - checksum mismatch');
  }

  return decrypted;
}

export default {
  deriveKey,
  generateSalt,
  generateIV,
  encryptAES256,
  decryptAES256,
  encryptPHI,
  decryptPHI,
  hashData,
  verifyHash,
  generateSecureToken,
  encryptObjectFields,
  decryptObjectFields,
  generateChecksum,
  verifyChecksum,
  encryptFile,
  decryptFile,
};
