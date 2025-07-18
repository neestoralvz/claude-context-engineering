import { MetadataRoute } from 'next'
import { ninuContactInfo } from '../lib/mock-data'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = ninuContactInfo.website
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/productos',
          '/productos/*',
          '/clientes',
          '/images/*',
          '/api/health'
        ],
        disallow: [
          '/dashboard*',
          '/admin*',
          '/inventarios*',
          '/produccion*',
          '/api/metrics*',
          '/api/reactors*',
          '/api/stations*',
          '/api/orders*',
          '/*.pdf',
          '/temp/*',
          '/logs/*',
          '/coverage/*',
          '/node_modules/*'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/productos',
          '/productos/*',
          '/clientes',
          '/images/*'
        ],
        disallow: [
          '/dashboard*',
          '/admin*',
          '/api/*'
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/productos',
          '/productos/*',
          '/clientes',
          '/images/*'
        ],
        disallow: [
          '/dashboard*',
          '/admin*',
          '/api/*'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}