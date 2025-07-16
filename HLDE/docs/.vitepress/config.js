export default {
  title: 'Context Engineering',
  description: 'Sistema de Ingeniería de Contexto Inteligente - Comando /context-eng',
  base: '/context-engineering-docs/',
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía Rápida', link: '/getting-started' },
      { text: 'Comando Principal', link: '/context-eng' },
      { text: 'Módulos Clínicos', link: '/modulos-clinicos/' },
      { text: 'Referencia', link: '/reference/' }
    ],

    sidebar: {
      '/': [
        {
          text: '🚀 Introducción',
          items: [
            { text: 'Qué es Context Engineering', link: '/getting-started' },
            { text: 'Instalación y Setup', link: '/installation' },
            { text: 'Primer Uso', link: '/quick-start' }
          ]
        },
        {
          text: '🎯 Comando Principal',
          items: [
            { text: '/context-eng Overview', link: '/context-eng' },
            { text: 'Auto-Activación', link: '/auto-activation' },
            { text: 'Fases del Sistema', link: '/phases' }
          ]
        },
        {
          text: '⚡ Características Avanzadas',
          items: [
            { text: 'Sistema Adaptativo', link: '/adaptive-system' },
            { text: 'Ejecución Paralela', link: '/parallel-execution' },
            { text: 'Multi-Agente', link: '/multi-agent' }
          ]
        },
        {
          text: '📚 Referencia',
          items: [
            { text: 'Comandos Disponibles', link: '/reference/commands' },
            { text: 'Ejemplos de Uso', link: '/reference/examples' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' }
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/context-engineering' }
    ],

    footer: {
      message: 'Sistema de Ingeniería de Contexto Inteligente',
      copyright: 'Copyright © 2025 Context Engineering'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-org/context-engineering/edit/main/docs/:path',
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