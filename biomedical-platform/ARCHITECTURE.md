# 🏗️ BIOMEDICAL PLATFORM ARCHITECTURE

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Applications<br/>Next.js + React]
        MOBILE[Mobile Apps<br/>React Native]
        DICOM_VIEWER[DICOM Viewer<br/>CornerstoneJS]
    end

    subgraph "API Gateway & Load Balancer"
        LB[AWS Application<br/>Load Balancer]
        NGINX[Nginx Reverse Proxy]
        AUTH[Authentication Service<br/>OAuth 2.0 + JWT]
    end

    subgraph "Microservices Layer"
        AI_DIAG[AI Diagnostics Service<br/>Port 5001]
        MED_IMG[Medical Imaging AI<br/>Port 5002]
        BIOSENSE[Biosensing Service<br/>Port 5003]
        HIPAA[HIPAA Compliance<br/>Port 5004]
        BIOTENSOR[BioTensor Labs<br/>Port 5005]
        MYNX[MYNX NatalCare<br/>Port 5006]
    end

    subgraph "ML/AI Layer"
        KSERVE[KServe Model Serving]
        SAGEMAKER[AWS SageMaker]
        TF_SERVE[TensorFlow Serving]
        MLFLOW[MLflow Registry]
    end

    subgraph "Data Layer"
        TIMESCALE[(TimescaleDB<br/>PostgreSQL)]
        REDIS[(Redis Cache)]
        S3[(AWS S3<br/>Encrypted Storage)]
        KAFKA[Apache Kafka<br/>Streaming]
    end

    subgraph "External Integrations"
        PACS[PACS Systems<br/>Orthanc]
        EHR[EHR/FHIR<br/>Systems]
        IOT[AWS IoT Core<br/>Devices]
        WEARABLE[Wearable Devices<br/>Apple/Fitbit/Google]
    end

    subgraph "Security & Compliance"
        KMS[AWS KMS<br/>Encryption Keys]
        CLOUDTRAIL[CloudTrail<br/>Audit Logs]
        ATHENA[Athena<br/>Log Analysis]
    end

    subgraph "Monitoring & Observability"
        PROM[Prometheus]
        GRAFANA[Grafana]
        XRAY[AWS X-Ray]
    end

    WEB --> LB
    MOBILE --> LB
    DICOM_VIEWER --> LB
    LB --> NGINX
    NGINX --> AUTH

    AUTH --> AI_DIAG
    AUTH --> MED_IMG
    AUTH --> BIOSENSE
    AUTH --> HIPAA
    AUTH --> BIOTENSOR
    AUTH --> MYNX

    AI_DIAG --> KSERVE
    AI_DIAG --> TIMESCALE
    AI_DIAG --> REDIS
    AI_DIAG --> S3

    MED_IMG --> TF_SERVE
    MED_IMG --> PACS
    MED_IMG --> TIMESCALE
    MED_IMG --> S3

    BIOSENSE --> IOT
    BIOSENSE --> WEARABLE
    BIOSENSE --> KAFKA
    BIOSENSE --> TIMESCALE

    HIPAA --> KMS
    HIPAA --> CLOUDTRAIL
    HIPAA --> ATHENA

    BIOTENSOR --> MLFLOW
    BIOTENSOR --> SAGEMAKER
    BIOTENSOR --> TIMESCALE

    MYNX --> WEARABLE
    MYNX --> EHR
    MYNX --> TIMESCALE
    MYNX --> KAFKA

    AI_DIAG -.-> PROM
    MED_IMG -.-> PROM
    BIOSENSE -.-> PROM
    HIPAA -.-> PROM
    BIOTENSOR -.-> PROM
    MYNX -.-> PROM

    PROM --> GRAFANA
```

## Data Flow Architecture

### 1. AI Diagnostics Flow

```mermaid
sequenceDiagram
    participant C as Clinician
    participant API as AI Diagnostics API
    participant FS as Feature Store
    participant ML as ML Inference
    participant DB as TimescaleDB
    participant S3 as AWS S3

    C->>API: POST /diagnostics/analyze
    API->>DB: Fetch patient history
    DB-->>API: Patient data
    API->>FS: Extract features
    FS-->>API: Feature vector
    API->>ML: Run inference
    ML-->>API: Predictions + explanations
    API->>DB: Store results
    API->>S3: Archive data
    API-->>C: Diagnostic results
```

### 2. Medical Imaging Flow

```mermaid
sequenceDiagram
    participant R as Radiologist
    participant API as Imaging API
    participant PACS as Orthanc PACS
    participant CNN as CNN Model
    participant GC as Grad-CAM
    participant T as Triage Agent
    participant DB as TimescaleDB

    R->>API: Upload DICOM
    API->>PACS: Store DICOM
    PACS-->>API: Study ID
    API->>CNN: Analyze image
    CNN-->>API: Predictions
    API->>GC: Generate heatmap
    GC-->>API: Explanation overlay
    API->>T: Calculate uncertainty
    T-->>API: Triage decision
    API->>DB: Log analysis
    API-->>R: Results + Grad-CAM
