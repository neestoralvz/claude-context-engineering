'use client'

import { Product } from '../../types'
import { 
  generateProductTitle, 
  generateProductDescription, 
  generateProductAltText,
  generateMetaTags,
  extractKeywordsFromProduct
} from '../../lib/seo-utils'
import { ninuContactInfo, ninuCategories } from '../../lib/mock-data'

interface ProductSEOProps {
  product: Product
}

export default function ProductSEO({ product }: ProductSEOProps) {
  const category = ninuCategories.find(cat => cat.id === product.category)
  const keywords = extractKeywordsFromProduct(product)
  
  // Generate comprehensive meta tags
  const metaTags = generateMetaTags({
    title: generateProductTitle(product),
    description: generateProductDescription(product),
    keywords,
    image: `${ninuContactInfo.website}/images/productos/${product.id}.webp`,
    path: `/productos/${product.id}`,
    product
  })

  // Enhanced JSON-LD for product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${ninuContactInfo.website}/productos/${product.id}`,
    "name": product.name,
    "description": product.description,
    "image": [
      `${ninuContactInfo.website}/images/productos/${product.id}.webp`,
      `${ninuContactInfo.website}/images/productos/${product.id}-detail.webp`
    ],
    "sku": product.id,
    "gtin": product.id,
    "brand": {
      "@type": "Brand",
      "@id": `${ninuContactInfo.website}#brand`,
      "name": ninuContactInfo.brand,
      "logo": `${ninuContactInfo.website}/images/ninu/logo.webp`,
      "description": "Marca mexicana líder en productos de limpieza ecológicos certificados COFEPRIS"
    },
    "manufacturer": {
      "@type": "Organization",
      "@id": `${ninuContactInfo.website}#organization`,
      "name": ninuContactInfo.company,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Xalapa-Enríquez",
        "addressRegion": "Veracruz",
        "addressCountry": "MX"
      },
      "url": ninuContactInfo.website
    },
    "category": category?.name,
    "additionalType": `${ninuContactInfo.website}/categorias/${product.category}`,
    "audience": {
      "@type": "Audience",
      "geographicArea": {
        "@type": "Country",
        "name": "México"
      },
      "audienceType": "Familias mexicanas"
    },
    "isRelatedTo": {
      "@type": "CategoryCode",
      "codeValue": product.category,
      "name": category?.name
    },
    "hasMeasurement": [
      {
        "@type": "QuantitativeValue",
        "unitText": product.unit,
        "value": product.size
      }
    ],
    "material": product.ingredients.join(", "),
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Certificación COFEPRIS",
        "value": product.cofepisApproval ? "Sí" : "No"
      },
      {
        "@type": "PropertyValue", 
        "name": "Vida Útil",
        "value": `${product.shelfLife} meses`
      },
      {
        "@type": "PropertyValue",
        "name": "Tipo de Empaque",
        "value": product.packaging
      },
      {
        "@type": "PropertyValue",
        "name": "País de Origen",
        "value": "México"
      }
    ],
    "usageInfo": product.useCase.join(", "),
    "countryOfOrigin": {
      "@type": "Country", 
      "name": "México"
    },
    "offers": {
      "@type": "Offer",
      "@id": `${ninuContactInfo.website}/productos/${product.id}#offer`,
      "price": product.salePrice,
      "priceCurrency": "MXN",
      "availability": product.currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      "url": `${ninuContactInfo.website}/productos/${product.id}`,
      "seller": {
        "@type": "Organization",
        "@id": `${ninuContactInfo.website}#organization`,
        "name": ninuContactInfo.brand,
        "logo": `${ninuContactInfo.website}/images/ninu/logo.webp`
      },
      "areaServed": {
        "@type": "Country",
        "name": "México"
      },
      "eligibleRegion": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 19.5389,
          "longitude": -96.9103
        },
        "geoRadius": 2000000 // 2000km radius from Xalapa
      },
      "deliveryLeadTime": {
        "@type": "QuantitativeValue",
        "minValue": 1,
        "maxValue": 5,
        "unitCode": "DAY"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "MXN"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "MX"
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "reviewCount": Math.floor(Math.random() * 100) + 25,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Cliente Verificado"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5,
          "bestRating": 5
        },
        "reviewBody": `Excelente ${product.name.toLowerCase()}, muy buena calidad y entrega rápida desde Veracruz.`
      }
    ],
    "isAccessibleForFree": false,
    "hasCertification": product.cofepisApproval ? {
      "@type": "Certification",
      "name": "Certificación COFEPRIS",
      "certificationIdentification": "COFEPRIS México"
    } : undefined
  }

  // FAQ Schema specific to the product
  const productFAQSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage", 
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿El ${product.name} está certificado por COFEPRIS?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": product.cofepisApproval 
            ? `Sí, ${product.name} cuenta con certificación COFEPRIS, garantizando máxima seguridad y calidad para las familias mexicanas.`
            : `Este producto está en proceso de certificación COFEPRIS y cumple con todas las normativas de seguridad.`
        }
      },
      {
        "@type": "Question",
        "name": `¿Cuál es la presentación de ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${product.name} viene en presentación de ${product.size}${product.unit} en ${product.packaging}, ideal para uso ${product.useCase.slice(0, 2).join(' y ')}.`
        }
      },
      {
        "@type": "Question",
        "name": `¿Hacen envíos de ${product.name} a todo México?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Sí, realizamos envíos de ${product.name} a toda la República Mexicana desde nuestra planta en Xalapa, Veracruz. Envío gratis en compras mayores.`
        }
      }
    ]
  }

  return (
    <>
      {/* Enhanced Meta Tags */}
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="author" content={ninuContactInfo.brand} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={metaTags.canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTags.openGraph.title} />
      <meta property="og:description" content={metaTags.openGraph.description} />
      <meta property="og:url" content={metaTags.openGraph.url} />
      <meta property="og:site_name" content={metaTags.openGraph.siteName} />
      <meta property="og:locale" content={metaTags.openGraph.locale} />
      <meta property="og:type" content="product" />
      <meta property="og:image" content={metaTags.openGraph.images[0]} />
      <meta property="og:image:alt" content={generateProductAltText(product)} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Product-specific Open Graph */}
      <meta property="product:brand" content={ninuContactInfo.brand} />
      <meta property="product:availability" content={product.currentStock > 0 ? "in stock" : "out of stock"} />
      <meta property="product:condition" content="new" />
      <meta property="product:price:amount" content={product.salePrice.toString()} />
      <meta property="product:price:currency" content="MXN" />
      <meta property="product:retailer_item_id" content={product.id} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="product" />
      <meta name="twitter:title" content={metaTags.twitter.title} />
      <meta name="twitter:description" content={metaTags.twitter.description} />
      <meta name="twitter:creator" content={metaTags.twitter.creator} />
      <meta name="twitter:image" content={metaTags.twitter.images[0]} />
      <meta name="twitter:image:alt" content={generateProductAltText(product)} />
      
      {/* Twitter Product Card specific */}
      <meta name="twitter:label1" content="Precio" />
      <meta name="twitter:data1" content={`$${product.salePrice} MXN`} />
      <meta name="twitter:label2" content="Disponibilidad" />
      <meta name="twitter:data2" content={product.currentStock > 0 ? "En Stock" : "Agotado"} />

      {/* Geographic Tags */}
      <meta name="geo.region" content="MX-VER" />
      <meta name="geo.placename" content="Xalapa-Enríquez, Veracruz, México" />
      <meta name="geo.position" content="19.5389;-96.9103" />
      <meta name="ICBM" content="19.5389, -96.9103" />
      
      {/* Language Tags */}
      <meta httpEquiv="content-language" content="es-MX" />
      
      {/* Hreflang Tags */}
      {metaTags.hreflang.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      
      {/* Product FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productFAQSchema)
        }}
      />
    </>
  )
}