// Core Production Types
export interface Reactor {
  id: string;
  name: string;
  status: 'idle' | 'mixing' | 'heating' | 'cooling' | 'completed' | 'error' | 'maintenance';
  capacity: number; // in liters
  currentBatch?: Batch;
  temperature: number;
  pressure: number;
  mixingSpeed: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface ProductionStation {
  id: string;
  name: string;
  type: 'labeling' | 'filling' | 'packaging' | 'powder' | 'soap';
  status: 'idle' | 'running' | 'maintenance' | 'error';
  currentProduct?: Product;
  efficiency: number; // percentage
  unitsPerHour: number;
  lastActivity: Date;
  queue: QueueItem[];
}

export interface Batch {
  id: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'rejected';
  startTime: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  recipe: Recipe;
  qualityMetrics: QualityMetric[];
}

export interface Recipe {
  id: string;
  productId: string;
  name: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  duration: number; // in minutes
  temperature: number;
  mixingSpeed: number;
  qualityStandards: QualityStandard[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'ml' | 'l' | 'g' | 'kg';
  supplier: string;
  batchNumber?: string;
  expirationDate?: Date;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  description: string;
  duration: number;
  temperature?: number;
  mixingSpeed?: number;
  checkpoints: string[];
}

// Ninu.mx Product Types (Categorías oficiales)
export interface Product {
  id: string;
  name: string;
  category: 'desinfeccion' | 'limpieza' | 'salud-bienestar' | 'autos' | 'albercas' | 'alimentos' | 'quimicos' | 'mascotas';
  description: string;
  size: number;
  unit: 'ml' | 'l' | 'g' | 'kg' | 'pzas';
  packaging: 'bottle' | 'container' | 'bag' | 'kit' | 'can';
  cofepisApproval: boolean;
  cofepisRegistration?: string; // Número de registro COFEPRIS cuando aplique
  ingredients: string[];
  useCase: string[];
  shelfLife: number; // in months
  currentStock: number;
  minStock: number;
  productionCost: number;
  salePrice: number;
  alcoholContent?: number; // Porcentaje de alcohol para productos desinfectantes
  quaternaryAmmoniumContent?: number; // Concentración de sales cuaternarias
  sodiumHypochloriteContent?: number; // Concentración de hipoclorito de sodio
  
  // Urgency and Scarcity Indicators for Mexican E-commerce
  urgencyIndicators?: UrgencyIndicators;
}

// Urgency and Scarcity Indicators for Mexican E-commerce Psychology
export interface UrgencyIndicators {
  // Stock scarcity indicators
  lowStockThreshold?: number; // Units remaining to trigger "Solo quedan X unidades"
  showLowStockWarning?: boolean; // Whether to show stock warning
  
  // Popularity indicators
  dailyPurchases?: number; // Number of people who bought today
  weeklyPurchases?: number; // Number of people who bought this week
  showPopularityBadge?: boolean; // Whether to show "X personas compraron esto"
  
  // Promotional indicators
  isOnSale?: boolean; // Special offer
  salePercentage?: number; // Discount percentage
  saleEndDate?: string; // When sale ends
  
  // New product indicators
  isNewProduct?: boolean; // Recently added
  launchDate?: string; // When product was launched
  showNewBadge?: boolean; // Whether to show "Nuevo producto"
  
  // Time-based urgency
  limitedTimeOffer?: boolean; // Time-limited offer
  offerEndDate?: string; // When offer expires
  
  // Demand indicators
  trendingProduct?: boolean; // Trending/hot product
  demandLevel?: 'low' | 'medium' | 'high' | 'very_high'; // Demand intensity
  
