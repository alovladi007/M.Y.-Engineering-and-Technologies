-- AI Diagnostics Database Schema
-- Migration 001: Create core tables

-- Diagnostic Requests Table
CREATE TABLE IF NOT EXISTS diagnostic_requests (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'routine',
    requested_by UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnostic_requests_patient_id ON diagnostic_requests(patient_id);
CREATE INDEX idx_diagnostic_requests_status ON diagnostic_requests(status);
CREATE INDEX idx_diagnostic_requests_created_at ON diagnostic_requests(created_at DESC);

-- Feature Vectors Table (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS feature_vectors (
    diagnostic_id UUID NOT NULL,
    features JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (diagnostic_id, timestamp)
);

-- Convert to hypertable if not already
SELECT create_hypertable('feature_vectors', 'timestamp', if_not_exists => TRUE);

-- Add compression policy
SELECT add_compression_policy('feature_vectors', INTERVAL '7 days');

-- Add retention policy (2 years)
SELECT add_retention_policy('feature_vectors', INTERVAL '2 years');

-- Model Inference Logs Table (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS model_inference_logs (
    id UUID DEFAULT gen_random_uuid(),
    diagnostic_id UUID NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    inference_time_ms INTEGER NOT NULL,
    confidence FLOAT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
);

-- Convert to hypertable
SELECT create_hypertable('model_inference_logs', 'timestamp', if_not_exists => TRUE);

-- Add compression
SELECT add_compression_policy('model_inference_logs', INTERVAL '7 days');

-- Drug Discovery Tasks Table
CREATE TABLE IF NOT EXISTS drug_discovery_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_protein VARCHAR(200) NOT NULL,
    desired_properties JSONB NOT NULL,
    constraints JSONB,
    algorithm VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    results JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_drug_discovery_tasks_status ON drug_discovery_tasks(status);
CREATE INDEX idx_drug_discovery_tasks_created_at ON drug_discovery_tasks(created_at DESC);

-- Compound Library Table
CREATE TABLE IF NOT EXISTS compound_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200),
    smiles_string TEXT NOT NULL,
    molecular_weight FLOAT,
    molecular_formula VARCHAR(100),
    properties JSONB,
    bioactivity JSONB,
    toxicity JSONB,
    admet JSONB,
    generated_by VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compound_library_smiles ON compound_library USING hash(smiles_string);

-- Comments
COMMENT ON TABLE diagnostic_requests IS 'Stores diagnostic analysis requests and results';
COMMENT ON TABLE feature_vectors IS 'Time-series storage for ML features';
COMMENT ON TABLE model_inference_logs IS 'Logs all ML model inferences for monitoring';
COMMENT ON TABLE drug_discovery_tasks IS 'Drug discovery and optimization tasks';
COMMENT ON TABLE compound_library IS 'Chemical compound library for drug discovery';
