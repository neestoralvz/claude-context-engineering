'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  DollarSign,
  Award,
  AlertCircle,
  Users,
  Target,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  SupplierCertification,
  ContactInformation
} from '../../types';

interface SupplierPerformanceProps {
  viewMode?: 'full' | 'summary';
  supplierId?: string;
}

// Local simplified interfaces for supplier performance
interface SimpleSupplierData {
  id: string;
  name: string;
  code: string;
  category: string;
  status: 'active' | 'inactive';
  tier: 'strategic' | 'preferred' | 'approved';
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    primaryContact: string;
    phone: string;
    email: string;
    emergencyPhone: string;
    website: string;
  };
  performanceMetrics: {
    overallScore: number;
    qualityScore: number;
    deliveryScore: number;
    serviceScore: number;
    priceCompetitiveness: number;
    defectRate: number;
    onTimeDeliveryRate: number;
    leadTimeAverage: number;
    responseTime: number;
    fillRate: number;
    lastUpdated: Date;
  };
  certifications: SimpleCertification[];
  riskAssessment: {
    overallRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    financialRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    operationalRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    reputationalRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    geographicalRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    riskScore: number;
    lastAssessed: Date;
    mitigationStrategies: string[];
  };
  contractDetails: {
    contractType: string;
    startDate: Date;
    endDate: Date;
    paymentTerms: string;
    currency: string;
    minimumOrder: number;
    discountStructure: { volume: number; discount: number; }[];
  };
  materialCategories: string[];
  annualSpend: number;
  orders: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
  };
}

interface SimpleCertification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended';
  description: string;
  documentUrl: string;
}