  // Mercado Libre style indicators
  bestSeller?: boolean; // Best seller badge
  recommendedProduct?: boolean; // Recommended by Ninu
  exclusiveOffer?: boolean; // Exclusive offer
}

export type ProductCategory = 
  | 'desinfeccion'
  | 'limpieza' 
  | 'salud-bienestar'
  | 'autos'
  | 'albercas'
  | 'alimentos'
  | 'quimicos'
  | 'mascotas';

// Quality Control Types
export interface QualityMetric {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  acceptableRange: [number, number];
  status: 'pass' | 'fail' | 'warning';
  timestamp: Date;
  operator: string;
}

export interface QualityStandard {
  parameter: string;
  minValue: number;
  maxValue: number;
  unit: string;
  critical: boolean;
}

// Production Planning Types
export interface QueueItem {
  id: string;
  batchId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  scheduledStart: Date;
}

export interface ProductionOrder {
  id: string;
  productId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedDate: Date;
  status: 'pending' | 'scheduled' | 'in_production' | 'completed' | 'cancelled';
  customer?: string;
  specialInstructions?: string;
  createdAt?: string;
}

// Monitoring and Analytics Types
export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  source: string; // reactor ID or station ID
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProductionMetrics {
  totalProduction: number;
  efficiency: number;
  qualityRate: number;
  downtime: number;
  activeOrders: number;
  completedOrders: number;
  alertsCount: number;
  timestamp: Date;
  trends?: ProductionTrends;
  resourceUtilization?: ResourceUtilization;
}

export interface ProductionTrends {
  efficiency: TrendData[];
  production: TrendData[];
  quality: TrendData[];
  downtime: TrendData[];
}

export interface TrendData {
  timestamp: Date;
  value: number;
}

export interface ResourceUtilization {
  reactors: {
    [reactorId: string]: {
      utilization: number;
      status: string;
      efficiency: number;
    };
  };
  stations: {
    [stationId: string]: {
      utilization: number;
      status: string;
      efficiency: number;
    };
  };
  overall: {
    capacity: number;
    utilization: number;
    efficiency: number;
  };
}

// Customer Management Types for Ninu.mx
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: CustomerAddress;
  type: 'individual' | 'business' | 'distributor' | 'retailer';
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  pricing_tier: 'standard' | 'wholesale' | 'vip' | 'custom';
  credit_limit: number;
  payment_terms: number; // días de crédito
  preferred_products: string[]; // IDs de productos favoritos
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  registration_date: string;
  sales_rep?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_shipping_address: boolean;
  is_billing_address: boolean;
}

export interface CustomerOrder {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order_date: string;
  requested_delivery_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  items: CustomerOrderItem[];
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  shipping_address: CustomerAddress;
  billing_address: CustomerAddress;
  special_instructions?: string;
  internal_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  line_total: number;
  production_batch_id?: string;
  quality_approved: boolean;
  notes?: string;
}

// Real-time Update Types
export interface RealtimeUpdate {
  type: 'reactor_status' | 'station_status' | 'batch_update' | 'alert' | 'metrics' | 'customer_update' | 'order_update';
  payload: any;
  timestamp: Date;
}

// Dashboard Configuration
export interface DashboardConfig {
  layout: 'grid' | 'list';
  refreshInterval: number;
  showAlerts: boolean;
  alertThreshold: 'all' | 'medium' | 'high' | 'critical';
  defaultView: 'overview' | 'reactors' | 'stations' | 'production';
  autoRefresh: boolean;
  showTrends: boolean;
  showResourceUtilization: boolean;
}

// Metrics Overview Component Props
export interface MetricsOverviewProps {
  metrics: ProductionMetrics;
  config?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    showTrends?: boolean;
    showResourceUtilization?: boolean;
    onMetricClick?: (metricType: string) => void;
  };
  onRefresh?: () => void;
  loading?: boolean;
}

// User and Permissions
export interface User {
  id: string;
  name: string;
  role: 'operator' | 'supervisor' | 'manager' | 'admin';
  permissions: Permission[];
  shift: string;
  department: string;
}

export interface Permission {
  action: 'view' | 'control' | 'modify' | 'admin';
  resource: 'reactors' | 'stations' | 'production' | 'quality' | 'inventory' | 'reports';
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'raw_material' | 'packaging' | 'finished_product';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  supplier: string;
  lastRestocked: Date;
  expirationDate?: Date;
}

export interface InventoryMovement {
  id: string;
  item_type: 'raw_material' | 'packaging' | 'finished_product';
  item_id: string;
  batch_id?: string;
  movement_type: 'receipt' | 'consumption' | 'transfer' | 'adjustment' | 'waste' | 'production';
  quantity: number;
  unit_cost?: number;
  reason: string;
  reference_document?: string;
  from_location?: string;
  to_location?: string;
  created_by: string;
  created_at: string;
}

