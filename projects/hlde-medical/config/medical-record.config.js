export default {
  title: 'Expediente Médico Digital - HLDE',
  description: 'Sistema de Expediente Médico Digital para DYLAN MARTINEZ LABASTIDA',
  base: '/medical-record/',
  
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Emergencia', link: '/emergency' },
      { text: 'Paciente', link: '/patient-core' },
      { text: 'Navegación', link: '/navigate' }
    ],

    sidebar: {
      '/': [
        {
          text: '🚨 Acceso de Emergencia',
          items: [
            { text: 'Dashboard Crítico', link: '/emergency' },
            { text: 'Medicamentos Activos', link: '/meds' },
            { text: 'Laboratorios', link: '/labs' },
            { text: 'Estado Hemodinámico', link: '/status' }
          ]
        },
        {
          text: '📋 Información del Paciente',
          items: [
            { text: 'Datos Centrales', link: '/patient-core' },
            { text: 'Cronología Clínica', link: '/timeline' },
            { text: 'Diagnósticos', link: '/diagnostics' },
            { text: 'Tratamientos', link: '/treatment' },
            { text: 'Evaluaciones', link: '/assessment' }
          ]
        },
        {
          text: '📁 Secciones del Expediente',
          items: [
            { text: 'Índice General', link: '/indice-general' },
            { text: 'Información de Ingreso', link: '/informacion-ingreso' },
            { text: 'Evolución Diaria', link: '/evolucion-diaria' },
            { text: 'Interconsultas', link: '/interconsultas' },
            { text: 'Traslados', link: '/traslados' }
          ]
        },
        {
          text: '🗺️ Navegación del Sistema',
          items: [
            { text: 'Sistema de Navegación', link: '/navigate' },
            { text: 'Rutas de Acceso Crítico', link: '/critical-routes' },
            { text: 'Flujos de Trabajo', link: '/workflows' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/medical-record-system' }
    ],

    footer: {
      message: 'Sistema de Expediente Médico Digital - HLDE',
      copyright: 'Copyright © 2025 Hospital Sistema Médico Digital'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
}