// Mock data para proveedores mexicanos
const mockSuppliers: SimpleSupplierData[] = [
  {
    id: 'qb-001',
    name: 'Química Básica S.A. de C.V.',
    code: 'QB001',
    category: 'Químicos Industriales',
    status: 'active',
    tier: 'preferred',
    location: {
      address: 'Av. Industria 1250, Zona Industrial',
      city: 'Guadalajara',
      state: 'Jalisco',
      country: 'México',
      postalCode: '44940'
    },
    contact: {
      primaryContact: 'Ing. Carlos Mendoza',
      phone: '+52 33 1234 5678',
      email: 'carlos.mendoza@quimicabasica.com.mx',
      emergencyPhone: '+52 33 9876 5432',
      website: 'https://quimicabasica.com.mx'
    },
    performanceMetrics: {
      overallScore: 92,
      qualityScore: 95,
      deliveryScore: 88,
      serviceScore: 94,
      priceCompetitiveness: 87,
      defectRate: 0.8,
      onTimeDeliveryRate: 88.5,
      leadTimeAverage: 5.2,
      responseTime: 2.1,
      fillRate: 96.8,
      lastUpdated: new Date('2024-01-15')
    },
    certifications: [
      {
        id: 'cert-001',
        name: 'ISO 9001:2015',
        issuedBy: 'IMNC',
        issuedDate: new Date('2022-03-15'),
        expiryDate: new Date('2025-03-15'),
        status: 'active',
        description: 'Sistema de Gestión de Calidad',
        documentUrl: 'https://docs.supplier.com/iso9001.pdf'
      },
      {
        id: 'cert-002',
        name: 'COFEPRIS',
        issuedBy: 'COFEPRIS',
        issuedDate: new Date('2023-01-10'),
        expiryDate: new Date('2025-01-10'),
        status: 'active',
        description: 'Registro Sanitario de Productos Químicos',
        documentUrl: 'https://docs.supplier.com/cofepris.pdf'
      }
    ],
    riskAssessment: {
      overallRisk: 'low',
      financialRisk: 'low',
      operationalRisk: 'medium',
      reputationalRisk: 'low',
      geographicalRisk: 'low',
      riskScore: 25,
      lastAssessed: new Date('2024-01-10'),
      mitigationStrategies: [
        'Diversificar proveedores de respaldo',
        'Monitoreo financiero trimestral',
        'Auditoría anual de calidad'
      ]
    },
    contractDetails: {
      contractType: 'Framework Agreement',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2025-12-31'),
      paymentTerms: 'Net 30',
      currency: 'MXN',
      minimumOrder: 500,
      discountStructure: [
        { volume: 1000, discount: 2 },
        { volume: 5000, discount: 5 },
        { volume: 10000, discount: 8 }
      ]
    },
    materialCategories: [
      'Alcoholes',
      'Ácidos',
      'Bases',
      'Solventes'
    ],
    annualSpend: 2150000,
    orders: {
      totalOrders: 52,
      completedOrders: 48,
      pendingOrders: 4,
      averageOrderValue: 41350
    }
  },
  {
    id: 'dc-002',
    name: 'Distribuidora Química del Centro S.A.',
    code: 'DQC002',
    category: 'Especialidades Químicas',
    status: 'active',
    tier: 'approved',
    location: {
      address: 'Calle Química 456, Parque Industrial',
      city: 'Querétaro',
      state: 'Querétaro',
      country: 'México',
      postalCode: '76120'
    },
    contact: {
      primaryContact: 'Lic. María González',
      phone: '+52 442 123 4567',
      email: 'maria.gonzalez@dqcentro.com',
      emergencyPhone: '+52 442 987 6543',
      website: 'https://dqcentro.com'
    },
    performanceMetrics: {
      overallScore: 78,
      qualityScore: 82,
      deliveryScore: 75,
      serviceScore: 80,
      priceCompetitiveness: 75,
      defectRate: 2.1,
      onTimeDeliveryRate: 75.2,
      leadTimeAverage: 7.8,
      responseTime: 4.2,
      fillRate: 89.5,
      lastUpdated: new Date('2024-01-12')
    },
    certifications: [
      {
        id: 'cert-003',
        name: 'ISO 14001',
        issuedBy: 'IMNC',
        issuedDate: new Date('2022-06-01'),
        expiryDate: new Date('2025-06-01'),
        status: 'active',
        description: 'Sistema de Gestión Ambiental',
        documentUrl: 'https://docs.supplier.com/iso14001.pdf'
      }
    ],
    riskAssessment: {
      overallRisk: 'medium',
      financialRisk: 'medium',
      operationalRisk: 'medium',
      reputationalRisk: 'low',
      geographicalRisk: 'low',
      riskScore: 45,
      lastAssessed: new Date('2024-01-08'),
      mitigationStrategies: [
        'Revisión mensual de desempeño',
        'Plan de mejora conjunta',
        'Capacitación en procesos'
      ]
    },
    contractDetails: {
      contractType: 'Standard Supply Agreement',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-12-31'),
      paymentTerms: 'Net 15',
      currency: 'MXN',
      minimumOrder: 200,
      discountStructure: [
        { volume: 500, discount: 1 },
        { volume: 2000, discount: 3 }
      ]
    },
    materialCategories: [
      'Hipocloritos',
      'Tensioactivos',
      'Conservadores'
    ],
    annualSpend: 980000,
    orders: {
      totalOrders: 38,
      completedOrders: 32,
      pendingOrders: 6,
      averageOrderValue: 25800
    }
  },
  {
    id: 'pq-003',
    name: 'Productos Químicos Especializados',
    code: 'PQE003',
    category: 'Materias Primas',
    status: 'active',
    tier: 'strategic',
    location: {
      address: 'Boulevard Industrial 789, Sector Químico',
      city: 'Monterrey',
      state: 'Nuevo León',
      country: 'México',
      postalCode: '64000'
    },
    contact: {
      primaryContact: 'Dr. Roberto Martínez',
      phone: '+52 81 8765 4321',
      email: 'roberto.martinez@pqespecializados.mx',
      emergencyPhone: '+52 81 5432 1098',
      website: 'https://pqespecializados.mx'
    },
    performanceMetrics: {
      overallScore: 96,
      qualityScore: 98,
      deliveryScore: 95,
      serviceScore: 97,
      priceCompetitiveness: 93,
      defectRate: 0.3,
      onTimeDeliveryRate: 95.8,
      leadTimeAverage: 3.1,
      responseTime: 1.5,
      fillRate: 98.9,
      lastUpdated: new Date('2024-01-18')
    },
    certifications: [
      {
        id: 'cert-004',
        name: 'ISO 9001:2015',
        issuedBy: 'IMNC',
        issuedDate: new Date('2021-09-15'),
        expiryDate: new Date('2024-09-15'),
        status: 'active',
        description: 'Sistema de Gestión de Calidad',
        documentUrl: 'https://docs.supplier.com/iso9001_pqe.pdf'
      },
      {
        id: 'cert-005',
        name: 'COFEPRIS',
        issuedBy: 'COFEPRIS',
        issuedDate: new Date('2023-04-20'),
        expiryDate: new Date('2025-04-20'),
        status: 'active',
        description: 'Registro Sanitario de Productos Químicos',
        documentUrl: 'https://docs.supplier.com/cofepris_pqe.pdf'
      },
      {
        id: 'cert-006',
        name: 'OHSAS 18001',
        issuedBy: 'Bureau Veritas',
        issuedDate: new Date('2022-11-01'),
        expiryDate: new Date('2025-11-01'),
        status: 'active',
        description: 'Sistema de Gestión de Seguridad y Salud Ocupacional',
        documentUrl: 'https://docs.supplier.com/ohsas18001.pdf'
      }
    ],
    riskAssessment: {
      overallRisk: 'very_low',
      financialRisk: 'very_low',
      operationalRisk: 'low',
      reputationalRisk: 'very_low',
      geographicalRisk: 'very_low',
      riskScore: 15,
      lastAssessed: new Date('2024-01-15'),
      mitigationStrategies: [
        'Mantenimiento de relación estratégica',
        'Innovación conjunta',
        'Contratos de largo plazo'
      ]
    },
    contractDetails: {
      contractType: 'Strategic Partnership Agreement',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2027-12-31'),
      paymentTerms: 'Net 45',
      currency: 'MXN',
      minimumOrder: 1000,
      discountStructure: [
        { volume: 2000, discount: 5 },
        { volume: 8000, discount: 10 },
        { volume: 15000, discount: 15 }
      ]
    },
    materialCategories: [
      'Sales Cuaternarias',
      'Principios Activos',
      'Fragancias',
      'Colorantes'
    ],
    annualSpend: 3450000,
    orders: {
      totalOrders: 76,
      completedOrders: 74,
      pendingOrders: 2,
      averageOrderValue: 45400
    }
  }
];