export interface StockAlert {
  id: string;
  item_type: 'raw_material' | 'packaging' | 'finished_product';
  item_id: string;
  alert_type: 'low_stock' | 'high_stock' | 'expiring' | 'expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  current_value: number;
  threshold_value: number;
  message: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

// Video Testimonial Types
export interface VideoTestimonial {
  id: string;
  customer_name: string;
  customer_type: 'family_home' | 'small_business' | 'distributor' | 'institutional' | 'professional' | 'government';
  location: {
    city: string;
    state: string;
    region: 'norte' | 'centro' | 'bajio' | 'occidente' | 'golfo' | 'pacifico' | 'sureste' | 'peninsula';
    internet_speed_profile: {
      average_download_mbps: number;
      reliability_score: number;
      mobile_data_usage: boolean;
      peak_hours_slowdown: boolean;
    };
  };
  video_url?: string;
  video_thumbnail?: string;
  video_duration_seconds?: number;
  text_testimonial: string;
  summary: string;
  products_used: ProductCategory[];
  use_cases: string[];
  family_context: {
    family_size: number;
    has_children: boolean;
    children_ages?: number[];
    has_elderly: boolean;
    has_pets: boolean;
    home_type: 'house' | 'apartment' | 'business';
    primary_concerns: string[];
  };
  preload_strategy: 'none' | 'metadata' | 'thumbnail' | 'auto';
  fallback_formats: ('mp4' | 'webm' | 'hls' | 'dash')[];
  has_captions: boolean;
  transcript?: string;
  audio_description?: string;
  bandwidth_requirement: 'low' | 'medium' | 'high' | 'adaptive';
  verified: boolean;
  views: number;
  likes: number;
  shares: number;
  helpful_votes: number;
  verification_date?: string;
  permission_granted: boolean;
  recorded_date: string;
  published_date: string;
  created_at: string;
  updated_at: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  supplier: string;
  supplier_id: string;
  supplier_name: string;
  unit_of_measure: string;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  quality_grade: string;
  expiration_tracking: boolean;
  last_purchase_date?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person: string;
  contact_info: string;
  address: string;
  phone: string;
  email: string;
  quality_rating: number;
  delivery_time_days: number;
  payment_terms: number;
  certification_level: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  storage_conditions: string;
  safety_protocols: string[];
  created_at: string;
  updated_at: string;
}

export type DisplayMode = 
  | 'video_primary'   // Video como principal, texto como respaldo
  | 'text_primary'    // Texto como principal, video como extra
  | 'side_by_side'    // Video y texto lado a lado
  | 'overlay'         // Texto sobre video
  | 'carousel';       // Carrusel de testimonios

export type MobileLayout = 
  | 'stack'           // Apilado verticalmente
  | 'carousel'        // Carrusel horizontal
  | 'grid'            // Grilla responsive
  | 'list';           // Lista simple

// Additional critical type exports for build compatibility
export type ReactorStatus = Reactor['status'];
export type StationStatus = ProductionStation['status'];

// Fixed ServiceWorkerConflict interface with comprehensive conflict types
export interface ServiceWorkerConflict {
  type: 'duplicate-scope' | 'version-mismatch' | 'cache-conflict' | 'script-error' | 
        'scope-overlap' | 'update-pending' | 'cache-mismatch' | 'network-fallback';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRegistrations: string[];
  resolution: string;
  autoResolvable: boolean;
  affectedScopes?: string[];
  registrations?: ServiceWorkerRegistration[];
  metadata?: any;
}

// ===== ADVANCED INVENTORY MANAGEMENT SYSTEM =====
// Extension of existing types for advanced inventory management
// Maintains 100% backward compatibility with all existing interfaces

/**
 * Extended InventoryItem interface for advanced inventory management
 * Maintains full backward compatibility with existing InventoryItem
 */
export interface AdvancedInventoryItem extends InventoryItem {
  /** Unique barcode for scanning and tracking */
  barcode?: string;
  /** SKU (Stock Keeping Unit) for advanced cataloging */
  sku?: string;
  /** Storage location within the facility */
  storageLocation: string;
  /** Temperature and environmental requirements */
  storageRequirements: StorageRequirement;
  /** Chemical properties and safety classification */
  chemicalProperties?: ChemicalProperties;
  /** Batch tracking and traceability data */
  traceability: MaterialTraceability;
  /** Quality control metrics and history */
  qualityHistory: QualityControlRecord[];
  /** Predictive analytics data */
  predictions?: InventoryPrediction;
  /** Smart alert configuration */
  smartAlerts: SmartInventoryAlert[];
  /** Business impact assessment */
  businessImpact: BusinessImpact;
  /** Alternative materials for substitution */
  alternatives?: string[]; // Array of alternative item IDs
  /** Seasonal usage patterns */
  seasonalPatterns?: SeasonalPattern[];
  /** Last audit information */
  lastAudit?: AuditRecord;
  /** Compliance certifications */
  certifications?: string[];
  /** Lead time for reordering */
  leadTimeDays: number;
  /** Criticality level for production */
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Raw Material with Complete Traceability
 * Extends existing RawMaterial interface with advanced tracking
 */
export interface AdvancedRawMaterial extends RawMaterial {
  /** Complete batch traceability information */
  traceability: MaterialTraceability;
  /** Chemical composition and properties */
  chemicalProperties: ChemicalProperties;
  /** Storage requirements and conditions */
  storageRequirements: StorageRequirement;
  /** Safety classification and protocols */
  safetyClassification: SafetyClassification;
  /** Quality certificates and documentation */
  qualityCertificates: QualityCertificate[];
  /** Environmental impact assessment */
  environmentalImpact?: EnvironmentalImpact;
  /** Compatibility matrix with other materials */
  compatibilityMatrix: MaterialCompatibility[];
  /** Transportation requirements */
  transportationRequirements?: TransportationRequirement;
}

/**
 * Material Traceability System
 * Complete tracking from supplier to final product
 */
export interface MaterialTraceability {
  /** Unique batch identifier */
  batchId: string;
  /** Lot number from supplier */
  lotNumber: string;
  /** Manufacturing date at supplier */
  manufacturingDate: Date;
  /** Receipt date at facility */
  receiptDate: Date;
  /** Supplier information */
  supplier: SupplierData;
  /** Certificate of analysis */
  certificateOfAnalysis?: CertificateOfAnalysis;
  /** Chain of custody records */
  chainOfCustody: CustodyRecord[];
  /** Quality test results */
  qualityTestResults: QualityTestResult[];
  /** Usage history in production */
  usageHistory: MaterialUsageRecord[];
  /** Current location and status */
  currentLocation: LocationRecord;
  /** Parent batch if derived from another material */
  parentBatchId?: string;
  /** Child batches if material was subdivided */
  childBatchIds?: string[];
}

/**
 * Enhanced Supplier Data
 * Comprehensive supplier information and performance metrics
 */
export interface SupplierData {
  /** Supplier unique identifier */
  id: string;
  /** Supplier name and company information */
  name: string;
  /** Contact information */
  contactInfo: ContactInformation;
  /** Quality performance metrics */
  qualityMetrics: SupplierQualityMetrics;
  /** Delivery performance */
  deliveryMetrics: DeliveryMetrics;
  /** Certifications and compliance */
  certifications: SupplierCertification[];
  /** Risk assessment score */
  riskScore: number;
  /** Financial stability rating */
  financialRating: 'A' | 'B' | 'C' | 'D';
  /** Preferred supplier status */
  preferredSupplier: boolean;
  /** Backup suppliers for this material */
  backupSuppliers?: string[];
}

/**
 * Smart Inventory Alert System
 * Extends existing StockAlert with intelligence and actions
 */
export interface SmartInventoryAlert extends StockAlert {
  /** Predictive indicators */
  predictions: AlertPrediction;
  /** Recommended actions */
  recommendedActions: AlertAction[];
  /** Business impact assessment */
  businessImpact: BusinessImpact;
  /** Auto-resolution capability */
  autoResolutionAvailable: boolean;
  /** Historical pattern analysis */
  patternAnalysis: PatternAnalysis;
  /** Escalation rules */
  escalationRules: EscalationRule[];
  /** Integration with procurement systems */
  procurementIntegration?: ProcurementAction;
  /** Related alerts and dependencies */
  relatedAlerts?: string[];
}

/**
 * Alert Action Recommendations
 * Automated and manual actions for inventory alerts
 */
export interface AlertAction {
  /** Unique action identifier */
  id: string;
  /** Action type and category */
  type: 'reorder' | 'transfer' | 'substitute' | 'expedite' | 'quality_check' | 'adjust_forecast';
  /** Action priority level */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Detailed description of the action */
  description: string;
  /** Estimated cost of the action */
  estimatedCost?: number;
  /** Time required to complete action */
  estimatedTimeHours: number;
  /** Required approvals */
  requiredApprovals: string[];
  /** Automation capability */
  canAutoExecute: boolean;
  /** Dependencies on other actions */
  dependencies?: string[];
  /** Expected outcome */
  expectedOutcome: string;
  /** Risk if action is not taken */
  riskIfNotTaken: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Business Impact Assessment
 * Comprehensive impact analysis for inventory decisions
 */
export interface BusinessImpact {
  /** Production impact assessment */
  productionImpact: ProductionImpactAssessment;
  /** Financial impact in MXN */
  financialImpact: FinancialImpactAssessment;
  /** Customer satisfaction impact */
  customerImpact: CustomerImpactAssessment;
  /** Quality impact assessment */
  qualityImpact: QualityImpactAssessment;
  /** Regulatory compliance impact */
  complianceImpact: ComplianceImpactAssessment;
  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Mitigation strategies */
  mitigationStrategies: MitigationStrategy[];
  /** Recovery time objective */
  recoveryTimeObjective: number; // in hours
}

/**
 * Inventory Prediction and Forecasting
 * Advanced analytics for inventory planning
 */
export interface InventoryPrediction {
  /** Demand forecast analysis */
  demandForecast: DemandForecast;
  /** Stock-out probability */
  stockOutProbability: number; // 0-1
  /** Optimal reorder point */
  optimalReorderPoint: number;
  /** Optimal order quantity */
  optimalOrderQuantity: number;
  /** Seasonal adjustments */
  seasonalAdjustments: SeasonalAdjustment[];
  /** Trend analysis */
  trendAnalysis: TrendAnalysis;
  /** Confidence interval */
  confidenceInterval: {
    lower: number;
    upper: number;
    confidence: number; // percentage
  };
  /** Model accuracy metrics */
  modelAccuracy: ModelAccuracy;
  /** Next review date */
  nextReviewDate: Date;
}

/**
 * Demand Forecasting System
 * Machine learning-based demand prediction
 */
export interface DemandForecast {
  /** Forecast period */
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  };
  /** Forecasted demand values */
  forecastedDemand: ForecastDataPoint[];
  /** Historical demand comparison */
  historicalComparison: HistoricalComparison;
  /** Forecast methodology used */
  methodology: 'moving_average' | 'exponential_smoothing' | 'arima' | 'machine_learning' | 'seasonal_decomposition';
  /** Model parameters */
  modelParameters: ModelParameters;
  /** External factors considered */
  externalFactors: ExternalFactor[];
  /** Accuracy metrics */
  accuracyMetrics: ForecastAccuracy;
}

/**
 * Seasonal Pattern Analysis
 * Identification and analysis of seasonal usage patterns
 */
export interface SeasonalPattern {
  /** Pattern identifier */
  patternId: string;
  /** Pattern type */
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'event_driven';
  /** Pattern strength (0-1) */
  strength: number;
  /** Peak periods */
  peakPeriods: PeakPeriod[];
  /** Low periods */
  lowPeriods: LowPeriod[];
  /** Pattern coefficients */
  coefficients: SeasonalCoefficient[];
  /** Historical validation */
  historicalValidation: PatternValidation;
  /** Next pattern occurrence */
  nextOccurrence: PatternOccurrence;
}

/**
 * Chemical Properties and Safety
 * Chemical composition and safety characteristics
 */
export interface ChemicalProperties {
  /** Chemical composition */
  composition: ChemicalComposition[];
  /** Physical properties */
  physicalProperties: PhysicalProperties;
  /** Chemical stability */
  stability: StabilityProperties;
  /** Reactivity information */
  reactivity: ReactivityProperties;
  /** Hazard classification */
  hazardClassification: HazardClassification;
  /** Safety data sheet reference */
  safetyDataSheet: SafetyDataSheet;
  /** Environmental properties */
  environmentalProperties: EnvironmentalProperties;
}

/**
 * Storage Requirements
 * Environmental and safety requirements for material storage
 */
export interface StorageRequirement {
  /** Temperature requirements */
  temperature: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
    critical: boolean;
  };
  /** Humidity requirements */
  humidity: {
    min: number;
    max: number;
    unit: 'percentage';
    critical: boolean;
  };
  /** Light exposure requirements */
  lightExposure: 'dark' | 'ambient' | 'protected' | 'no_restriction';
  /** Ventilation requirements */
  ventilation: 'none' | 'standard' | 'enhanced' | 'fume_hood';
  /** Container requirements */
  containerRequirements: ContainerRequirement[];
  /** Segregation requirements */
  segregationRequirements: SegregationRequirement[];
  /** Security level required */
  securityLevel: 'standard' | 'controlled' | 'restricted' | 'high_security';
  /** Special handling instructions */
  specialHandling?: string[];
}

/**
 * Safety Classification System
 * Comprehensive safety classification for materials
 */
export interface SafetyClassification {
  /** GHS classification */
  ghsClassification: GHSClassification;
  /** NFPA rating */
  nfpaRating: NFPARating;
  /** Mexican NOM classification */
  nomClassification?: NOMClassification;
  /** Personal protective equipment required */
  ppeRequired: PPERequirement[];
  /** Emergency procedures */
  emergencyProcedures: EmergencyProcedure[];
  /** First aid measures */
  firstAidMeasures: FirstAidMeasure[];
  /** Disposal requirements */
  disposalRequirements: DisposalRequirement;
}

// Supporting interfaces for the advanced inventory system

export interface ContactInformation {
  primaryContact: string;
  phone: string;
  email: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface SupplierQualityMetrics {
  defectRate: number; // percentage
  onTimeDelivery: number; // percentage
  qualityScore: number; // 0-100
  certificationCompliance: number; // percentage
  correctiveActions: number; // count
  qualityTrend: 'improving' | 'stable' | 'declining';
}

export interface DeliveryMetrics {
  averageLeadTime: number; // days
  onTimeDeliveryRate: number; // percentage
  earlyDeliveryRate: number; // percentage
  lateDeliveryRate: number; // percentage
  deliveryAccuracy: number; // percentage
  transportationCost: number; // cost per unit
}

export interface SupplierCertification {
  type: string;
  issuingBody: string;
  certificationNumber: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'valid' | 'expired' | 'suspended';
  scope: string;
}

export interface AlertPrediction {
  timeToStockOut: number; // hours
  probabilityOfStockOut: number; // 0-1
  demandSpike: boolean;
  seasonalFactor: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

export interface PatternAnalysis {
  patternType: 'recurring' | 'seasonal' | 'trend' | 'random';
  frequency: number; // occurrences per period
  lastOccurrence: Date;
  nextPredictedOccurrence: Date;
  reliability: number; // 0-1
}

export interface EscalationRule {
  level: number;
  timeThreshold: number; // minutes
  notificationMethod: 'email' | 'sms' | 'phone' | 'app';
  recipients: string[];
  conditions: string[];
}

export interface ProcurementAction {
  vendorId: string;
  preferredQuantity: number;
  estimatedCost: number;
  leadTime: number;
  autoOrderThreshold?: number;
  requiredApprovals: string[];
}

export interface ProductionImpactAssessment {
  affectedProductLines: string[];
  estimatedDowntime: number; // hours
  alternativeOptions: string[];
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationPossible: boolean;
}

export interface FinancialImpactAssessment {
  directCost: number; // MXN
  opportunityCost: number; // MXN
  expeditingCost?: number; // MXN
  totalImpact: number; // MXN
  impactCategory: 'minimal' | 'moderate' | 'significant' | 'severe';
}

export interface CustomerImpactAssessment {
  affectedOrders: number;
  affectedCustomers: number;
  reputationRisk: 'low' | 'medium' | 'high';
  customerNotificationRequired: boolean;
  alternativeProducts: string[];
}

export interface QualityImpactAssessment {
  productQualityRisk: 'none' | 'low' | 'medium' | 'high';
  batchReleaseDelay: number; // hours
  additionalTestingRequired: boolean;
  qualityCompromise: boolean;
  regulatoryImplications: boolean;
}

export interface ComplianceImpactAssessment {
  regulatoryBodies: string[];
  complianceRisk: 'low' | 'medium' | 'high' | 'critical';
  reportingRequired: boolean;
  auditImplications: boolean;
  penaltyRisk: number; // MXN
}

export interface MitigationStrategy {
  strategy: string;
  estimatedCost: number;
  timeToImplement: number; // hours
  effectiveness: number; // 0-1
  riskReduction: number; // percentage
  feasibility: 'high' | 'medium' | 'low';
}

export interface ForecastDataPoint {
  date: Date;
  predictedValue: number;
  confidenceLower: number;
  confidenceUpper: number;
  actualValue?: number; // for historical validation
}

export interface HistoricalComparison {
  periodComparison: 'year_over_year' | 'month_over_month' | 'week_over_week';
  variancePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
}

export interface ModelParameters {
  algorithm: string;
  parameters: Record<string, number>;
  trainingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  validationMetrics: Record<string, number>;
}

export interface ExternalFactor {
  factorType: 'economic' | 'seasonal' | 'promotional' | 'competitive' | 'regulatory';
  description: string;
  impact: number; // -1 to 1
  confidence: number; // 0-1
  source: string;
}

export interface ForecastAccuracy {
  mape: number; // Mean Absolute Percentage Error
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  bias: number;
  accuracyTrend: 'improving' | 'stable' | 'declining';
}

export interface SeasonalAdjustment {
  period: string;
  adjustmentFactor: number;
  confidence: number;
  historicalBasis: number; // years of data
}

export interface TrendAnalysis {
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number; // 0-1
  changeRate: number; // units per period
  trendConfidence: number; // 0-1
  inflectionPoints: Date[];
}

export interface ModelAccuracy {
  overallAccuracy: number; // percentage
  shortTermAccuracy: number; // 1-7 days
  mediumTermAccuracy: number; // 1-4 weeks
  longTermAccuracy: number; // 1-3 months
  modelVersion: string;
  lastUpdated: Date;
}

export interface PeakPeriod {
  startDate: Date;
  endDate: Date;
  peakFactor: number; // multiplier above average
  confidence: number; // 0-1
}

export interface LowPeriod {
  startDate: Date;
  endDate: Date;
  lowFactor: number; // multiplier below average
  confidence: number; // 0-1
}

export interface SeasonalCoefficient {
  period: string;
  coefficient: number;
  standardError: number;
  significance: number;
}

export interface PatternValidation {
  validationPeriod: {
    startDate: Date;
    endDate: Date;
  };
  accuracy: number; // 0-1
  falsePositives: number;
  falseNegatives: number;
  confidence: number; // 0-1
}

export interface PatternOccurrence {
  predictedDate: Date;
  confidence: number; // 0-1
  intensity: number; // expected magnitude
  duration: number; // expected duration in days
}

// Quality Control and Certification Interfaces

export interface QualityControlRecord {
  id: string;
  testDate: Date;
  testType: string;
  testResults: QualityTestResult[];
  inspector: string;
  status: 'pass' | 'fail' | 'conditional';
  notes?: string;
  certificateNumber?: string;
}

export interface QualityTestResult {
  parameter: string;
  measuredValue: number;
  unit: string;
  specification: {
    min?: number;
    max?: number;
    target?: number;
  };
  status: 'pass' | 'fail' | 'warning';
  method: string;
  instrument: string;
}

export interface QualityCertificate {
  certificateId: string;
  type: 'CoA' | 'ISO' | 'FDA' | 'COFEPRIS' | 'custom';
  issuingAuthority: string;
  issueDate: Date;
  expirationDate?: Date;
  scope: string;
  status: 'valid' | 'expired' | 'suspended';
  documentUrl?: string;
}

export interface CertificateOfAnalysis {
  certificateNumber: string;
  issueDate: Date;
  validUntil?: Date;
  testingLaboratory: string;
  testResults: QualityTestResult[];
  specifications: QualityStandard[];
  conclusion: 'approved' | 'rejected' | 'conditional';
  digitalSignature?: string;
}

export interface CustodyRecord {
  timestamp: Date;
  fromCustodian: string;
  toCustodian: string;
  location: string;
  purpose: string;
  conditions: string[];
  signature: string;
}

export interface MaterialUsageRecord {
  usageDate: Date;
  batchId: string;
  quantityUsed: number;
  purpose: string;
  operatorId: string;
  qualityCheckRequired: boolean;
  qualityStatus?: 'pass' | 'fail' | 'pending';
}

export interface LocationRecord {
  zone: string;
  aisle: string;
  shelf: string;
  position: string;
  lastMoved: Date;
  movedBy: string;
  environmentalConditions: {
    temperature: number;
    humidity: number;
    lastChecked: Date;
  };
}

export interface AuditRecord {
  auditId: string;
  auditDate: Date;
  auditor: string;
  auditType: 'routine' | 'spot_check' | 'compliance' | 'investigation';
  findings: AuditFinding[];
  recommendations: string[];
  status: 'open' | 'closed' | 'follow_up_required';
  nextAuditDate?: Date;
}

export interface AuditFinding {
  findingId: string;
  severity: 'minor' | 'major' | 'critical';
  category: string;
  description: string;
  evidence?: string;
  correctiveAction?: string;
  responsiblePerson?: string;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

// Chemical and Safety Interfaces

export interface ChemicalComposition {
  component: string;
  casNumber?: string;
  percentage: number;
  role: 'active' | 'inactive' | 'preservative' | 'stabilizer' | 'carrier';
  hazardous: boolean;
}

export interface PhysicalProperties {
  appearance: string;
  odor: string;
  pH?: number;
  density: number;
  viscosity?: number;
  solubility: string;
  meltingPoint?: number;
  boilingPoint?: number;
  flashPoint?: number;
}

export interface StabilityProperties {
  thermalStability: string;
  lightStability: string;
  airStability: string;
  incompatibilities: string[];
  degradationProducts: string[];
  shelfLife: number; // months
}

export interface ReactivityProperties {
  reactivityLevel: 'none' | 'low' | 'moderate' | 'high' | 'extreme';
  incompatibleMaterials: string[];
  hazardousReactions: string[];
  polymerization: boolean;
  oxidizingAgent: boolean;
  reducingAgent: boolean;
}

export interface HazardClassification {
  ghsCategory: string[];
  hazardStatements: string[];
  precautionaryStatements: string[];
  signalWord: 'danger' | 'warning' | 'none';
  pictograms: string[];
}

export interface SafetyDataSheet {
  sdsNumber: string;
  version: string;
  issueDate: Date;
  language: string;
  supplier: string;
  emergencyPhone: string;
  documentUrl: string;
  lastReview: Date;
  nextReview: Date;
}

export interface EnvironmentalProperties {
  biodegradability: 'readily' | 'inherently' | 'not_biodegradable';
  bioaccumulation: boolean;
  aquaticToxicity: 'none' | 'low' | 'moderate' | 'high';
  soilImpact: 'none' | 'low' | 'moderate' | 'high';
  airEmissions: boolean;
  wasteClassification: string;
}

export interface ContainerRequirement {
  materialType: string;
  sealType: string;
  venting: boolean;
  labelingRequirements: string[];
  sizeLimitations?: {
    maxVolume: number;
    maxWeight: number;
  };
}

export interface SegregationRequirement {
  segregateFrom: string[];
  minimumDistance: number; // meters
  barrierRequired: boolean;
  reason: string;
  regulatoryBasis?: string;
}

export interface GHSClassification {
  physicalHazards: string[];
  healthHazards: string[];
  environmentalHazards: string[];
  category: string;
  signalWord: 'danger' | 'warning';
}

export interface NFPARating {
  health: number; // 0-4
  flammability: number; // 0-4
  instability: number; // 0-4
  specificHazards: string[];
}

export interface NOMClassification {
  nomNumber: string;
  classification: string;
  requirements: string[];
  applicableProducts: string[];
}

export interface PPERequirement {
  equipment: string;
  specification: string;
  required: boolean;
  alternatives?: string[];
}

export interface EmergencyProcedure {
  emergencyType: string;
  immediateActions: string[];
  notifications: string[];
  equipment: string[];
  expertise: string[];
}

export interface FirstAidMeasure {
  exposureRoute: 'inhalation' | 'skin' | 'eye' | 'ingestion';
  immediateActions: string[];
  medicalAttention: boolean;
  antidote?: string;
  contraindications: string[];
}

export interface DisposalRequirement {
  method: string;
  approvedFacilities: string[];
  pretreatment?: string[];
  regulations: string[];
  cost: number; // per unit
}

export interface EnvironmentalImpact {
  carbonFootprint: number; // kg CO2 equivalent
  waterUsage: number; // liters per unit
  energyConsumption: number; // kWh per unit
  wasteGeneration: number; // kg per unit
  recyclability: 'recyclable' | 'partially_recyclable' | 'not_recyclable';
  sustainabilityScore: number; // 0-100
}

export interface MaterialCompatibility {
  materialId: string;
  compatibilityLevel: 'compatible' | 'conditional' | 'incompatible';
  conditions?: string[];
  interactions?: string[];
  notes?: string;
}

export interface TransportationRequirement {
  transportClass: string;
  packingGroup: string;
  hazmatRequired: boolean;
  specialEquipment: string[];
  routeRestrictions: string[];
  quantityLimitations?: {
    maxQuantity: number;
    unit: string;
  };
}

// Re-export enhanced inventory types for compatibility
export type InventoryItemType = InventoryItem['type'];
export type AlertSeverity = StockAlert['severity'];
export type MovementType = InventoryMovement['movement_type'];

/**
 * Advanced Inventory Management Configuration
 * Global configuration for the advanced inventory system
 */
export interface AdvancedInventoryConfig {
  /** Enable predictive analytics */
  enablePredictiveAnalytics: boolean;
  /** Enable smart alerts */
  enableSmartAlerts: boolean;
  /** Enable chemical compatibility checking */
  enableChemicalCompatibility: boolean;
  /** Enable automated reordering */
  enableAutomatedReordering: boolean;
  /** Default forecast horizon in days */
  defaultForecastHorizon: number;
  /** Confidence threshold for predictions */
  confidenceThreshold: number;
  /** Alert escalation settings */
  alertEscalation: {
    enableEscalation: boolean;
    maxEscalationLevels: number;
    escalationInterval: number; // minutes
  };
  /** Integration settings */
  integrations: {
    erp: boolean;
    procurement: boolean;
    qualityManagement: boolean;
    warehouseManagement: boolean;
  };
}