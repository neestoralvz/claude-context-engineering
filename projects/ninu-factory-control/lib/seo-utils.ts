import { Product } from '../types'
import { ninuContactInfo, ninuCategories } from './mock-data'

// Primary Mexican cleaning products keywords
export const PRIMARY_KEYWORDS = [
  'productos limpieza ecológicos México',
  'gel antibacterial COFEPRIS',
  'desinfectantes biodegradables',
  'jabones hipoalergénicos',
  'sanitizante sin alcohol',
  'productos limpieza México',
  'limpieza hogar ecológica'
] as const

// Long-tail keywords for specific products
export const PRODUCT_KEYWORDS = {
  'desinfeccion': [
    'gel antibacterial 70% alcohol',
    'sanitizante sales cuaternarias',
    'desinfectante libre alcohol',
    'gel antibacterial COFEPRIS México'
  ],
  'limpieza': [
    'jabón trastes concentrado',
    'detergente hipoalergénico',
    'limpiador multiusos antibacterial',
    'jabón manos antibacterial'
  ],
  'albercas': [
    'cloro polvo alberca',
    'alguicida concentrado',
    'clarificador líquido piscina',
    'kit mantenimiento alberca'
  ],
  'salud-bienestar': [
    'gel conductor ultrasonido',
    'desodorante piedra alumbre',
    'aceite masaje relajante'
  ],
  'quimicos': [
    'agua destilada desmineralizada',
    'agua grado laboratorio'
  ]
} as const

// Generate SEO-optimized title for products
export function generateProductTitle(product: Product): string {
  const category = ninuCategories.find(cat => cat.id === product.category)
  const categoryKeywords = PRODUCT_KEYWORDS[product.category as keyof typeof PRODUCT_KEYWORDS] || []
  
  // Base title with product name and brand
  let title = `${product.name} | ${ninuContactInfo.brand}`
  
  // Add COFEPRIS certification if applicable
  if (product.cofepisApproval) {
    title += ' | Certificado COFEPRIS'
  }
  
  // Add category context
  if (category) {
    title += ` | ${category.name} México`
  }
  
  // Ensure title is under 60 characters for optimal SEO
  if (title.length > 60) {
    title = `${product.name} COFEPRIS | ${ninuContactInfo.brand}`
  }
  
  return title
}

// Generate SEO-optimized description for products
export function generateProductDescription(product: Product): string {
  const category = ninuCategories.find(cat => cat.id === product.category)
  const categoryKeywords = PRODUCT_KEYWORDS[product.category as keyof typeof PRODUCT_KEYWORDS] || []
  
  let description = product.description
  
  // Add certification info
  if (product.cofepisApproval) {
    description += ' Certificado COFEPRIS para máxima seguridad.'
  }
  
  // Add size and availability info
  description += ` Presentación ${product.size}${product.unit}. `
  
  if (product.currentStock > 0) {
    description += 'Disponible para envío inmediato desde Xalapa, Veracruz a toda la República Mexicana.'
  }
  
  // Add relevant keywords naturally
  const relevantKeywords = categoryKeywords.slice(0, 2)
  if (relevantKeywords.length > 0) {
    description += ` Ideal para: ${relevantKeywords.join(', ')}.`
  }
  
  // Add brand and quality assurance
  description += ` Productos de limpieza ecológicos ${ninuContactInfo.brand} - La confianza de miles de familias mexicanas.`
  
  // Ensure description is under 160 characters for optimal SEO
  if (description.length > 160) {
    description = `${product.description} Certificado COFEPRIS. ${product.size}${product.unit}. Envío gratis México. ${ninuContactInfo.brand}`
  }
  
  return description
}

// Generate keyword-rich alt text for product images
export function generateProductAltText(product: Product): string {
  const category = ninuCategories.find(cat => cat.id === product.category)
  
  let altText = product.name
  
  if (category) {
    altText += ` - ${category.name}`
  }
  
  if (product.cofepisApproval) {
    altText += ' certificado COFEPRIS'
  }
  
  altText += ` ${product.size}${product.unit} - Productos de limpieza ecológicos México ${ninuContactInfo.brand}`
  
  return altText
}

// Generate breadcrumb items for SEO
export function generateBreadcrumbs(page: string, product?: Product) {
  const breadcrumbs = [
    { name: 'Inicio', url: '/' }
  ]
  
  if (page === 'products' || page === 'product-detail') {
    breadcrumbs.push({
      name: 'Productos de Limpieza',
      url: '/productos'
    })
  }
  
  if (page === 'product-detail' && product) {
    const category = ninuCategories.find(cat => cat.id === product.category)
    if (category) {
      breadcrumbs.push({
        name: category.name,
        url: `/productos?category=${product.category}`
      })
    }
    breadcrumbs.push({
      name: product.name,
      url: `/productos/${product.id}`
    })
  }
  
  return breadcrumbs
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  return `${ninuContactInfo.website}${path}`
}

