import { MetadataRoute } from 'next'
import { mockProducts, ninuContactInfo, ninuCategories } from '../lib/mock-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = ninuContactInfo.website

  // Static pages with priority and update frequency
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/productos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/inventarios`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/produccion`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/clientes`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }
  ]

  // Product category pages
  const categoryPages = ninuCategories.map(category => ({
    url: `${baseUrl}/productos?category=${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Individual product pages
  const productPages = mockProducts.map(product => ({
    url: `${baseUrl}/productos/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages
  ]
}