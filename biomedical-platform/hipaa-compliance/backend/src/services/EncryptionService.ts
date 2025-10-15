/**
 * Encryption Service - AES-256-GCM encryption for PHI data
 * HIPAA-compliant encryption and decryption
 */

import crypto from 'crypto';
import { promisify } from 'util';
import logger from '../utils/logger';

const randomBytes = promisify(crypto.randomBytes);
const scrypt = promisify(crypto.scrypt);

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag: string;
  keyId: string;
  algorithm: string;
}

export interface DecryptionInput {
  encryptedData: string;
  iv: string;
  authTag: string;
  key: Buffer;
  algorithm: string;
}

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits
  private saltLength = 32;
  private authTagLength = 16;

  // Master encryption key (should be stored in AWS KMS or similar in production)
  private masterKey: Buffer;

  constructor(masterKeyHex?: string) {
    // In production, retrieve from AWS KMS or secrets manager
    const key = masterKeyHex || process.env.MASTER_ENCRYPTION_KEY;

    if (!key) {
      throw new Error('Master encryption key not configured');
    }

    this.masterKey = Buffer.from(key, 'hex');

    if (this.masterKey.length !== this.keyLength) {
      throw new Error(`Master key must be ${this.keyLength} bytes (${this.keyLength * 2} hex characters)`);
    }

    logger.info('Encryption Service initialized with AES-256-GCM');
  }

  /**
   * Generate a new encryption key (DEK - Data Encryption Key)
   */
  async generateKey(): Promise<Buffer> {
    return await randomBytes(this.keyLength);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(
    plaintext: string,
    key?: Buffer,
    additionalData?: string
  ): Promise<EncryptionResult> {
    try {
      // Use provided key or generate new one
      const dataKey = key || (await this.generateKey());

      // Generate random IV
      const iv = await randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, dataKey, iv);

      // Add additional authenticated data if provided
      if (additionalData) {
        cipher.setAAD(Buffer.from(additionalData, 'utf8'));
      }

      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyId: this.generateKeyId(dataKey),
        algorithm: this.algorithm,
      };
    } catch (error) {
      logger.error('Encryption failed', { error });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(input: DecryptionInput, additionalData?: string): Promise<string> {
    try {
      const { encryptedData, iv, authTag, key, algorithm } = input;

      // Create decipher
      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, 'base64')
      );

      // Set auth tag
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));

      // Add additional authenticated data if provided
      if (additionalData) {
        decipher.setAAD(Buffer.from(additionalData, 'utf8'));
      }

      // Decrypt
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption failed', { error });
      throw new Error('Failed to decrypt data - data may be corrupted or tampered');
    }
  }

  /**
   * Encrypt a DEK with the master KEK (Key Encryption Key)
   */
  async encryptKey(dataKey: Buffer): Promise<EncryptionResult> {
    const keyString = dataKey.toString('base64');
    return await this.encrypt(keyString, this.masterKey);
  }

  /**
   * Decrypt a DEK using the master KEK
   */
  async decryptKey(encryptedKeyData: EncryptionResult): Promise<Buffer> {
    const decrypted = await this.decrypt({
      encryptedData: encryptedKeyData.encryptedData,
      iv: encryptedKeyData.iv,
      authTag: encryptedKeyData.authTag,
      key: this.masterKey,
      algorithm: encryptedKeyData.algorithm,
    });

    return Buffer.from(decrypted, 'base64');
  }

  /**
   * Hash data using SHA-256 (for integrity checks)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * Verify hash
   */
  verifyHash(data: string, expectedHash: string): boolean {
    const actualHash = this.hash(data);
    return crypto.timingSafeEqual(
      Buffer.from(actualHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  }

  /**
   * Generate a key ID from key bytes
   */
  private generateKeyId(key: Buffer): string {
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
  }

  /**
   * Derive key from password (for password-based encryption)
   */
  async deriveKeyFromPassword(
    password: string,
    salt?: Buffer
  ): Promise<{ key: Buffer; salt: Buffer }> {
    const keySalt = salt || (await randomBytes(this.saltLength));
    const key = (await scrypt(password, keySalt, this.keyLength)) as Buffer;

    return { key, salt: keySalt };
  }

  /**
   * Encrypt field-level data (for database columns)
   */
  async encryptField(
    fieldValue: string,
    fieldName: string,
    recordId: string
  ): Promise<{
    encrypted: string;
    iv: string;
    authTag: string;
    hash: string;
  }> {
    // Use field name and record ID as additional authenticated data
    const aad = `${fieldName}:${recordId}`;

    const result = await this.encrypt(fieldValue, undefined, aad);

    return {
      encrypted: result.encryptedData,
      iv: result.iv,
      authTag: result.authTag,
      hash: this.hash(fieldValue),
    };
  }

  /**
   * Decrypt field-level data
   */
  async decryptField(
    encrypted: string,
    iv: string,
    authTag: string,
    key: Buffer,
    fieldName: string,
    recordId: string
  ): Promise<string> {
    const aad = `${fieldName}:${recordId}`;

    return await this.decrypt(
      {
        encryptedData: encrypted,
        iv,
        authTag,
        key,
        algorithm: this.algorithm,
      },
      aad
    );
  }

  /**
   * Generate HMAC for message authentication
   */
  generateHMAC(data: string, key: Buffer): string {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, key: Buffer, expectedHMAC: string): boolean {
    const actualHMAC = this.generateHMAC(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(actualHMAC, 'hex'),
      Buffer.from(expectedHMAC, 'hex')
    );
  }

  /**
   * Generate secure random token
   */
  async generateToken(length: number = 32): Promise<string> {
    const buffer = await randomBytes(length);
    return buffer.toString('hex');
  }

  /**
   * Encrypt file buffer
   */
  async encryptFile(fileBuffer: Buffer, key?: Buffer): Promise<EncryptionResult> {
    const dataKey = key || (await this.generateKey());
    const base64Data = fileBuffer.toString('base64');
    return await this.encrypt(base64Data, dataKey);
  }

  /**
   * Decrypt file buffer
   */
  async decryptFile(input: DecryptionInput): Promise<Buffer> {
    const base64Data = await this.decrypt(input);
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Rotate encryption key (re-encrypt data with new key)
   */
  async rotateKey(
    oldKey: Buffer,
    encryptedData: EncryptionResult
  ): Promise<{ newKey: Buffer; newEncryption: EncryptionResult }> {
    try {
      // Decrypt with old key
      const plaintext = await this.decrypt({
        encryptedData: encryptedData.encryptedData,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
        key: oldKey,
        algorithm: encryptedData.algorithm,
      });

      // Generate new key
      const newKey = await this.generateKey();

      // Re-encrypt with new key
      const newEncryption = await this.encrypt(plaintext, newKey);

      return { newKey, newEncryption };
    } catch (error) {
      logger.error('Key rotation failed', { error });
      throw new Error('Failed to rotate encryption key');
    }
  }

  /**
   * Sanitize sensitive data for logging
   */
  sanitizeForLogging(data: any): any {
    const sensitiveFields = [
      'password',
      'ssn',
      'credit_card',
      'api_key',
      'secret',
      'token',
      'private_key',
    ];

    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key in sanitized) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeForLogging(sanitized[key]);
        }
      }
      return sanitized;
    }

    return data;
  }
}

// Export singleton instance
let encryptionServiceInstance: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new EncryptionService();
  }
  return encryptionServiceInstance;
}
