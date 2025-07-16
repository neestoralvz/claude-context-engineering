export default {
  title: 'Expediente Médico Digital - HLDE',
  description: 'Sistema de Expediente Médico Digital para DYLAN MARTINEZ LABASTIDA',
  base: '/medical-record/',
  
  themeConfig: {
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/medical-system/hlde' }
    ],

    footer: {
      message: 'Sistema de Expediente Médico Digital - HLDE',
      copyright: 'Copyright © 2025 Hospital Sistema Médico Digital'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/medical-system/hlde/edit/main/medical-docs/:path',
      text: 'Editar esta página'
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