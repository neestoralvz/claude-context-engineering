/**
 * System Data Module - Company and System Configuration
 * 
 * Contains company information, categories, and system-wide configuration data.
 * This module provides the foundational data for the Ninu Factory Control system.
 * 
 * @fileoverview System and company configuration data
 * @module SystemData
 */

// Categorías oficiales de Ninu.mx
export const ninuCategories = [
  { id: 'desinfeccion', name: 'Desinfección', icon: '🦠' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧽' },
  { id: 'salud-bienestar', name: 'Salud y Bienestar', icon: '💊' },
  { id: 'autos', name: 'Autos', icon: '🚗' },
  { id: 'albercas', name: 'Albercas', icon: '🏊' },
  { id: 'alimentos', name: 'Alimentos', icon: '🍽️' },
  { id: 'quimicos', name: 'Químicos', icon: '⚗️' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐕' }
] as const

// Información de contacto oficial de Ninu.mx
export const ninuContactInfo = {
  company: 'Negocio de Innovación Utópica, S. de R.L. de C.V.',
  brand: 'Ninu.mx',
  slogan: 'Tu aliado esencial',
  location: 'Xalapa-Enríquez, Veracruz, México',
  email: 'hola@ninu.mx',
  phone: '+52-229-229-9399',
  whatsapp: '5222999399',
  website: 'https://ninu.mx',
  social: {
    facebook: 'NINU.mx',
    twitter: '@ninumx',
    youtube: '@ninumx'
  }
} as const