```

### 3. Biosensing Data Flow

```mermaid
sequenceDiagram
    participant D as Wearable Device
    participant IOT as AWS IoT Core
    participant K as Kafka Stream
    participant API as Biosensing API
    participant AD as Anomaly Detection
    participant DB as TimescaleDB
    participant A as Alert Service

    D->>IOT: Send sensor readings
    IOT->>K: Publish message
    K->>API: Consume stream
    API->>DB: Store reading
    API->>AD: Check anomaly
    AD-->>API: Anomaly detected
    API->>A: Trigger alert
    A-->>D: Push notification
    API->>DB: Log alert
```

### 4. HIPAA Audit Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as Any API
    participant AL as Audit Logger
    participant DB as TimescaleDB
    participant S3 as S3 (Immutable)
    participant CT as CloudTrail

    U->>API: Access PHI data
    API->>AL: Log PHI access
    AL->>DB: Store audit log
    AL->>S3: Archive to S3
    API->>CT: AWS API call
    CT->>S3: Store CloudTrail log
```

## Component Architecture

### AI Diagnostics Service

```mermaid
graph LR
    subgraph "AI Diagnostics"
        API[Express API]
        CTRL[Controllers]
        SVC[Services]
        REPO[Repositories]
        ML[ML Models]
    end

    subgraph "Services"
        SVC1[ML Inference Service]
        SVC2[Feature Store Service]
        SVC3[Predictive Analytics]
        SVC4[Drug Discovery Service]
        SVC5[Clinical Decision Support]
    end

    API --> CTRL
    CTRL --> SVC
    SVC --> SVC1
    SVC --> SVC2
    SVC --> SVC3
    SVC --> SVC4
    SVC --> SVC5
    SVC --> REPO
    SVC --> ML
```

### Medical Imaging AI Service

```mermaid
graph LR
    subgraph "Medical Imaging AI"
        API[FastAPI]
        RT[Routers]
        SVC[Services]
        MOD[ML Models]
    end

    subgraph "Services"
        SVC1[Image Processing]
        SVC2[Grad-CAM Generator]
        SVC3[DICOM Handler]
        SVC4[Triage Agent]
        SVC5[Report Generator]
    end

    API --> RT
    RT --> SVC
    SVC --> SVC1
    SVC --> SVC2
    SVC --> SVC3
    SVC --> SVC4
    SVC --> SVC5
    SVC --> MOD
```

## Database Schema (Simplified)

```mermaid
erDiagram
    PATIENTS ||--o{ DIAGNOSTIC_REQUESTS : has
    PATIENTS ||--o{ MEDICAL_IMAGES : has
    PATIENTS ||--o{ BIOSENSOR_DEVICES : owns
    PATIENTS ||--o{ PREGNANCY_RECORDS : has

    DIAGNOSTIC_REQUESTS ||--|| DIAGNOSTIC_RESULTS : produces
    DIAGNOSTIC_REQUESTS ||--o{ LAB_RESULTS : includes

    MEDICAL_IMAGES ||--|| AI_IMAGE_ANALYSIS : has
    MEDICAL_IMAGES ||--o{ IMAGE_ANNOTATIONS : contains

    BIOSENSOR_DEVICES ||--o{ BIOSENSOR_READINGS : generates
    BIOSENSOR_READINGS ||--o{ BIOSENSOR_ALERTS : triggers

    PREGNANCY_RECORDS ||--o{ PRENATAL_VISITS : includes
    PREGNANCY_RECORDS ||--o{ RISK_ASSESSMENTS : has
    PREGNANCY_RECORDS ||--o{ MATERNAL_ALERTS : generates

    USERS ||--o{ AUDIT_LOGS : creates
    AUDIT_LOGS ||--|| PATIENTS : references

    ML_EXPERIMENTS ||--o{ MODEL_DEPLOYMENTS : produces
    ML_EXPERIMENTS ||--o{ FEATURE_VECTORS : uses
```

## Security Architecture

