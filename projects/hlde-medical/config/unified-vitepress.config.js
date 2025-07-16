// Configuración Unificada de VitePress para HLDE
// Centraliza y optimiza la configuración de ambos sitios VitePress

export const baseConfig = {
  title: 'HLDE - Sistema de Expediente Médico Digital',
  description: 'Sistema de Expediente Médico Digital para DYLAN MARTINEZ LABASTIDA',
  ignoreDeadLinks: true,
  
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/hlde-medical-system' }
    ],
    
    footer: {
      message: 'Sistema de Expediente Médico Digital - HLDE',
      copyright: 'Copyright © 2025 Hospital Sistema Médico Digital'
    },
    
    search: {
      provider: 'local'
    }
  }
};

// Configuración específica para el sitio de documentación principal
export const docsConfig = {
  ...baseConfig,
  base: '/',
  
  themeConfig: {
    ...baseConfig.themeConfig,
    
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Navegación Sistema', link: '/modulos-clinicos/00-navegacion-sistema/' },
      { text: 'Datos Paciente', link: '/modulos-clinicos/01-datos-paciente/' },
      { text: 'Cronología', link: '/modulos-clinicos/02-cronologia-clinica/' },
      { text: 'Diagnósticos', link: '/modulos-clinicos/03-diagnosticos/' },
      { text: 'Tratamientos', link: '/modulos-clinicos/04-tratamientos/' },
      { text: 'Evaluaciones', link: '/modulos-clinicos/05-evaluaciones/' }
    ],

    sidebar: {
      '/': [
        {
          text: '🏥 Sistema HLDE',
          items: [
            { text: 'Visión General', link: '/modulos-clinicos/' },
            { text: 'Acceso de Emergencia', link: '/modulos-clinicos/00-navegacion-sistema/' }
          ]
        },
        {
          text: '🗂️ Módulos Clínicos',
          items: [
            { text: '00 - Sistema de Navegación', link: '/modulos-clinicos/00-navegacion-sistema/' },
            { text: '01 - Datos del Paciente', link: '/modulos-clinicos/01-datos-paciente/' },
            { text: '02 - Cronología Clínica', link: '/modulos-clinicos/02-cronologia-clinica/' },
            { text: '03 - Diagnósticos', link: '/modulos-clinicos/03-diagnosticos/' },
            { text: '04 - Tratamientos', link: '/modulos-clinicos/04-tratamientos/' },
            { text: '05 - Evaluaciones', link: '/modulos-clinicos/05-evaluaciones/' }
          ]
        },
        {
          text: '🚨 Acceso Rápido',
          items: [
            { text: 'Panel de Acceso Rápido', link: '/modulos-clinicos/00-navegacion-sistema/panel-acceso-rapido' },
            { text: 'Guía de Búsqueda', link: '/modulos-clinicos/00-navegacion-sistema/guia-busqueda' },
            { text: 'Referencias Cruzadas', link: '/modulos-clinicos/00-navegacion-sistema/referencias-cruzadas' }
          ]
        }
      ],
      '/modulos-clinicos/': [
        {
          text: '🏥 Sistema HLDE',
          items: [
            { text: 'Visión General', link: '/modulos-clinicos/' },
            { text: 'Acceso de Emergencia', link: '/modulos-clinicos/00-navegacion-sistema/' }
          ]
        },
        {
          text: '🗂️ Módulos Clínicos',
          items: [
            { text: '00 - Sistema de Navegación', link: '/modulos-clinicos/00-navegacion-sistema/' },
            { text: '01 - Datos del Paciente', link: '/modulos-clinicos/01-datos-paciente/' },
            { text: '02 - Cronología Clínica', link: '/modulos-clinicos/02-cronologia-clinica/' },
            { text: '03 - Diagnósticos', link: '/modulos-clinicos/03-diagnosticos/' },
            { text: '04 - Tratamientos', link: '/modulos-clinicos/04-tratamientos/' },
            { text: '05 - Evaluaciones', link: '/modulos-clinicos/05-evaluaciones/' }
          ]
        },
        {
          text: '🚨 Acceso Rápido',
          items: [
            { text: 'Panel de Acceso Rápido', link: '/modulos-clinicos/00-navegacion-sistema/panel-acceso-rapido' },
            { text: 'Guía de Búsqueda', link: '/modulos-clinicos/00-navegacion-sistema/guia-busqueda' },
            { text: 'Referencias Cruzadas', link: '/modulos-clinicos/00-navegacion-sistema/referencias-cruzadas' }
          ]
        }
      ]
    },

    editLink: {
      pattern: 'https://github.com/your-org/hlde-medical-system/edit/main/docs/:path',
      text: 'Editar esta página'
    }
  }
};

// Configuración específica para el sitio médico
export const medicalDocsConfig = {
  ...baseConfig,
  base: '/medical-docs/',
  
  themeConfig: {
    ...baseConfig.themeConfig,
    
    nav: [
      { text: 'Inicio', link: '/' },
      { text: '🚨 Emergencia', link: '/emergency' },
      { text: '👤 Paciente', link: '/patient-core' },
      { text: '🗺️ Navegación', link: '/navigate' }
    ],

    sidebar: [
      {
        text: '🚨 Acceso de Emergencia',
        items: [
          { text: '🚨 Dashboard Crítico', link: '/emergency' },
          { text: '💊 Medicamentos Activos', link: '/meds' },
          { text: '🔬 Laboratorios Recientes', link: '/labs' },
          { text: '📊 Estado Hemodinámico', link: '/status' }
        ]
      },
      {
        text: '👤 Información del Paciente',
        items: [
          { text: '👤 Datos Centrales', link: '/patient-core' },
          { text: '📋 Cronología Clínica', link: '/timeline' },
          { text: '🔍 Diagnósticos y Estudios', link: '/diagnostics' },
          { text: '💉 Tratamientos', link: '/treatment' },
          { text: '📝 Evaluaciones', link: '/assessment' }
        ]
      },
      {
        text: '🗺️ Navegación del Sistema',
        items: [
          { text: '🗺️ Mapa del Sistema', link: '/navigate' },
          { text: '🚀 Rutas Críticas', link: '/critical-routes' },
          { text: '🔄 Flujos de Trabajo', link: '/workflows' }
        ]
      }
    ],

    editLink: {
      pattern: 'https://github.com/your-org/hlde-medical-system/edit/main/medical-docs/:path',
      text: 'Editar esta página'
    }
  }
};

// Configuración por defecto
export default docsConfig;