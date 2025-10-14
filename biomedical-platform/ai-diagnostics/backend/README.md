# AI-Powered Diagnostics Backend

Comprehensive AI diagnostics service featuring disease detection, predictive analytics, clinical decision support, and drug discovery assistance.

## Features

- **Disease Detection**: ML-powered diagnostic analysis
- **Predictive Analytics**: Risk score calculation and trend analysis
- **Clinical Decision Support**: Treatment recommendations and guidelines
- **Drug Discovery**: Compound generation and optimization (placeholder)
- **Feature Store**: TimescaleDB-based feature storage
- **HIPAA Compliant**: Audit logging and encryption

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + TimescaleDB
- **ML**: TensorFlow.js
- **Cache**: Redis
- **Cloud**: AWS (S3, KMS)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Diagnostics
```
POST /api/v1/diagnostics/analyze
GET  /api/v1/diagnostics/:id
GET  /api/v1/diagnostics/patient/:patientId
GET  /api/v1/diagnostics/patient/:patientId/history
POST /api/v1/diagnostics/:id/export
```

### Risk Assessment
```
POST /api/v1/risk-assessment/calculate
```

### Drug Discovery (Placeholder)
```
POST /api/v1/drug-discovery/generate
POST /api/v1/drug-discovery/optimize
```

## Authentication

All API endpoints require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/v1/diagnostics/analyze
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Docker

```bash
# Build image
docker build -t biomedical/ai-diagnostics:latest .

# Run container
docker run -p 5001:5001 \
  -e DATABASE_HOST=host.docker.internal \
  -e REDIS_HOST=host.docker.internal \
  biomedical/ai-diagnostics:latest
```

## Project Structure

```
src/
├── index.ts              # Main server entry point
├── controllers/          # Request handlers
│   └── DiagnosticsController.ts
├── services/             # Business logic
│   ├── MLInferenceService.ts
│   ├── FeatureStoreService.ts
│   ├── PredictiveAnalyticsService.ts
│   └── ClinicalDecisionSupportService.ts
├── repositories/         # Data access layer
│   └── DiagnosticsRepository.ts
├── routes/               # API routes
│   ├── diagnostics.ts
│   ├── drug-discovery.ts
│   └── risk-assessment.ts
├── middleware/           # Express middleware
│   ├── auth.ts
│   └── validators.ts
├── database/             # Database migrations
│   └── migrations/
└── __tests__/            # Test files
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

PROPRIETARY - M.Y. Engineering and Technologies
