/**
 * Database Configuration for TimescaleDB and PostgreSQL
 * Handles connections, pooling, and HIPAA-compliant encryption
 */

import { Pool, PoolConfig } from 'pg';
import { config } from 'dotenv';

config();

export interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | {
    rejectUnauthorized: boolean;
    ca?: string;
    key?: string;
    cert?: string;
  };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export const databaseConfig: DatabaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'biomedical_platform',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_SSL_CA,
    key: process.env.DATABASE_SSL_KEY,
    cert: process.env.DATABASE_SSL_CERT,
  } : false,
  max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '100'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create connection pool
export const pool = new Pool(databaseConfig);

// Pool error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize TimescaleDB extension and hypertables
export async function initializeTimescaleDB(): Promise<void> {
  const client = await pool.connect();

  try {
    // Enable TimescaleDB extension
    await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE');

    // Create hypertables for time-series data
    const hypertables = [
      {
        table: 'biosensor_readings',
        timeColumn: 'timestamp',
        partitionInterval: '1 day',
      },
      {
        table: 'feature_vectors',
        timeColumn: 'timestamp',
        partitionInterval: '1 day',
      },
      {
        table: 'audit_logs',
        timeColumn: 'timestamp',
        partitionInterval: '1 week',
      },
      {
        table: 'model_inference_logs',
        timeColumn: 'timestamp',
        partitionInterval: '1 day',
      },
      {
        table: 'maternal_vitals',
        timeColumn: 'timestamp',
        partitionInterval: '1 day',
      },
    ];

    for (const ht of hypertables) {
      try {
        await client.query(`
          SELECT create_hypertable(
            '${ht.table}',
            '${ht.timeColumn}',
            chunk_time_interval => INTERVAL '${ht.partitionInterval}',
            if_not_exists => TRUE
          );
        `);
        console.log(`✅ Hypertable created: ${ht.table}`);
      } catch (error) {
        console.log(`⚠️ Hypertable ${ht.table} may already exist`);
      }
    }

    // Set up compression policies
    await setupCompressionPolicies(client);

    // Set up retention policies
    await setupRetentionPolicies(client);

    // Create continuous aggregates
    await createContinuousAggregates(client);

    console.log('✅ TimescaleDB initialized successfully');
  } catch (error) {
    console.error('❌ TimescaleDB initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function setupCompressionPolicies(client: any): Promise<void> {
  const compressionPolicies = [
    { table: 'biosensor_readings', compress_after: '7 days' },
    { table: 'feature_vectors', compress_after: '7 days' },
    { table: 'audit_logs', compress_after: '30 days' },
    { table: 'model_inference_logs', compress_after: '7 days' },
    { table: 'maternal_vitals', compress_after: '7 days' },
  ];

  for (const policy of compressionPolicies) {
    try {
      await client.query(`
        SELECT add_compression_policy('${policy.table}', INTERVAL '${policy.compress_after}');
      `);
      console.log(`✅ Compression policy added for ${policy.table}`);
    } catch (error) {
      console.log(`⚠️ Compression policy for ${policy.table} may already exist`);
    }
  }
}

async function setupRetentionPolicies(client: any): Promise<void> {
  // HIPAA requires 6 years minimum retention for audit logs
  const retentionPolicies = [
    { table: 'biosensor_readings', drop_after: '2 years' },
    { table: 'feature_vectors', drop_after: '2 years' },
    { table: 'audit_logs', drop_after: '6 years' }, // HIPAA requirement
    { table: 'model_inference_logs', drop_after: '1 year' },
    { table: 'maternal_vitals', drop_after: '2 years' },
  ];

  for (const policy of retentionPolicies) {
    try {
      await client.query(`
        SELECT add_retention_policy('${policy.table}', INTERVAL '${policy.drop_after}');
      `);
      console.log(`✅ Retention policy added for ${policy.table}`);
    } catch (error) {
      console.log(`⚠️ Retention policy for ${policy.table} may already exist`);
    }
  }
}

async function createContinuousAggregates(client: any): Promise<void> {
  // Create continuous aggregates for real-time analytics
  const aggregates = [
    {
      name: 'hourly_biosensor_stats',
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_biosensor_stats
        WITH (timescaledb.continuous) AS
        SELECT
          time_bucket('1 hour', timestamp) AS bucket,
          patient_id,
          sensor_type,
          AVG(value) AS avg_value,
          MIN(value) AS min_value,
          MAX(value) AS max_value,
          STDDEV(value) AS stddev_value,
          COUNT(*) AS reading_count
        FROM biosensor_readings
        GROUP BY bucket, patient_id, sensor_type;
      `,
      refresh_policy: {
        start_offset: '2 hours',
        end_offset: '1 hour',
        schedule_interval: '1 hour',
      },
    },
    {
      name: 'daily_maternal_vitals',
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS daily_maternal_vitals
        WITH (timescaledb.continuous) AS
        SELECT
          time_bucket('1 day', timestamp) AS bucket,
          patient_id,
          AVG(heart_rate) AS avg_heart_rate,
          AVG(blood_pressure_systolic) AS avg_bp_systolic,
          AVG(blood_pressure_diastolic) AS avg_bp_diastolic,
          AVG(oxygen_saturation) AS avg_spo2,
          COUNT(*) AS measurement_count
        FROM maternal_vitals
        GROUP BY bucket, patient_id;
      `,
      refresh_policy: {
        start_offset: '2 days',
        end_offset: '1 day',
        schedule_interval: '1 day',
      },
    },
  ];

  for (const agg of aggregates) {
    try {
      await client.query(agg.query);

      // Add refresh policy
      await client.query(`
        SELECT add_continuous_aggregate_policy('${agg.name}',
          start_offset => INTERVAL '${agg.refresh_policy.start_offset}',
          end_offset => INTERVAL '${agg.refresh_policy.end_offset}',
          schedule_interval => INTERVAL '${agg.refresh_policy.schedule_interval}');
      `);

      console.log(`✅ Continuous aggregate created: ${agg.name}`);
    } catch (error) {
      console.log(`⚠️ Continuous aggregate ${agg.name} may already exist`);
    }
  }
}

// Query helpers with automatic connection management
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function transaction(callback: (client: any) => Promise<void>): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await callback(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  console.log('✅ Database connection pool closed');
}

process.on('SIGINT', closeDatabaseConnection);
process.on('SIGTERM', closeDatabaseConnection);