```mermaid
graph TB
    subgraph "External"
        USER[User/Device]
    end

    subgraph "Network Security"
        WAF[AWS WAF]
        ALB[Application Load Balancer]
        VPC[VPC with Private Subnets]
    end

    subgraph "Application Security"
        AUTH[OAuth 2.0 / JWT]
        MFA[Multi-Factor Auth]
        RBAC[Role-Based Access Control]
        RATE[Rate Limiting]
    end

    subgraph "Data Security"
        TRANSIT[TLS 1.3 in Transit]
        KMS[AWS KMS Encryption]
        AES[AES-256-GCM at Rest]
        VAULT[Secret Management]
    end

    subgraph "Audit & Compliance"
        AUDIT[Audit Logging]
        CLOUDTRAIL[CloudTrail]
        S3_LOGS[S3 Immutable Logs]
        ATHENA[Athena Analysis]
    end

    USER --> WAF
    WAF --> ALB
    ALB --> VPC
    VPC --> AUTH
    AUTH --> MFA
    MFA --> RBAC
    RBAC --> RATE

    RATE --> TRANSIT
    TRANSIT --> KMS
    KMS --> AES
    AES --> VAULT

    RBAC -.-> AUDIT
    AUDIT --> CLOUDTRAIL
    CLOUDTRAIL --> S3_LOGS
    S3_LOGS --> ATHENA
```

## Deployment Architecture (AWS EKS)

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Public Subnets"
            ALB[Application Load Balancer]
            NAT[NAT Gateway]
        end

        subgraph "Private Subnets - EKS"
            subgraph "Kubernetes Cluster"
                POD1[AI Diagnostics Pods]
                POD2[Medical Imaging Pods]
                POD3[Biosensing Pods]
                POD4[HIPAA Compliance Pods]
                POD5[BioTensor Labs Pods]
                POD6[MYNX NatalCare Pods]
                HPA[Horizontal Pod Autoscaler]
            end
        end

        subgraph "Data Layer"
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            ELASTICACHE[(ElastiCache Redis<br/>Multi-AZ)]
            S3[(S3 Buckets<br/>Encrypted)]
        end

        subgraph "Security"
            KMS[AWS KMS]
            IAM[IAM Roles]
            SG[Security Groups]
        end

        subgraph "Monitoring"
            CW[CloudWatch]
            XRAY[X-Ray]
        end
    end

    ALB --> POD1
    ALB --> POD2
    ALB --> POD3
    ALB --> POD4
    ALB --> POD5
    ALB --> POD6

    HPA -.-> POD1
    HPA -.-> POD2
    HPA -.-> POD3
    HPA -.-> POD4
    HPA -.-> POD5
    HPA -.-> POD6

    POD1 --> RDS
    POD2 --> RDS
    POD3 --> RDS
    POD4 --> RDS
    POD5 --> RDS
    POD6 --> RDS

    POD1 --> ELASTICACHE
    POD2 --> ELASTICACHE
    POD3 --> ELASTICACHE
    POD4 --> ELASTICACHE
    POD5 --> ELASTICACHE
    POD6 --> ELASTICACHE

    POD1 --> S3
    POD2 --> S3
    POD3 --> S3
    POD4 --> S3
    POD5 --> S3
    POD6 --> S3

    RDS -.-> KMS
    S3 -.-> KMS
    POD1 -.-> IAM
    POD2 -.-> IAM
    POD3 -.-> IAM
    POD4 -.-> IAM
    POD5 -.-> IAM
    POD6 -.-> IAM

    POD1 -.-> CW
    POD2 -.-> CW
    POD3 -.-> CW
    POD4 -.-> CW
    POD5 -.-> CW
    POD6 -.-> CW
```

## ML Model Pipeline

```mermaid
graph LR
    subgraph "Training"
        DATA[Training Data]
        PREP[Preprocessing]
        TRAIN[Model Training]
        EVAL[Evaluation]
        REG[Model Registry]
    end

    subgraph "Deployment"
        KSERVE[KServe]
        CANARY[Canary Deployment]
        PROD[Production]
        MONITOR[Performance Monitoring]
    end

    subgraph "Inference"
        API[API Request]
        INFER[Model Inference]
        EXPLAIN[Explainability]
        RESP[Response]
    end

    DATA --> PREP
    PREP --> TRAIN
    TRAIN --> EVAL
    EVAL --> REG
    REG --> KSERVE
    KSERVE --> CANARY
    CANARY --> PROD
    PROD --> MONITOR
    MONITOR -.Retrain.-> DATA

    API --> INFER
    PROD --> INFER
    INFER --> EXPLAIN
    EXPLAIN --> RESP
