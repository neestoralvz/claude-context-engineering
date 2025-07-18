'use client'

import Head from 'next/head'
import { generateMetaTags, PRIMARY_KEYWORDS } from '../../lib/seo-utils'
import { ninuContactInfo } from '../../lib/mock-data'
import { Product } from '../../types'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  path: string
  product?: Product
  noIndex?: boolean
  canonical?: string
}

export default function SEOHead({
  title,
  description, 
  keywords,
  image,
  path,
  product,
  noIndex = false,
  canonical
}: SEOHeadProps) {
  const defaultTitle = 'Ninu.mx - Productos de Limpieza Ecológicos México | Certificados COFEPRIS'
  const defaultDescription = 'Productos de limpieza ecológicos certificados COFEPRIS. Gel antibacterial, desinfectantes biodegradables, jabones hipoalergénicos para el hogar mexicano.'
  
  const metaTags = generateMetaTags({
    title: title || defaultTitle,
    description: description || defaultDescription,
    keywords: keywords || [...PRIMARY_KEYWORDS],
    image: image || `${ninuContactInfo.website}/images/ninu/logo.webp`,
    path,
    product
  })

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="author" content={ninuContactInfo.brand} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="content-language" content="es-MX" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || metaTags.canonical} />
      
      {/* Favicon and Touch Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/webp" sizes="32x32" href="/images/ninu/logo.webp" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/ninu/logo.webp" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTags.openGraph.title} />
      <meta property="og:description" content={metaTags.openGraph.description} />
      <meta property="og:url" content={metaTags.openGraph.url} />
      <meta property="og:site_name" content={metaTags.openGraph.siteName} />
      <meta property="og:locale" content={metaTags.openGraph.locale} />
      <meta property="og:type" content={product ? 'product' : 'website'} />
      <meta property="og:image" content={metaTags.openGraph.images[0]} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${metaTags.title} - Ninu.mx Productos de Limpieza México`} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={product ? 'product' : 'summary_large_image'} />
      <meta name="twitter:title" content={metaTags.twitter.title} />
      <meta name="twitter:description" content={metaTags.twitter.description} />
      <meta name="twitter:creator" content={metaTags.twitter.creator} />
      <meta name="twitter:image" content={metaTags.twitter.images[0]} />
      <meta name="twitter:image:alt" content={`${metaTags.title} - Ninu.mx`} />
      
      {/* Geographic Meta Tags */}
      <meta name="geo.region" content="MX-VER" />
      <meta name="geo.placename" content="Xalapa-Enríquez, Veracruz, México" />
      <meta name="geo.position" content="19.5389;-96.9103" />
      <meta name="ICBM" content="19.5389, -96.9103" />
      
      {/* Language Alternates */}
      {metaTags.hreflang.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://mercadolibre.com.mx" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://facebook.com" />
      <link rel="dns-prefetch" href="https://twitter.com" />
      <link rel="dns-prefetch" href="https://youtube.com" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Brand and Business Information */}
      <meta name="application-name" content={ninuContactInfo.brand} />
      <meta name="apple-mobile-web-app-title" content={ninuContactInfo.brand} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Business Schema in Meta */}
      <meta name="business:contact_data:street_address" content="Xalapa-Enríquez" />
      <meta name="business:contact_data:locality" content="Xalapa-Enríquez" />
      <meta name="business:contact_data:region" content="Veracruz" />
      <meta name="business:contact_data:postal_code" content="91000" />
      <meta name="business:contact_data:country_name" content="México" />
      <meta name="business:contact_data:email" content={ninuContactInfo.email} />
      <meta name="business:contact_data:phone_number" content={ninuContactInfo.phone} />
      <meta name="business:contact_data:website" content={ninuContactInfo.website} />
      
      {/* Security Headers */}
      <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:;" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Performance Hints */}
      <link rel="preload" href="/images/ninu/logo.webp" as="image" type="image/webp" />
      <link rel="prefetch" href="/productos" />
      <link rel="prefetch" href="/clientes" />
    </Head>
  )
}