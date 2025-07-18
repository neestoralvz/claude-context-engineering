/**
 * Secondary Product Data Module - Specialized Product Categories
 * 
 * Contains specialized product categories: Albercas and Químicos.
 * These are the specialized product lines for industrial and technical applications.
 * 
 * @fileoverview Secondary product categories data
 * @module ProductDataSecondary
 */

import { Product } from '../types'

export const secondaryProducts: Product[] = [
  // ALBERCAS CATEGORY
  {
    id: 'prod-022',
    name: 'Kit Mantenimiento Alberca Completo Ninu',
    category: 'albercas',
    description: 'Kit completo para mantenimiento profesional de albercas y piscinas',
    size: 3,
    unit: 'pzas',
    packaging: 'kit',
    cofepisApproval: true,
    ingredients: ['Cloro en polvo 1kg', 'Alguicida concentrado 1L', 'Clarificador líquido 1L'],
    useCase: ['Albercas', 'Piscinas', 'Jacuzzis', 'Mantenimiento preventivo'],
    shelfLife: 36,
    currentStock: 85,
    minStock: 25,
    productionCost: 120.00,
    salePrice: 298.90
  },
  {
    id: 'prod-023',
    name: 'Cloro En Polvo Ninu 1kg',
    category: 'albercas',
    description: 'Tricloro en polvo para desinfección efectiva de albercas',
    size: 1,
    unit: 'kg',
    packaging: 'bag',
    cofepisApproval: true,
    ingredients: ['Tricloro', 'Estabilizantes', 'Agentes dispersantes'],
    useCase: ['Desinfección albercas', 'Eliminación bacterias', 'Tratamiento agua'],
    shelfLife: 60,
    currentStock: 200,
    minStock: 70,
    productionCost: 45.00,
    salePrice: 95.00
  },
  {
    id: 'prod-024',
    name: 'Alguicida Concentrado Para Albercas 10L Ninu',
    category: 'albercas',
    description: 'Alguicida concentrado para eliminación de algas verdes, amarillas y negras',
    size: 10,
    unit: 'l',
    packaging: 'container',
    cofepisApproval: true,
    ingredients: ['Compuestos de cobre', 'Alguicidas cuaternarios', 'Estabilizantes'],
    useCase: ['Eliminación algas', 'Prevención algas', 'Mantenimiento preventivo'],
    shelfLife: 48,
    currentStock: 90,
    minStock: 30,
    productionCost: 180.00,
    salePrice: 360.00
  },
  {
    id: 'prod-025',
    name: 'Clarificador Líquido Para Alberca 4L Ninu',
    category: 'albercas',
    description: 'Clarificador líquido para mejorar transparencia del agua de albercas',
    size: 4,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Polímeros clarificantes', 'Floculantes', 'Estabilizantes'],
    useCase: ['Clarificación agua', 'Transparencia', 'Filtración mejorada'],
    shelfLife: 36,
    currentStock: 110,
    minStock: 35,
    productionCost: 85.00,
    salePrice: 170.00
  },
  {
    id: 'prod-026',
    name: 'Clarificador Líquido Para Alberca 10L Ninu',
    category: 'albercas',
    description: 'Clarificador líquido presentación industrial para albercas grandes',
    size: 10,
    unit: 'l',
    packaging: 'container',
    cofepisApproval: true,
    ingredients: ['Polímeros clarificantes concentrados', 'Floculantes industriales', 'Estabilizantes'],
    useCase: ['Albercas grandes', 'Uso profesional', 'Mantenimiento industrial'],
    shelfLife: 36,
    currentStock: 65,
    minStock: 20,
    productionCost: 195.00,
    salePrice: 390.00
  },

  // QUÍMICOS CATEGORY
  {
    id: 'prod-027',
    name: 'Agua Destilada Desmineralizada 5L Ninu',
    category: 'quimicos',
    description: 'Agua destilada desmineralizada de alta pureza para uso laboratorio y cosmético',
    size: 5,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Agua 100% destilada', 'Desmineralizada', 'Libre de impurezas'],
    useCase: ['Laboratorio', 'Cosmética', 'Limpieza equipos', 'Uso técnico'],
    shelfLife: 60,
    currentStock: 150,
    minStock: 50,
    productionCost: 68.00,
    salePrice: 135.00
  },
  {
    id: 'prod-028',
    name: 'Agua Destilada Desmineralizada 20L Ninu',
    category: 'quimicos',
    description: 'Agua destilada desmineralizada grado industrial/profesional',
    size: 20,
    unit: 'l',
    packaging: 'container',
    cofepisApproval: true,
    ingredients: ['Agua 100% destilada', 'Desmineralizada', 'Grado industrial'],
    useCase: ['Industria', 'Laboratorios', 'Equipos médicos', 'Procesos industriales'],
    shelfLife: 60,
    currentStock: 80,
    minStock: 25,
    productionCost: 142.00,
    salePrice: 284.90
  }
]