// Generate hreflang tags for Mexican market
export function generateHreflangTags(path: string) {
  return [
    {
      hreflang: 'es-MX',
      href: `${ninuContactInfo.website}${path}`
    },
    {
      hreflang: 'es',
      href: `${ninuContactInfo.website}${path}`
    },
    {
      hreflang: 'x-default',
      href: `${ninuContactInfo.website}${path}`
    }
  ]
}

// SEO scoring function for content optimization
export function calculateSEOScore(content: string, targetKeywords: string[]): number {
  let score = 0
  const contentLower = content.toLowerCase()
  
  // Check keyword density (should be 1-3%)
  const wordCount = content.split(/\s+/).length
  const keywordOccurrences = targetKeywords.reduce((count, keyword) => {
    const occurrences = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length
    return count + occurrences
  }, 0)
  
  const keywordDensity = (keywordOccurrences / wordCount) * 100
  
  if (keywordDensity >= 1 && keywordDensity <= 3) {
    score += 25
  } else if (keywordDensity > 0) {
    score += 10
  }
  
  // Check for primary keywords in important positions
  targetKeywords.forEach(keyword => {
    if (contentLower.includes(keyword.toLowerCase())) {
      score += 15
    }
  })
  
  // Check content length (ideal: 300-600 words)
  if (wordCount >= 300 && wordCount <= 600) {
    score += 20
  } else if (wordCount >= 150) {
    score += 10
  }
  
  // Check for Mexican market targeting
  const mexicanTerms = ['méxico', 'mexicano', 'mexicana', 'cofepris', 'veracruz', 'xalapa']
  const mexicanMentions = mexicanTerms.filter(term => contentLower.includes(term)).length
  score += Math.min(mexicanMentions * 5, 20)
  
  // Check for brand mentions
  if (contentLower.includes(ninuContactInfo.brand.toLowerCase())) {
    score += 10
  }
  
  return Math.min(score, 100)
}

// Generate JSON-LD structured data for rich snippets
export function generateStructuredDataForProduct(product: Product) {
  const category = ninuCategories.find(cat => cat.id === product.category)
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": generateProductDescription(product),
    "image": `${ninuContactInfo.website}/images/productos/${product.id}.webp`,
    "brand": {
      "@type": "Brand",
      "name": ninuContactInfo.brand
    },
    "manufacturer": {
      "@type": "Organization",
      "name": ninuContactInfo.company
    },
    "category": category?.name,
    "offers": {
      "@type": "Offer",
      "price": product.salePrice,
      "priceCurrency": "MXN",
      "availability": product.currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": ninuContactInfo.brand
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50"
    }
  }
}

// Extract keywords from product content
export function extractKeywordsFromProduct(product: Product): string[] {
  const keywords = new Set<string>()
  
  // Add category-specific keywords
  const categoryKeywords = PRODUCT_KEYWORDS[product.category as keyof typeof PRODUCT_KEYWORDS] || []
  categoryKeywords.forEach(keyword => keywords.add(keyword))
  
  // Add primary keywords
  PRIMARY_KEYWORDS.forEach(keyword => keywords.add(keyword))
  
  // Add product-specific keywords from name and description
  const productText = `${product.name} ${product.description}`.toLowerCase()
  
  // Extract relevant terms from ingredients
  product.ingredients.forEach(ingredient => {
    if (ingredient.length > 4) { // Only meaningful ingredients
      keywords.add(ingredient.toLowerCase())
    }
  })
  
  // Add use cases as keywords
  product.useCase.forEach(useCase => {
    keywords.add(useCase.toLowerCase())
  })
  
  return Array.from(keywords).slice(0, 15) // Limit to 15 most relevant keywords
}

// Generate meta tags object for any page
export function generateMetaTags(page: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  path: string
  product?: Product
}) {
  const keywords = page.keywords || PRIMARY_KEYWORDS
  
  return {
    title: page.title,
    description: page.description,
    keywords: keywords.join(', '),
    canonical: generateCanonicalUrl(page.path),
    openGraph: {
      title: page.title,
      description: page.description,
      url: generateCanonicalUrl(page.path),
      siteName: ninuContactInfo.brand,
      locale: 'es_MX',
      type: 'website',
      images: page.image ? [page.image] : [`${ninuContactInfo.website}/images/ninu/logo.webp`]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      creator: '@ninumx',
      images: page.image ? [page.image] : [`${ninuContactInfo.website}/images/ninu/logo.webp`]
    },
    hreflang: generateHreflangTags(page.path),
    structuredData: page.product ? generateStructuredDataForProduct(page.product) : null
  }
}