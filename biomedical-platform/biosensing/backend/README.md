# Biosensing Technology Backend

Real-time biosensor data processing backend with AWS IoT Core integration and WebSocket streaming. Built with Node.js, Express, Socket.IO, and PostgreSQL.

## 🚀 Features

### Core Capabilities

1. **AWS IoT Core Integration**
   - MQTT-based device communication
   - Secure device authentication (X.509 certificates)
   - Automatic reconnection with exponential backoff
   - Device lifecycle management
   - Command publishing to devices

2. **Real-time Data Processing**
   - High-throughput biosensor data ingestion (100+ Hz)
   - Data validation and quality scoring
   - Statistical anomaly detection (Z-score based)
   - Windowed signal processing
   - Metadata enrichment

3. **Alert Generation**
   - Multi-level thresholds (critical, warning, info)
   - Configurable per-sensor thresholds
   - Real-time alert notifications via WebSocket
   - Alert acknowledgment tracking
   - Batch alert operations

4. **WebSocket Streaming**
   - Socket.IO for bidirectional communication
   - Room-based subscriptions (per-device, per-patient)
   - Redis adapter for horizontal scaling
   - Real-time biosensor reading broadcast
   - Live alert notifications

5. **Patient Management**
   - Full patient CRUD operations
   - Medical history tracking
   - Device assignment
   - Emergency contact information
   - HIPAA-compliant data storage

6. **Device Management**
   - Device registration and configuration
   - Status monitoring (online, offline, error)
   - Firmware version tracking
   - Remote device commands
   - Patient-device associations

7. **Monitoring Sessions**
   - Session-based monitoring
   - Start/end/abort workflows
   - Automatic statistics collection
   - Session notes and metadata
   - Historical session tracking

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Main Express application
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── services/
│   │   ├── IoTDeviceManager.ts     # AWS IoT Core device management
│   │   └── BiosensorDataProcessor.ts # Real-time data processing
│   ├── routes/
│   │   ├── index.ts                # Routes setup
│   │   ├── devices.ts              # Device endpoints
│   │   ├── patients.ts             # Patient endpoints
│   │   ├── readings.ts             # Biosensor reading endpoints
│   │   ├── alerts.ts               # Alert endpoints
│   │   └── sessions.ts             # Monitoring session endpoints
│   ├── middleware/
│   │   └── errorHandler.ts         # Global error handling
│   ├── utils/
│   │   └── logger.ts               # Winston logger configuration
│   └── db/
│       └── prisma.ts               # Prisma client instance
├── prisma/
│   └── schema.prisma               # Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/PubSub**: Redis
- **Real-time**: Socket.IO
- **IoT**: AWS IoT Core (MQTT)
- **Queue**: Bull (Redis-based)
- **Logging**: Winston
- **Validation**: Joi
- **Authentication**: JWT

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## 🔐 AWS IoT Core Setup

### 1. Create IoT Thing

```bash
# Create thing
aws iot create-thing --thing-name biosensor-device-001

# Create certificate
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile cert.pem \
  --public-key-outfile public.key \
  --private-key-outfile private.key

# Attach policy to certificate
aws iot attach-policy \
  --policy-name BiosensorDevicePolicy \
  --target <certificate-arn>

# Attach certificate to thing
aws iot attach-thing-principal \
  --thing-name biosensor-device-001 \
  --principal <certificate-arn>
```

### 2. Download Root CA

```bash
mkdir -p certs
cd certs
curl -o AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

### 3. Configure Environment

```bash
AWS_IOT_ENDPOINT=your-endpoint.iot.us-east-1.amazonaws.com
AWS_IOT_PRIVATE_KEY_PATH=./certs/private.key
AWS_IOT_CERTIFICATE_PATH=./certs/cert.pem
AWS_IOT_CA_PATH=./certs/AmazonRootCA1.pem
```

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# The server will start on http://localhost:5003
```

## 🏗 Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📖 API Documentation

### Base URL

```
http://localhost:5003/api/v1
```

### Endpoints

#### Devices

- `GET /devices` - List all devices
- `GET /devices/:id` - Get device by ID
- `POST /devices` - Register new device
- `PATCH /devices/:id` - Update device
- `DELETE /devices/:id` - Delete device
- `POST /devices/:id/connect` - Connect device to IoT Core
- `POST /devices/:id/disconnect` - Disconnect device
- `POST /devices/:id/command` - Send command to device

#### Patients

- `GET /patients` - List all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PATCH /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient
- `GET /patients/:id/devices` - Get patient's devices
- `GET /patients/:id/alerts` - Get patient's alerts

#### Readings

- `GET /readings` - List biosensor readings
- `GET /readings/:id` - Get reading by ID
- `POST /readings` - Create reading (manual entry)
- `GET /readings/device/:deviceId/latest` - Latest readings for device
- `GET /readings/patient/:patientId/latest` - Latest readings for patient
- `GET /readings/statistics` - Reading statistics
- `DELETE /readings/:id` - Delete reading

#### Alerts

- `GET /alerts` - List all alerts
- `GET /alerts/:id` - Get alert by ID
- `POST /alerts/:id/acknowledge` - Acknowledge alert
- `POST /alerts/acknowledge-batch` - Acknowledge multiple alerts
- `GET /alerts/statistics` - Alert statistics
- `DELETE /alerts/:id` - Delete alert

