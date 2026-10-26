export type InfrastructureType =
  | 'Bridge'
  | 'Tunnel'
  | 'Building'
  | 'Road'
  | 'Dam'
  | 'Concrete Structure'
  | 'Retaining Wall'
  | 'Industrial Structure'

export type DamageSeverity = 'None' | 'Minor' | 'Moderate' | 'Severe' | 'Critical'

export type DamageCategory =
  | 'Cracks'
  | 'Concrete spalling'
  | 'Surface corrosion'
  | 'Exposed reinforcement'
  | 'Potholes'
  | 'Surface deformation'
  | 'Delamination indicators'
  | 'Water leakage or staining'
  | 'Surface deterioration'
  | 'Material erosion'

export type CrackType =
  | 'Longitudinal'
  | 'Transverse'
  | 'Diagonal'
  | 'Vertical'
  | 'Horizontal'
  | 'Alligator/map cracking'
  | 'Hairline'
  | 'Random/irregular'

export type InspectionStatus =
  | 'Draft'
  | 'Scheduled'
  | 'In Progress'
  | 'Processing'
  | 'Pending Engineer Review'
  | 'Approved'
  | 'Completed'
  | 'Failed'

export type WorkOrderPriority =
  | 'Routine Monitoring'
  | 'Low Priority'
  | 'Medium Priority'
  | 'High Priority'
  | 'Urgent Engineering Review'

export type WorkOrderStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Review'
  | 'Completed'
  | 'Cancelled'

export type UserRole =
  | 'Civil Engineer'
  | 'Infrastructure Inspector'
  | 'Maintenance Engineer'
  | 'Infrastructure Manager'
  | 'Administrator'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  department: string
  status: 'Active' | 'Inactive'
  lastActive: string
}

export interface CrackMeasurement {
  crackLengthPx: number
  avgWidthPx: number
  maxWidthPx: number
  areaPx: number
  densityPercent: number
  orientationAngleDeg: number
  isCalibrated: boolean
  calibratedScaleMmPerPx?: number
  // physical estimates only if calibrated
  estimatedLengthMm?: number
  estimatedAvgWidthMm?: number
  estimatedMaxWidthMm?: number
  uncertaintyNotes?: string
}

export interface DamageFinding {
  id: string
  inspectionId: string
  category: DamageCategory
  crackType?: CrackType
  bbox: [number, number, number, number] // [x, y, width, height] percentage 0-100
  confidenceScore: number // 0 to 1.0
  severity: DamageSeverity
  measurements: CrackMeasurement
  reviewStatus: 'Pending Review' | 'Approved' | 'Flagged Incorrect' | 'Requires Reinspection'
  engineerNotes?: string
  detectedAt: string
}

export interface InspectionImage {
  id: string
  filename: string
  url: string
  annotatedUrl?: string
  maskUrl?: string
  heatmapUrl?: string
  uploadedAt: string
  resolution: string
  fileSizeBytes: number
  qualityScore: number // 0 - 100
  blurScore: 'Pass' | 'Warning' | 'Low-Light Warning'
  findings: DamageFinding[]
}

export interface InfrastructureAsset {
  id: string
  name: string
  type: InfrastructureType
  address: string
  latitude: number
  longitude: number
  constructionYear: number
  materialType: 'Reinforced Concrete' | 'Prestressed Concrete' | 'Structural Steel' | 'Composite' | 'Masonry' | 'Asphalt'
  responsibleDepartment: string
  inspectionFrequencyMonths: number
  importance: 'Standard' | 'High' | 'Critical National Infrastructure'
  conditionStatus: 'Good' | 'Fair' | 'Poor' | 'Critical'
  lastInspectionDate: string
  nextScheduledInspection: string
  openFindingsCount: number
  maintenanceHistoryCount: number
  notes: string
  imageUrl?: string
}

export interface Inspection {
  id: string
  assetId: string
  assetName: string
  assetType: InfrastructureType
  title: string
  inspectionType: 'Routine' | 'Emergency' | 'Post-Incident' | 'Baseline' | 'Regulatory'
  inspectorId: string
  inspectorName: string
  inspectorRole: string
  date: string
  status: InspectionStatus
  overallSeverity: DamageSeverity
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  gpsCoordinates?: { lat: number; lng: number }
  images: InspectionImage[]
  findingsCount: number
  engineerReviewStatus: 'Pending' | 'Approved' | 'Requires Reinspection'
  engineerComments?: string
  reviewedBy?: string
  reviewedAt?: string
  preprocessingStage?:
    | 'Image received'
    | 'Format and resolution validation'
    | 'Quality assessment'
    | 'Enhancement and normalization'
    | 'Region-of-interest extraction'
    | 'Ready for AI analysis'
    | 'Completed'
  reportGenerated: boolean
}

export interface MaintenanceWorkOrder {
  id: string
  title: string
  assetId: string
  assetName: string
  inspectionId: string
  findingId?: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  assignedTeam: string
  assignedEngineer: string
  createdAt: string
  dueDate: string
  completedAt?: string
  repairRecommendations: string
  completionNotes?: string
  followUpInspectionRequired: boolean
}

export interface InspectionReport {
  id: string
  inspectionId: string
  assetId: string
  assetName: string
  assetType: InfrastructureType
  generatedAt: string
  generatedBy: string
  severity: DamageSeverity
  findingsSummary: {
    total: number
    critical: number
    severe: number
    moderate: number
    minor: number
  }
  recommendations: string
  modelVersion: string
  fileFormatsAvailable: ('PDF' | 'CSV' | 'JSON')[]
  downloadUrl?: string
}

export interface NotificationItem {
  id: string
  category:
    | 'Inspection assigned'
    | 'Inspection completed'
    | 'Damage detected'
    | 'Severe damage identified'
    | 'Engineering review required'
    | 'Maintenance task assigned'
    | 'Maintenance deadline approaching'
    | 'Inspection report generated'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  severity: 'Info' | 'Warning' | 'Critical'
  linkTo?: string
}

export interface ModelVersion {
  id: string
  name: string
  version: string
  modelType: 'YOLOv11-CrackSeg' | 'DeepCrack-UNet' | 'SAM-Civil' | 'ResNet-Classifier'
  datasetReference: string
  datasetVersion: string
  trainingStatus: 'Trained' | 'Validating' | 'Deployed (Production)' | 'Archived'
  evaluationDate: string
  metrics: {
    precision: number
    recall: number
    f1Score: number
    mAP50: number
    iouSegmentation: number
    diceCoefficient: number
    accuracy: number
  }
  deploymentStatus: 'Active' | 'Canary' | 'Inactive'
}
