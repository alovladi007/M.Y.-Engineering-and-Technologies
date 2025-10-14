/**
 * Shared TypeScript Types for Biomedical Platform
 * Comprehensive type definitions for all biomedical services
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  processingTime: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// PATIENT & CLINICAL DATA
// ============================================================================

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  demographics: PatientDemographics;
  insurance?: InsuranceInfo;
  consentStatus: ConsentStatus;
  privacyPreferences: PrivacyPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDemographics {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  sex: 'male' | 'female' | 'other' | 'unknown';
  gender?: string;
  ethnicity?: string;
  language: string;
  address?: Address;
  contactInfo: ContactInfo;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberId: string;
}

export interface ConsentStatus {
  dataSharing: boolean;
  researchParticipation: boolean;
  aiAnalysis: boolean;
  signedDate: Date;
  expiryDate?: Date;
}

export interface PrivacyPreferences {
  allowNotifications: boolean;
  allowEmailCommunication: boolean;
  allowSMSCommunication: boolean;
  shareWithCareTeam: boolean;
}

// ============================================================================
// MEDICAL IMAGING
// ============================================================================

export interface MedicalImage {
  id: string;
  patientId: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID: string;
  modality: ImageModality;
  bodyPart: string;
  studyDate: Date;
  studyDescription?: string;
  imageData: ImageData;
  metadata: DicomMetadata;
  status: ImageStatus;
  annotations?: ImageAnnotation[];
  aiAnalysis?: AIImageAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export type ImageModality = 'CT' | 'MRI' | 'X-RAY' | 'ULTRASOUND' | 'PET' | 'MAMMOGRAPHY' | 'PATHOLOGY';

export type ImageStatus = 'uploaded' | 'processing' | 'analyzed' | 'reviewed' | 'approved' | 'rejected';

export interface ImageData {
  s3Key: string;
  s3Bucket: string;
  format: 'DICOM' | 'NIFTI' | 'PNG' | 'JPEG';
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  fileSize: number;
  checksum: string;
}

export interface DicomMetadata {
  patientName?: string;
  patientID?: string;
  studyDate?: string;
  institutionName?: string;
  manufacturer?: string;
  stationName?: string;
  sliceThickness?: number;
  kvp?: number;
  exposureTime?: number;
  [key: string]: any;
}

export interface ImageAnnotation {
  id: string;
  annotatorId: string;
  annotatorType: 'human' | 'ai';
  annotationType: 'bounding_box' | 'segmentation' | 'point' | 'measurement';
  coordinates: AnnotationCoordinates;
  label: string;
  confidence?: number;
  notes?: string;
  createdAt: Date;
}

export interface AnnotationCoordinates {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  depth?: number;
  points?: Array<{x: number; y: number; z?: number}>;
  mask?: string; // Base64 encoded mask for segmentation
}

export interface AIImageAnalysis {
  analysisId: string;
  modelName: string;
  modelVersion: string;
  predictions: ImagePrediction[];
  explanations: ExplanationMap;
  triageRecommendation: TriageRecommendation;
  confidence: number;
  processingTime: number;
  timestamp: Date;
}

export interface ImagePrediction {
  finding: string;
  probability: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
  location?: AnnotationCoordinates;
  icd10Code?: string;
}

export interface ExplanationMap {
  gradCAM?: GradCAMExplanation;
  smoothGrad?: SmoothGradExplanation;
  attentionMaps?: AttentionMapExplanation;
  boundingBoxes?: BoundingBoxExplanation[];
}

export interface GradCAMExplanation {
  heatmapUrl: string;
  overlayUrl: string;
  method: 'grad-cam' | 'grad-cam++' | 'score-cam';
  targetLayer: string;
}

export interface SmoothGradExplanation {
  saliencyMapUrl: string;
  noiseLevel: number;
  samples: number;
}

export interface AttentionMapExplanation {
  attentionWeights: number[][];
  visualizationUrl: string;
}

export interface BoundingBoxExplanation {
  coordinates: AnnotationCoordinates;
  label: string;
  confidence: number;
  color: string;
}

export interface TriageRecommendation {
  priority: 'routine' | 'urgent' | 'stat';
  suggestedAction: string;
  requiresRadiologistReview: boolean;
  uncertainty: number;
  reasoning: string;
}

// ============================================================================
// AI DIAGNOSTICS
// ============================================================================

export interface DiagnosticRequest {
  id: string;
  patientId: string;
  requestType: DiagnosticType;
  inputData: DiagnosticInput;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestedBy: string;
  status: DiagnosticStatus;
  result?: DiagnosticResult;
  createdAt: Date;
  updatedAt: Date;
}

export type DiagnosticType =
  | 'disease_detection'
  | 'risk_prediction'
  | 'treatment_recommendation'
  | 'drug_discovery'
  | 'prognosis_estimation'
  | 'pathology_analysis';

export type DiagnosticStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface DiagnosticInput {
  images?: string[]; // Image IDs
  labResults?: LabResult[];
  vitalSigns?: VitalSigns;
  clinicalNotes?: string;
  genomicData?: GenomicData;
  familyHistory?: FamilyHistory[];
  medications?: Medication[];
  symptoms?: Symptom[];
}

export interface LabResult {
  testName: string;
  loincCode?: string;
  value: number | string;
  unit: string;
  referenceRange: {
    low: number;
    high: number;
  };
  abnormalFlag?: 'low' | 'high' | 'critical_low' | 'critical_high';
  testDate: Date;
}

export interface VitalSigns {
  heartRate?: number; // bpm
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  respiratoryRate?: number; // breaths per minute
  temperature?: number; // Celsius
  oxygenSaturation?: number; // percentage
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  timestamp: Date;
}

export interface GenomicData {
  variants: GeneticVariant[];
  sequencingType: 'WGS' | 'WES' | 'targeted_panel';
  analysisDate: Date;
}

export interface GeneticVariant {
  gene: string;
  variant: string;
  zygosity: 'homozygous' | 'heterozygous';
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign';
  alleleFrequency?: number;
}

export interface FamilyHistory {
  relationship: string;
  condition: string;
  ageAtDiagnosis?: number;
  icd10Code?: string;
}

export interface Medication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate?: Date;
  prescribedFor: string;
}

export interface Symptom {
  description: string;
  severity: number; // 1-10
  onset: Date;
  frequency?: 'constant' | 'intermittent' | 'occasional';
  associatedFactors?: string[];
}

export interface DiagnosticResult {
  diagnoses: Diagnosis[];
  riskScores: RiskScore[];
  treatmentRecommendations: TreatmentRecommendation[];
  prognosticEstimate?: PrognosticEstimate;
  confidence: number;
  explanation: DiagnosticExplanation;
  clinicalDecisionSupport: ClinicalDecisionSupport;
  timestamp: Date;
}

export interface Diagnosis {
  condition: string;
  icd10Code: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  evidence: Evidence[];
  differentialDiagnoses?: string[];
}

export interface Evidence {
  type: 'imaging' | 'lab' | 'clinical' | 'genomic' | 'symptom';
  description: string;
  confidence: number;
  sourceId?: string;
}

export interface RiskScore {
  condition: string;
  score: number; // 0-100
  timeframe: string; // e.g., "5 years", "10 years"
  category: 'low' | 'moderate' | 'high' | 'very_high';
  modifiableFactors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  impact: 'protective' | 'neutral' | 'risk';
  magnitude: number;
  modifiable: boolean;
}

export interface TreatmentRecommendation {
  type: 'medication' | 'procedure' | 'lifestyle' | 'monitoring';
  description: string;
  rationale: string;
  priority: 'essential' | 'recommended' | 'optional';
  alternatives?: string[];
  contraindications?: string[];
  expectedOutcome?: string;
}

export interface PrognosticEstimate {
  survivalProbability?: {
    oneYear: number;
    fiveYear: number;
    tenYear: number;
  };
  diseaseProgressionProbability?: number;
  recurrenceProbability?: number;
  qualityOfLifeImpact?: string;
}

export interface DiagnosticExplanation {
  summary: string;
  featureImportance: FeatureImportance[];
  modelUncertainty: number;
  caveats: string[];
  supportingLiterature?: LiteratureReference[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  contribution: 'positive' | 'negative';
}

export interface LiteratureReference {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
}

export interface ClinicalDecisionSupport {
  alerts: ClinicalAlert[];
  guidelines: GuidelineRecommendation[];
  drugInteractions?: DrugInteraction[];
  patientEducation?: string[];
}

export interface ClinicalAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionRequired: boolean;
  dismissible: boolean;
}

export interface GuidelineRecommendation {
  guideline: string;
  source: string;
  recommendation: string;
  evidenceLevel: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

// ============================================================================
// BIOSENSING & WEARABLES
// ============================================================================

export interface BiosensorDevice {
  id: string;
  deviceId: string;
  deviceType: BiosensorType;
  patientId: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  batteryLevel?: number;
  connectionStatus: DeviceConnectionStatus;
  lastSync: Date;
  calibrationDate?: Date;
  sensors: SensorConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export type BiosensorType =
  | 'wearable_watch'
  | 'wearable_patch'
  | 'wearable_clothing'
  | 'lab_on_chip'
  | 'implantable'
  | 'point_of_care';

export type DeviceConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface SensorConfig {
  sensorType: SensorType;
  measurementUnit: string;
  samplingRate: number; // Hz
  accuracy: string;
  range: {
    min: number;
    max: number;
  };
}

export type SensorType =
  | 'heart_rate'
  | 'blood_pressure'
  | 'oxygen_saturation'
  | 'glucose'
  | 'temperature'
  | 'ecg'
  | 'accelerometer'
  | 'gyroscope'
  | 'hydration'
  | 'lactate'
  | 'cortisol'
  | 'electrolytes';

export interface BiosensorReading {
  id: string;
  deviceId: string;
  patientId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  quality: DataQuality;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  context?: ReadingContext;
}

export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';

export interface ReadingContext {
  activity?: string;
  posture?: 'sitting' | 'standing' | 'lying' | 'walking' | 'running';
  environment?: {
    temperature?: number;
    humidity?: number;
  };
  notes?: string;
}

export interface BiosensorAlert {
  id: string;
  patientId: string;
  deviceId: string;
  alertType: BiosensorAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggerValue?: number;
  threshold?: number;
  recommendation: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export type BiosensorAlertType =
  | 'threshold_exceeded'
  | 'threshold_below'
  | 'sudden_change'
  | 'trend_anomaly'
  | 'device_malfunction'
  | 'low_battery'
  | 'lost_connection';

export interface LabOnChipTest {
  id: string;
  deviceId: string;
  patientId: string;
  testType: string;
  sampleType: 'blood' | 'saliva' | 'urine' | 'sweat' | 'breath';
  results: LabOnChipResult[];
  status: 'running' | 'completed' | 'failed';
  qualityControl: QualityControlMetrics;
  startTime: Date;
  endTime?: Date;
}

export interface LabOnChipResult {
  analyte: string;
  value: number;
  unit: string;
  referenceRange?: {
    low: number;
    high: number;
  };
  flag?: 'normal' | 'abnormal' | 'critical';
}

export interface QualityControlMetrics {
  sampleVolume: number;
  fluidicsCheck: boolean;
  reactionCompletion: number; // percentage
  signalToNoise: number;
  validationStatus: 'passed' | 'failed' | 'warning';
}

// ============================================================================
// HIPAA COMPLIANCE & SECURITY
// ============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
  phi_accessed: boolean;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'share'
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'permission_change'
  | 'consent_change'
  | 'data_breach_attempt';

export type ResourceType =
  | 'patient'
  | 'medical_image'
  | 'diagnostic_result'
  | 'lab_result'
  | 'sensor_data'
  | 'user'
  | 'baa'
  | 'encryption_key'
  | 'audit_log';

export interface BusinessAssociateAgreement {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  agreementType: 'full_baa' | 'data_use_agreement' | 'subcontractor_baa';
  scope: string[];
  signedDate: Date;
  effectiveDate: Date;
  expirationDate: Date;
  status: BAAStatus;
  documentUrl: string;
  breachNotificationEmail: string;
  encryptionRequired: boolean;
  auditRightsGranted: boolean;
  dataRetentionPeriod: number; // days
  renewalRequired: boolean;
  nextReviewDate?: Date;
}

export type BAAStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated' | 'under_review';

export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyId: string;
  iv: string;
  authTag?: string;
  encryptedAt: Date;
  encryptedBy: string;
}

export interface DataBreachIncident {
  id: string;
  incidentDate: Date;
  detectedDate: Date;
  reportedDate?: Date;
  incidentType: BreachType;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  affectedRecords: number;
  affectedPatients: string[];
  dataTypes: string[];
  description: string;
  rootCause?: string;
  mitigation: MitigationAction[];
  notificationsSent: BreachNotification[];
  status: IncidentStatus;
  investigationLeadId: string;
}

export type BreachType =
  | 'unauthorized_access'
  | 'data_loss'
  | 'ransomware'
  | 'phishing'
  | 'insider_threat'
  | 'misconfiguration'
  | 'third_party_breach';

export type IncidentStatus = 'detected' | 'investigating' | 'contained' | 'remediated' | 'closed';

export interface MitigationAction {
  action: string;
  completedDate?: Date;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface BreachNotification {
  recipientType: 'patient' | 'hhs' | 'media' | 'business_associate';
  recipientId?: string;
  notificationDate: Date;
  method: 'email' | 'mail' | 'phone' | 'website';
  delivered: boolean;
}

export interface ComplianceReport {
  id: string;
  reportType: ComplianceReportType;
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedDate: Date;
  generatedBy: string;
  findings: ComplianceFinding[];
  recommendations: string[];
  overallStatus: 'compliant' | 'non_compliant' | 'needs_improvement';
  nextAuditDate?: Date;
}

export type ComplianceReportType =
  | 'hipaa_security_rule'
  | 'hipaa_privacy_rule'
  | 'hipaa_breach_notification'
  | 'baa_review'
  | 'access_controls'
  | 'encryption_audit'
  | 'incident_response';

export interface ComplianceFinding {
  category: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence?: string;
  gaps?: string[];
  remediationRequired: boolean;
}

// ============================================================================
// BIOTENSOR LABS - ML RESEARCH
// ============================================================================

export interface MLExperiment {
  id: string;
  name: string;
  description: string;
  experimentType: ExperimentType;
  status: ExperimentStatus;
  createdBy: string;
  dataset: DatasetInfo;
  model: ModelConfig;
  hyperparameters: Record<string, any>;
  metrics: ExperimentMetrics;
  artifacts: ExperimentArtifact[];
  signalProcessing?: SignalProcessingPipeline;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ExperimentType =
  | 'classification'
  | 'regression'
  | 'segmentation'
  | 'time_series_forecasting'
  | 'anomaly_detection'
  | 'drug_discovery'
  | 'protein_folding';

export type ExperimentStatus = 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface DatasetInfo {
  id: string;
  name: string;
  size: number;
  numSamples: number;
  features: DatasetFeature[];
  splits: {
    train: number;
    validation: number;
    test: number;
  };
  s3Location: string;
}

export interface DatasetFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'time_series' | 'image' | 'text';
  importance?: number;
  statistics?: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    missing?: number;
  };
}

export interface ModelConfig {
  architecture: string;
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost';
  version: string;
  inputShape: number[];
  outputShape: number[];
  parameters: number;
  layers?: LayerConfig[];
}

export interface LayerConfig {
  type: string;
  units?: number;
  activation?: string;
  params: number;
}

export interface ExperimentMetrics {
  training: MetricValues;
  validation: MetricValues;
  test?: MetricValues;
  computeTime: number; // seconds
  gpuUtilization?: number;
  memoryUsage?: number;
}

export interface MetricValues {
  loss: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  mae?: number;
  mse?: number;
  r2?: number;
  customMetrics?: Record<string, number>;
}

export interface ExperimentArtifact {
  type: 'model_weights' | 'tensorboard_logs' | 'predictions' | 'confusion_matrix' | 'feature_importance';
  s3Location: string;
  format: string;
  size: number;
  createdAt: Date;
}

export interface SignalProcessingPipeline {
  steps: SignalProcessingStep[];
  inputSignalType: SignalType;
  samplingRate: number;
  duration?: number;
}

export type SignalType = 'ecg' | 'eeg' | 'emg' | 'audio' | 'vibration' | 'pressure';

export interface SignalProcessingStep {
  operation: SignalOperation;
  parameters: Record<string, any>;
  order: number;
}

export type SignalOperation =
  | 'filter_lowpass'
  | 'filter_highpass'
  | 'filter_bandpass'
  | 'fft'
  | 'wavelet_transform'
  | 'normalize'
  | 'detrend'
  | 'resample'
  | 'feature_extraction';

export interface FeatureVector {
  experimentId: string;
  sampleId: string;
  features: Record<string, number>;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  experimentId: string;
  version: string;
  status: DeploymentStatus;
  endpoint: string;
  infrastructure: InfrastructureConfig;
  performance: DeploymentPerformance;
  canaryConfig?: CanaryDeploymentConfig;
  deployedAt: Date;
  deployedBy: string;
}

export type DeploymentStatus = 'deploying' | 'active' | 'canary' | 'rolling_back' | 'terminated';

export interface InfrastructureConfig {
  platform: 'kserve' | 'sagemaker' | 'tensorflow_serving';
  instanceType: string;
  minReplicas: number;
  maxReplicas: number;
  autoscaling: boolean;
  gpu: boolean;
}

export interface DeploymentPerformance {
  requestsPerSecond: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  availability: number;
}

export interface CanaryDeploymentConfig {
  trafficPercentage: number;
  comparisonMetric: string;
  threshold: number;
  duration: number; // minutes
}

// ============================================================================
// MYNX NATALCARE - MATERNAL HEALTH
// ============================================================================

export interface PregnancyRecord {
  id: string;
  patientId: string;
  pregnancyNumber: number; // gravida
  lmp: Date; // Last menstrual period
  edd: Date; // Estimated due date
  gestationalAge: number; // weeks
  status: PregnancyStatus;
  riskLevel: RiskLevel;
  complications: PregnancyComplication[];
  prenatalVisits: PrenatalVisit[];
  ultrasounds: UltrasoundRecord[];
  labTests: MaternalLabTest[];
  monitoring: ContinuousMonitoring;
  alerts: MaternalAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export type PregnancyStatus = 'early' | 'mid' | 'late' | 'delivery' | 'postpartum' | 'closed';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface PregnancyComplication {
  condition: string;
  icd10Code: string;
  diagnosedDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  management: string;
  resolved: boolean;
  resolvedDate?: Date;
}

export interface PrenatalVisit {
  id: string;
  visitDate: Date;
  gestationalAge: number;
  provider: string;
  vitalSigns: MaternalVitalSigns;
  fetalHeartRate?: number;
  fundalHeight?: number;
  presentation?: string;
  complaints?: string[];
  assessment: string;
  plan: string;
  nextVisitDate?: Date;
}

export interface MaternalVitalSigns extends VitalSigns {
  fundalHeight?: number;
  fetalHeartRate?: number;
  contractions?: {
    frequency: number; // per 10 minutes
    duration: number; // seconds
    intensity: 'mild' | 'moderate' | 'strong';
  };
}

export interface UltrasoundRecord {
  id: string;
  pregnancyId: string;
  scanDate: Date;
  gestationalAge: number;
  scanType: UltrasoundType;
  findings: UltrasoundFindings;
  images: string[]; // Image IDs
  interpretation: string;
  performedBy: string;
}

export type UltrasoundType =
  | 'dating'
  | 'nuchal_translucency'
  | 'anatomy'
  | 'growth'
  | 'doppler'
  | 'biophysical_profile';

export interface UltrasoundFindings {
  fetalNumber: number;
  presentation?: string;
  placentaLocation?: string;
  amnioticFluid?: 'normal' | 'oligohydramnios' | 'polyhydramnios';
  estimatedFetalWeight?: number; // grams
  biparietalDiameter?: number; // mm
  headCircumference?: number; // mm
  abdominalCircumference?: number; // mm
  femurLength?: number; // mm
  abnormalities?: string[];
}

export interface MaternalLabTest {
  testName: string;
  testDate: Date;
  gestationalAge: number;
  results: LabResult[];
  interpretation: string;
  actionRequired: boolean;
}

export interface ContinuousMonitoring {
  enabled: boolean;
  devices: string[]; // Device IDs
  metrics: MonitoredMetric[];
  lastUpdate: Date;
}

export interface MonitoredMetric {
  metric: string;
  currentValue: number;
  unit: string;
  baseline?: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface MaternalAlert {
  id: string;
  pregnancyId: string;
  alertType: MaternalAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  trigger: AlertTrigger;
  recommendation: string;
  requiresImmediate Action: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export type MaternalAlertType =
  | 'gestational_diabetes_risk'
  | 'preeclampsia_risk'
  | 'preterm_labor_risk'
  | 'fetal_distress'
  | 'abnormal_weight_gain'
  | 'missed_appointment'
  | 'critical_lab_value'
  | 'device_disconnected';

export interface AlertTrigger {
  triggerType: 'threshold' | 'ml_prediction' | 'manual' | 'missed_event';
  value?: number;
  threshold?: number;
  predictionProbability?: number;
  details?: Record<string, any>;
}

export interface RiskAssessment {
  pregnancyId: string;
  assessmentDate: Date;
  gestationalAge: number;
  risks: IdentifiedRisk[];
  overallRiskScore: number;
  recommendations: string[];
  nextAssessmentDate: Date;
}

export interface IdentifiedRisk {
  condition: string;
  probability: number;
  timeframe: string;
  riskFactors: RiskFactor[];
  preventiveMeasures: string[];
  monitoringRequired: boolean;
}

export interface PostpartumCare {
  pregnancyId: string;
  deliveryDate: Date;
  deliveryType: 'vaginal' | 'cesarean';
  complications: string[];
  babyInfo: {
    weight: number;
    length: number;
    apgarScores: {
      oneMinute: number;
      fiveMinutes: number;
    };
  };
  postpartumVisits: PostpartumVisit[];
  recoveryStatus: RecoveryStatus;
}

export interface PostpartumVisit {
  visitDate: Date;
  weeksPostpartum: number;
  provider: string;
  concerns: string[];
  mentalHealthScreening?: MentalHealthScreening;
  contraceptionCounseling?: boolean;
  breastfeedingSupport?: boolean;
  assessment: string;
}

export interface MentalHealthScreening {
  screeningTool: 'EPDS' | 'PHQ-9' | 'GAD-7';
  score: number;
  interpretation: string;
  referralNeeded: boolean;
}

export interface RecoveryStatus {
  physicalRecovery: 'excellent' | 'good' | 'fair' | 'poor';
  painLevel: number; // 0-10
  complications: string[];
  concernsAddressed: boolean;
}

// ============================================================================
// DRUG DISCOVERY
// ============================================================================

export interface CompoundLibrary {
  id: string;
  name: string;
  description: string;
  compounds: Compound[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Compound {
  id: string;
  name?: string;
  smilesString: string;
  inchiKey?: string;
  molecularWeight: number;
  molecularFormula: string;
  properties: MolecularProperties;
  bioactivity?: BioactivityData;
  toxicity?: ToxicityPrediction;
  admet?: ADMETProperties;
  generatedBy?: 'ai' | 'manual' | 'database';
}

export interface MolecularProperties {
  logP?: number; // Lipophilicity
  hBondDonors?: number;
  hBondAcceptors?: number;
  rotableBonds?: number;
  polarSurfaceArea?: number;
  complexity?: number;
  numAromaticRings?: number;
  numHeteroAtoms?: number;
}

export interface BioactivityData {
  targetProtein: string;
  assayType: string;
  ic50?: number; // nM
  ki?: number; // nM
  ec50?: number; // nM
  activityType: 'agonist' | 'antagonist' | 'inhibitor' | 'modulator';
  confidence: number;
}

export interface ToxicityPrediction {
  hepatotoxicity: ToxicityScore;
  cardiotoxicity: ToxicityScore;
  nephrotoxicity: ToxicityScore;
  mutagenicity: ToxicityScore;
  carcinogenicity: ToxicityScore;
  overallSafety: 'safe' | 'moderate_concern' | 'high_concern';
}

export interface ToxicityScore {
  probability: number;
  confidence: number;
  evidence?: string[];
}

export interface ADMETProperties {
  absorption: {
    humanIntestinalAbsorption: number;
    caco2Permeability: number;
  };
  distribution: {
    volumeOfDistribution: number;
    proteinBinding: number;
    bloodBrainBarrier: boolean;
  };
  metabolism: {
    cyp450Substrate: string[];
    cyp450Inhibitor: string[];
    halfLife: number; // hours
  };
  excretion: {
    clearance: number; // mL/min/kg
    renalClearance: number;
  };
  toxicity: ToxicityPrediction;
}

export interface DrugOptimizationTask {
  id: string;
  targetProtein: string;
  desiredProperties: Record<string, number>;
  constraints: OptimizationConstraint[];
  algorithm: 'reinforcement_learning' | 'genetic_algorithm' | 'bayesian_optimization';
  iterations: number;
  status: 'running' | 'completed' | 'failed';
  results: OptimizationResult[];
  createdAt: Date;
  completedAt?: Date;
}

export interface OptimizationConstraint {
  property: string;
  operator: 'gt' | 'lt' | 'eq' | 'between';
  value: number | [number, number];
  priority: 'required' | 'preferred' | 'optional';
}

export interface OptimizationResult {
  compound: Compound;
  iteration: number;
  score: number;
  improvements: Record<string, number>;
  satisfiesConstraints: boolean;
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  credentials: Credentials;
  mfaEnabled: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type UserRole =
  | 'patient'
  | 'clinician'
  | 'radiologist'
  | 'pathologist'
  | 'researcher'
  | 'admin'
  | 'compliance_officer'
  | 'data_scientist';

export interface Permission {
  resource: ResourceType;
  actions: ('create' | 'read' | 'update' | 'delete' | 'share' | 'export')[];
  conditions?: Record<string, any>;
}

export interface Credentials {
  passwordHash: string;
  passwordSalt: string;
  passwordLastChanged: Date;
  mfaSecret?: string;
  apiKey?: string;
  apiKeyLastRotated?: Date;
}

export interface UserProfile {
  title?: string;
  specialty?: string;
  licenseNumber?: string;
  institution?: string;
  department?: string;
  phoneNumber?: string;
  address?: Address;
  bio?: string;
  photoUrl?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  displayUnits: 'metric' | 'imperial';
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  alertTypes: string[];
  quietHours?: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

// ============================================================================
// NOTIFICATIONS & COMMUNICATIONS
// ============================================================================

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | 'diagnostic_result'
  | 'imaging_complete'
  | 'alert'
  | 'appointment_reminder'
  | 'lab_result'
  | 'medication_reminder'
  | 'system_maintenance'
  | 'security_alert';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'phone_call';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface AnalyticsReport {
  id: string;
  reportType: AnalyticsReportType;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: ReportMetric[];
  visualizations: Visualization[];
  generatedAt: Date;
  generatedBy: string;
}

export type AnalyticsReportType =
  | 'platform_usage'
  | 'clinical_outcomes'
  | 'model_performance'
  | 'patient_engagement'
  | 'financial'
  | 'quality_metrics';

export interface ReportMetric {
  name: string;
  value: number;
  unit: string;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  benchmark?: number;
}

export interface Visualization {
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'heatmap' | 'scatter_plot';
  title: string;
  data: any[];
  config: Record<string, any>;
}

// ============================================================================
// TIMESCALE DB SPECIFIC
// ============================================================================

export interface TimescaleHypertable {
  tableName: string;
  timeColumn: string;
  partitionInterval: string;
  retentionPolicy?: RetentionPolicy;
  compressionPolicy?: CompressionPolicy;
  continuousAggregates?: ContinuousAggregate[];
}

export interface RetentionPolicy {
  dropAfter: string; // e.g., "90 days", "1 year"
  schedule: string;
}

export interface CompressionPolicy {
  compressAfter: string; // e.g., "7 days"
  segmentBy?: string[];
  orderBy?: string[];
}

export interface ContinuousAggregate {
  name: string;
  viewDefinition: string;
  refreshPolicy: {
    startOffset: string;
    endOffset: string;
    scheduleInterval: string;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface DataExport {
  id: string;
  requestedBy: string;
  exportType: ExportType;
  format: ExportFormat;
  filters: Record<string, any>;
  status: ExportStatus;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  requestedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export type ExportType =
  | 'patient_data'
  | 'diagnostic_reports'
  | 'imaging_studies'
  | 'audit_logs'
  | 'research_dataset'
  | 'compliance_report';

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'fhir' | 'dicom' | 'hl7';

export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