// Datos para gráficos
const mockPerformanceTrends = [
  { month: 'Ene', qb001: 90, dqc002: 75, pqe003: 95 },
  { month: 'Feb', qb001: 88, dqc002: 77, pqe003: 96 },
  { month: 'Mar', qb001: 92, dqc002: 78, pqe003: 97 },
  { month: 'Abr', qb001: 89, dqc002: 76, pqe003: 95 },
  { month: 'May', qb001: 91, dqc002: 79, pqe003: 98 },
  { month: 'Jun', qb001: 93, dqc002: 80, pqe003: 96 }
];

const mockSpendingData = [
  { supplier: 'PQE', amount: 3450, percentage: 52 },
  { supplier: 'QB', amount: 2150, percentage: 32 },
  { supplier: 'DQC', amount: 980, percentage: 15 },
  { supplier: 'Otros', amount: 85, percentage: 1 }
];

const riskColors = {
  very_low: '#10B981',
  low: '#84CC16',
  medium: '#F59E0B',
  high: '#EF4444',
  very_high: '#7C2D12'
};

export function SupplierPerformance({ viewMode = 'full', supplierId }: SupplierPerformanceProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(supplierId || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'certifications' | 'contracts'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar proveedores
  const filteredSuppliers = selectedSupplier 
    ? mockSuppliers.filter(s => s.id === selectedSupplier)
    : mockSuppliers;

  // Refresh data
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Obtener color según tier
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'strategic':
        return 'bg-purple-100 text-purple-800';
      case 'preferred':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color según riesgo
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'very_low':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-lime-100 text-lime-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'very_high':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Componente para tarjeta de proveedor
  const SupplierCard = ({ supplier }: { supplier: SimpleSupplierData }) => {
    const tierColor = getTierColor(supplier.tier);
    const riskColor = getRiskColor(supplier.riskAssessment.overallRisk);
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.code}</p>
                <p className="text-sm text-gray-500">
                  {supplier.location.city}, {supplier.location.state}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${tierColor} text-xs mb-1`}>
                {supplier.tier}
              </Badge>
              <p className="text-sm font-medium text-gray-900">
                Score: {supplier.performanceMetrics.overallScore}
              </p>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {supplier.performanceMetrics.qualityScore}
              </p>
              <p className="text-xs text-gray-600">Calidad</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {supplier.performanceMetrics.deliveryScore}
              </p>
              <p className="text-xs text-gray-600">Entrega</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {supplier.performanceMetrics.onTimeDeliveryRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Puntualidad</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {supplier.performanceMetrics.leadTimeAverage.toFixed(1)}d
              </p>
              <p className="text-xs text-gray-600">Lead Time</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Gasto anual: ${(supplier.annualSpend / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600">
                Pedidos: {supplier.orders.totalOrders}
              </p>
            </div>
            <div className="text-right">
              <Badge className={`${riskColor} text-xs`}>
                Riesgo: {supplier.riskAssessment.overallRisk.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Componente para detalles de proveedor
  const SupplierDetails = ({ supplier }: { supplier: SimpleSupplierData }) => {
    const radarData = [
      { subject: 'Calidad', A: supplier.performanceMetrics.qualityScore, fullMark: 100 },
      { subject: 'Entrega', A: supplier.performanceMetrics.deliveryScore, fullMark: 100 },
      { subject: 'Servicio', A: supplier.performanceMetrics.serviceScore, fullMark: 100 },
      { subject: 'Precio', A: supplier.performanceMetrics.priceCompetitiveness, fullMark: 100 },
      { subject: 'Respuesta', A: 100 - (supplier.performanceMetrics.responseTime * 10), fullMark: 100 }
    ];

    return (
      <div className="space-y-6">
        {/* Información general */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Información General</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {supplier.location.address}, {supplier.location.city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{supplier.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{supplier.contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{supplier.contact.website}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Radar de Desempeño</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Desempeño"
                      dataKey="A"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Certificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplier.certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    <Badge className={`text-xs ${cert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cert.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                  <div className="text-xs text-gray-500">
                    <p>Emitido: {cert.issuedDate.toLocaleDateString()}</p>
                    <p>Vence: {cert.expiryDate.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evaluación de riesgo */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluación de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Factores de Riesgo</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Financiero', value: supplier.riskAssessment.financialRisk },
                    { label: 'Operacional', value: supplier.riskAssessment.operationalRisk },
                    { label: 'Reputacional', value: supplier.riskAssessment.reputationalRisk },
                    { label: 'Geográfico', value: supplier.riskAssessment.geographicalRisk }
                  ].map((risk) => (
                    <div key={risk.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{risk.label}</span>
                      <Badge className={`text-xs ${getRiskColor(risk.value)}`}>
                        {risk.value.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estrategias de Mitigación</h4>
                <div className="space-y-2">
                  {supplier.riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="text-sm text-gray-700">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {viewMode === 'full' && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Desempeño de Proveedores</h2>
            <p className="text-gray-600 mt-1">
              Análisis integral del desempeño de {mockSuppliers.length} proveedores
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      {viewMode === 'full' && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: BarChart3 },
              { id: 'performance', name: 'Desempeño', icon: TrendingUp },
              { id: 'risk', name: 'Riesgo', icon: AlertTriangle },
              { id: 'certifications', name: 'Certificaciones', icon: Award },
              { id: 'contracts', name: 'Contratos', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Overview Tab */}
      {(activeTab === 'overview' || viewMode === 'summary') && (
        <div className="space-y-6">
          {/* Métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Proveedores</p>
                    <p className="text-2xl font-bold text-gray-900">{mockSuppliers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(mockSuppliers.reduce((acc, s) => acc + s.performanceMetrics.overallScore, 0) / mockSuppliers.length).toFixed(1)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gasto Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(mockSuppliers.reduce((acc, s) => acc + s.annualSpend, 0) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockSuppliers.reduce((acc, s) => acc + s.orders.pendingOrders, 0)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de proveedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSuppliers.map(supplier => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>

          {/* Gráfico de distribución de gasto */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Gasto Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockSpendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {mockSpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}K`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && viewMode === 'full' && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias de Desempeño</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={mockPerformanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="qb001" stroke="#3B82F6" name="Química Básica" />
                <Line type="monotone" dataKey="dqc002" stroke="#10B981" name="DQ Centro" />
                <Line type="monotone" dataKey="pqe003" stroke="#F59E0B" name="PQ Especializados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Risk Tab */}
      {activeTab === 'risk' && viewMode === 'full' && (
        <div className="space-y-6">
          {mockSuppliers.map(supplier => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle>{supplier.name} - Evaluación de Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Score de Riesgo: {supplier.riskAssessment.riskScore}</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Financiero', value: supplier.riskAssessment.financialRisk },
                        { label: 'Operacional', value: supplier.riskAssessment.operationalRisk },
                        { label: 'Reputacional', value: supplier.riskAssessment.reputationalRisk },
                        { label: 'Geográfico', value: supplier.riskAssessment.geographicalRisk }
                      ].map((risk) => (
                        <div key={risk.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{risk.label}</span>
                          <Badge className={`text-xs ${getRiskColor(risk.value)}`}>
                            {risk.value.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Estrategias de Mitigación</h4>
                    <div className="space-y-2">
                      {supplier.riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Shield className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-gray-700">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && viewMode === 'full' && (
        <div className="space-y-6">
          {mockSuppliers.map(supplier => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle>{supplier.name} - Certificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supplier.certifications.map((cert) => (
                    <div key={cert.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        <Badge className={`text-xs ${cert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {cert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                      <div className="text-xs text-gray-500">
                        <p>Emitido: {cert.issuedDate.toLocaleDateString()}</p>
                        <p>Vence: {cert.expiryDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && viewMode === 'full' && (
        <div className="space-y-6">
          {mockSuppliers.map(supplier => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle>{supplier.name} - Detalles de Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Información del Contrato</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="text-sm font-medium">{supplier.contractDetails.contractType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Inicio:</span>
                        <span className="text-sm font-medium">{supplier.contractDetails.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fin:</span>
                        <span className="text-sm font-medium">{supplier.contractDetails.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Términos de Pago:</span>
                        <span className="text-sm font-medium">{supplier.contractDetails.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pedido Mínimo:</span>
                        <span className="text-sm font-medium">{supplier.contractDetails.minimumOrder}L</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Descuentos por Volumen</h4>
                    <div className="space-y-2">
                      {supplier.contractDetails.discountStructure.map((discount, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-gray-600">{discount.volume}L+:</span>
                          <span className="text-sm font-medium">{discount.discount}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}