#### Sessions

- `GET /sessions` - List monitoring sessions
- `GET /sessions/:id` - Get session by ID
- `POST /sessions` - Start new session
- `PATCH /sessions/:id` - Update session
- `POST /sessions/:id/end` - End session
- `POST /sessions/:id/abort` - Abort session
- `DELETE /sessions/:id` - Delete session

### WebSocket Events

#### Client → Server

- `subscribe:device` - Subscribe to device updates
- `subscribe:patient` - Subscribe to patient updates
- `unsubscribe` - Unsubscribe from room

#### Server → Client

- `biosensor:reading` - New biosensor reading
- `biosensor:alert` - New alert generated
- `biosensor:critical_alert` - Critical alert (broadcast to all)
- `biosensor:critical_reading` - Critical reading (broadcast to all)
- `device:status` - Device status change

## 🔧 Configuration

### Environment Variables

See [.env.example](./.env.example) for all configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `AWS_IOT_ENDPOINT` - AWS IoT Core endpoint
- `AWS_IOT_PRIVATE_KEY_PATH` - Device private key path
- `AWS_IOT_CERTIFICATE_PATH` - Device certificate path
- `AWS_IOT_CA_PATH` - Root CA certificate path

**Optional:**
- `PORT` - Server port (default: 5003)
- `LOG_LEVEL` - Logging level (default: info)
- `ENABLE_ANOMALY_DETECTION` - Enable anomaly detection (default: true)
- `BIOSENSOR_SAMPLING_RATE` - Expected sampling rate in Hz (default: 100)

### Alert Thresholds

Default thresholds are configured in `BiosensorDataProcessor`. Customize per sensor type:

```typescript
biosensorProcessor.updateAlertThresholds('heart_rate', {
  critical_low: 40,
  warning_low: 50,
  warning_high: 120,
  critical_high: 150,
});
```

## 🎯 Key Features Explained

### IoT Device Management

The `IoTDeviceManager` handles AWS IoT Core connections:

- **Automatic Reconnection**: Exponential backoff with max 5 attempts
- **Event-Driven**: Emits events for connection, data, alerts
- **Room-Based Broadcasting**: WebSocket rooms for device/patient subscriptions
- **MQTT Topics**:
  - `biosensor/{deviceId}/data` - Sensor readings
  - `biosensor/{deviceId}/status` - Device status
  - `biosensor/{deviceId}/alerts` - Critical alerts
  - `biosensor/{deviceId}/commands` - Device commands (publish)

### Real-time Data Processing

The `BiosensorDataProcessor` processes incoming readings:

1. **Validation**: Required fields, value ranges, timestamp checks
2. **Quality Scoring**: Signal strength, battery, noise analysis
3. **Buffering**: Time-windowed data buffer for statistical analysis
4. **Anomaly Detection**: Z-score based (3σ threshold)
5. **Alert Generation**: Multi-level threshold checking
6. **Streaming**: WebSocket broadcast to subscribed clients
7. **Persistence**: Automatic database storage via events

### Database Schema

- **Patients**: Demographics, medical history, contacts
- **Devices**: Hardware info, configuration, status
- **BiosensorReadings**: Timestamped sensor values with metadata
- **Alerts**: Threshold violations with acknowledgment tracking
- **MonitoringSessions**: Time-bound monitoring periods

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t biosensing-backend:latest .

# Run container
docker run -d \
  -p 5003:5003 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -v ./certs:/app/certs \
  biosensing-backend:latest
```

### Kubernetes

See the platform's Kubernetes manifests for full deployment configuration.

## 📊 Performance

- **Throughput**: 1000+ readings/second per device
- **Latency**: <50ms processing time per reading
- **Concurrent Devices**: 500+ simultaneous connections
- **WebSocket Clients**: 1000+ concurrent connections (with Redis adapter)

## 🔐 Security

- **TLS/SSL**: Required for AWS IoT Core connections
- **X.509 Certificates**: Device authentication
- **JWT**: API authentication (when enabled)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection**: Protected via Prisma ORM

## 🐛 Troubleshooting

### Device Not Connecting

- Verify AWS IoT endpoint is correct
- Check certificate paths in `.env`
- Ensure IoT policy allows `iot:Connect`, `iot:Subscribe`, `iot:Publish`
- Check device thing name matches

### High Memory Usage

- Reduce `PROCESSING_WINDOW_SIZE` in `.env`
- Implement data buffer cleanup
- Enable Redis adapter for Socket.IO

### Slow Database Queries

- Add indexes on frequently queried fields
- Use database connection pooling
- Enable query logging to identify slow queries

## 📈 Monitoring

- **Logs**: Winston logs to console and files (production)
- **Metrics**: Device connection count, reading throughput, alert rate
- **Health Check**: `GET /health` endpoint
- **Prisma Studio**: `npm run prisma:studio` for database inspection

## 🤝 Contributing

This is a proprietary project. For internal development guidelines, see the main platform documentation.

## 📝 License

Proprietary - M.Y. Engineering and Technologies

---

**Built with Node.js, TypeScript, AWS IoT Core, and Socket.IO**