```

## CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source"
        GH[GitHub Repository]
        PR[Pull Request]
    end

    subgraph "Build & Test"
        LINT[Linting]
        UT[Unit Tests]
        IT[Integration Tests]
        BUILD[Docker Build]
        SCAN[Security Scan]
    end

    subgraph "Deploy to Dev"
        ECR[Push to ECR]
        TF[Terraform Apply]
        K8S_DEV[Deploy to Dev EKS]
        E2E[E2E Tests]
    end

    subgraph "Deploy to Staging"
        K8S_STG[Deploy to Staging]
        SMOKE[Smoke Tests]
        PERF[Performance Tests]
    end

    subgraph "Deploy to Production"
        APPROVE[Manual Approval]
        K8S_PROD[Deploy to Production]
        CANARY_PROD[Canary Rollout]
        ROLLBACK[Auto Rollback on Failure]
    end

    GH --> PR
    PR --> LINT
    LINT --> UT
    UT --> IT
    IT --> BUILD
    BUILD --> SCAN
    SCAN --> ECR
    ECR --> TF
    TF --> K8S_DEV
    K8S_DEV --> E2E
    E2E --> K8S_STG
    K8S_STG --> SMOKE
    SMOKE --> PERF
    PERF --> APPROVE
    APPROVE --> K8S_PROD
    K8S_PROD --> CANARY_PROD
    CANARY_PROD --> ROLLBACK
```

## Scalability Strategy

```mermaid
graph TB
    subgraph "Application Layer"
        direction LR
        HPA[Horizontal Pod<br/>Autoscaling]
        CACHE[Redis Caching]
        CDN[CloudFront CDN]
    end

    subgraph "Database Layer"
        direction LR
        READ_REPLICA[Read Replicas]
        CONN_POOL[Connection Pooling]
        PARTITION[Table Partitioning<br/>TimescaleDB]
    end

    subgraph "Storage Layer"
        direction LR
        S3_TIER[S3 Tiering]
        COMPRESS[Compression]
        LIFECYCLE[Lifecycle Policies]
    end

    subgraph "Compute Layer"
        direction LR
        GPU[GPU Instances<br/>for ML]
        SPOT[Spot Instances]
        FARGATE[Fargate Serverless]
    end

    LOAD[Increasing Load] --> HPA
    HPA --> CACHE
    CACHE --> CDN

    LOAD --> READ_REPLICA
    READ_REPLICA --> CONN_POOL
    CONN_POOL --> PARTITION

    LOAD --> S3_TIER
    S3_TIER --> COMPRESS
    COMPRESS --> LIFECYCLE

    ML_LOAD[ML Workload] --> GPU
    GPU --> SPOT
    SPOT --> FARGATE
```

## Disaster Recovery

```mermaid
graph TB
    subgraph "Primary Region (us-east-1)"
        EKS1[EKS Cluster]
        RDS1[(RDS Primary)]
        S3_1[(S3 Bucket)]
    end

    subgraph "Secondary Region (us-west-2)"
        EKS2[EKS Standby]
        RDS2[(RDS Replica)]
        S3_2[(S3 Replica)]
    end

    subgraph "Backup & Recovery"
        BACKUP[Automated Backups]
        SNAPSHOT[RDS Snapshots]
        PITR[Point-in-Time Recovery]
    end

    subgraph "Failover"
        R53[Route 53<br/>Health Checks]
        FAILOVER[Automatic Failover]
    end

    EKS1 -.Replication.-> EKS2
    RDS1 -.Replication.-> RDS2
    S3_1 -.Cross-Region Replication.-> S3_2

    RDS1 --> BACKUP
    BACKUP --> SNAPSHOT
    SNAPSHOT --> PITR

    R53 --> FAILOVER
    FAILOVER -.Activate.-> EKS2
    FAILOVER -.Promote.-> RDS2
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Web applications |
| | React Native | Mobile applications |
| | Tailwind CSS | Styling |
| | CornerstoneJS | DICOM viewer |
| **Backend** | Node.js 18+, Express.js | Microservices |
| | Python 3.11+, FastAPI | ML services |
| | TypeScript | Type safety |
| **Database** | PostgreSQL 15 | Relational data |
| | TimescaleDB | Time-series data |
| | Redis | Caching & sessions |
| **ML/AI** | TensorFlow, PyTorch | Deep learning |
| | scikit-learn, XGBoost | Classical ML |
| | KServe | Model serving |
| **Storage** | AWS S3 | Object storage |
| | AWS EBS | Block storage |
| **Messaging** | Apache Kafka | Event streaming |
| | AWS IoT Core | Device messaging |
| **Security** | AWS KMS | Key management |
| | OAuth 2.0, JWT | Authentication |
| | TLS 1.3 | Encryption |
| **Infrastructure** | AWS EKS | Kubernetes |
| | Terraform | IaC |
| | Docker | Containerization |
| **Monitoring** | Prometheus | Metrics |
| | Grafana | Dashboards |
| | CloudWatch | AWS monitoring |
| **CI/CD** | GitHub Actions | Pipelines |
| | AWS CodePipeline | Deployment |

---

**This architecture is designed for:**
- ✅ 99.9% uptime
- ✅ Horizontal scalability to millions of users
- ✅ HIPAA compliance
- ✅ FDA approval readiness
- ✅ Global deployment
- ✅ Disaster recovery (RPO: 1 hour, RTO: 4 hours)

**Next: Implement each microservice following this architecture!** 🚀
