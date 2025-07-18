/**
 * Supplier Data Module - Supply Chain Management
 * 
 * Contains supplier information including contact details, quality metrics, delivery performance,
 * certifications, and risk assessments for the Ninu Factory Control supply chain.
 * 
 * @fileoverview Supply chain and vendor management data
 * @module SupplierData
 */

import { SupplierData } from '../types'

// Mexican Chemical Suppliers - Real companies for realistic data
export const mockSuppliers: SupplierData[] = [
  {
    id: 'supplier-001',
    name: 'Química Industrial del Golfo S.A. de C.V.',
    contactInfo: {
      primaryContact: 'Ing. María Elena Vázquez',
      phone: '+52-229-934-5600',
      email: 'ventas@quimigolfo.com.mx',
      emergencyContact: 'Jorge Hernández',
      emergencyPhone: '+52-229-934-5601',
      address: {
        street: 'Av. Lázaro Cárdenas 2850',
        city: 'Veracruz',
        state: 'Veracruz',
        postalCode: '91700',
        country: 'México'
      }
    },
    qualityMetrics: {
      defectRate: 0.5,
      onTimeDelivery: 95.8,
      qualityScore: 94,
      certificationCompliance: 98.5,
      correctiveActions: 2,
      qualityTrend: 'improving'
    },
    deliveryMetrics: {
      averageLeadTime: 5,
      onTimeDeliveryRate: 95.8,
      earlyDeliveryRate: 15.2,
      lateDeliveryRate: 4.2,
      deliveryAccuracy: 98.1,
      transportationCost: 2.50
    },
    certifications: [
      {
        type: 'ISO 9001:2015',
        issuingBody: 'SGS México',
        certificationNumber: 'MX-ISO9001-2024-0152',
        issueDate: new Date('2024-03-15'),
        expirationDate: new Date('2027-03-14'),
        status: 'valid',
        scope: 'Manufactura de químicos industriales'
      },
      {
        type: 'COFEPRIS',
        issuingBody: 'COFEPRIS',
        certificationNumber: 'COFEPRIS-IND-2024-0891',
        issueDate: new Date('2024-01-10'),
        expirationDate: new Date('2025-01-09'),
        status: 'valid',
        scope: 'Distribución de químicos para uso cosmético'
      }
    ],
    riskScore: 15, // Low risk (0-100 scale)
    financialRating: 'A',
    preferredSupplier: true,
    backupSuppliers: ['supplier-002', 'supplier-004']
  },
  {
    id: 'supplier-002',
    name: 'Productos Químicos Especializados de México S.A.',
    contactInfo: {
      primaryContact: 'Lic. Carlos Eduardo Ramírez',
      phone: '+52-55-5234-7890',
      email: 'contacto@pqem.com.mx',
      address: {
        street: 'Blvd. Manuel Ávila Camacho 1847',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '11000',
        country: 'México'
      }
    },
    qualityMetrics: {
      defectRate: 1.2,
      onTimeDelivery: 89.5,
      qualityScore: 91,
      certificationCompliance: 95.0,
      correctiveActions: 4,
      qualityTrend: 'stable'
    },
    deliveryMetrics: {
      averageLeadTime: 7,
      onTimeDeliveryRate: 89.5,
      earlyDeliveryRate: 8.3,
      lateDeliveryRate: 10.5,
      deliveryAccuracy: 94.2,
      transportationCost: 3.20
    },
    certifications: [
      {
        type: 'ISO 14001:2015',
        issuingBody: 'Bureau Veritas México',
        certificationNumber: 'MX-ISO14001-2023-0891',
        issueDate: new Date('2023-08-20'),
        expirationDate: new Date('2026-08-19'),
        status: 'valid',
        scope: 'Gestión ambiental en manufactura química'
      }
    ],
    riskScore: 25, // Medium-low risk
    financialRating: 'B',
    preferredSupplier: false,
    backupSuppliers: ['supplier-001', 'supplier-003']
  },
  {
    id: 'supplier-003',
    name: 'Innovación Química del Bajío S. de R.L. de C.V.',
    contactInfo: {
      primaryContact: 'Ing. Química Ana Patricia González',
      phone: '+52-442-245-6789',
      email: 'ventas@iqbajio.mx',
      address: {
        street: 'Parque Industrial Querétaro, Lote 45',
        city: 'El Marqués',
        state: 'Querétaro',
        postalCode: '76246',
        country: 'México'
      }
    },
    qualityMetrics: {
      defectRate: 0.8,
      onTimeDelivery: 92.3,
      qualityScore: 93,
      certificationCompliance: 97.1,
      correctiveActions: 1,
      qualityTrend: 'improving'
    },
    deliveryMetrics: {
      averageLeadTime: 4,
      onTimeDeliveryRate: 92.3,
      earlyDeliveryRate: 12.1,
      lateDeliveryRate: 7.7,
      deliveryAccuracy: 96.8,
      transportationCost: 2.80
    },
    certifications: [
      {
        type: 'OHSAS 18001',
        issuingBody: 'TÜV Rheinland México',
        certificationNumber: 'MX-OHSAS-2024-0334',
        issueDate: new Date('2024-05-12'),
        expirationDate: new Date('2027-05-11'),
        status: 'valid',
        scope: 'Seguridad y salud ocupacional'
      }
    ],
    riskScore: 18,
    financialRating: 'A',
    preferredSupplier: true
  }
]