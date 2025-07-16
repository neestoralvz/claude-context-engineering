export default {
  title: 'HLDE - Sistema de Expediente Médico Digital',
  description: 'Sistema de Expediente Médico Digital - DYLAN MARTINEZ LABASTIDA',
  base: '/',
  ignoreDeadLinks: true,
  
  themeConfig: {
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/context-engineering' }
    ],

    footer: {
      message: 'Sistema de Expediente Médico Digital HLDE',
      copyright: 'Copyright © 2025 HLDE Medical System'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-org/hlde-medical-system/edit/main/docs/:path',
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