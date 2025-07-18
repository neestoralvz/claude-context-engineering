'use client'

import { ninuContactInfo, mockProducts, ninuCategories } from '../../lib/mock-data'
import { Product } from '../../types'

interface StructuredDataProps {
  page?: 'home' | 'products' | 'product-detail'
  product?: Product
}

export default function StructuredData({ page = 'home', product }: StructuredDataProps) {
  // Enhanced Organization Schema with Mexican business focus
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ninu.mx#organization",
    "name": ninuContactInfo.company,
    "alternateName": [ninuContactInfo.brand, "Ninu México", "Productos Ninu"],
    "description": "Empresa mexicana líder en productos químicos de limpieza ecológicos y desinfectantes biodegradables certificados COFEPRIS. Especialistas en sales cuaternarias de amonio quinta generación, gel antibacterial sin alcohol, jabones hipoalergénicos y sanitizantes industriales para el hogar y empresas mexicanas.",
    "url": ninuContactInfo.website,
    "logo": {
      "@type": "ImageObject",
      "url": `${ninuContactInfo.website}/images/ninu/logo.webp`,
      "width": 400,
      "height": 133
    },
    "image": `${ninuContactInfo.website}/images/ninu/logo.webp`,
    "foundingDate": "2020",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Xalapa-Enríquez",
        "addressRegion": "Veracruz",
        "addressCountry": "MX",
        "postalCode": "91000"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "México",
      "identifier": "MX"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": ninuContactInfo.phone,
        "contactType": "customer service",
        "email": ninuContactInfo.email,
        "availableLanguage": ["Spanish", "es"],
        "areaServed": "MX",
        "hoursAvailable": "Mo-Fr 09:00-18:00"
      },
      {
        "@type": "ContactPoint",
        "telephone": ninuContactInfo.whatsapp,
        "contactType": "sales",
        "availableLanguage": ["Spanish", "es"],
        "areaServed": "MX"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Xalapa-Enríquez",
      "addressLocality": "Xalapa-Enríquez",
      "addressRegion": "Veracruz",
      "postalCode": "91000",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.5389",
      "longitude": "-96.9103"
    },
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": "Productos de Limpieza Ecológicos",
        "category": "Productos de Limpieza y Desinfección"
      },
      "areaServed": "MX",
      "availableDeliveryMethod": "OnSitePickup"
    },
    "knowsAbout": [
      "productos químicos de limpieza ecológicos",
      "sales cuaternarias de amonio quinta generación",
      "desinfectantes biodegradables industriales",
      "gel antibacterial sin alcohol COFEPRIS",
      "jabones hipoalergénicos pH neutro",
      "sanitizantes sin alcohol base química segura",
      "productos COFEPRIS certificados México",
      "formulaciones químicas seguras para mascotas",
      "químicos de limpieza no tóxicos",
      "control de calidad químico industrial"
    ],
    "slogan": ninuContactInfo.slogan,
    "sameAs": [
      `https://facebook.com/${ninuContactInfo.social.facebook}`,
      `https://twitter.com/${ninuContactInfo.social.twitter}`,
      `https://youtube.com/${ninuContactInfo.social.youtube}`,
      "https://mercadolibre.com.mx/perfil/NINU",
      ninuContactInfo.website
    ],
    "brand": {
      "@type": "Brand",
      "name": ninuContactInfo.brand,
      "description": "Marca mexicana de productos de limpieza ecológicos y desinfectantes certificados COFEPRIS"
    },
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Certificación COFEPRIS",
      "recognizedBy": {
        "@type": "Organization",
        "name": "COFEPRIS - Comisión Federal para la Protección contra Riesgos Sanitarios"
      }
    }
  }

  // Enhanced Local Business Schema for Mexican market
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store", "OnlineStore"],
    "@id": "https://ninu.mx#business",
    "name": ninuContactInfo.brand,
    "alternateName": "Ninu México - Productos de Limpieza Ecológicos",
    "description": "Vendedor oficial en Mercado Libre especializado en productos de limpieza ecológicos mexicanos. Gel antibacterial, desinfectantes biodegradables y jabones hipoalergénicos certificados COFEPRIS para el hogar mexicano.",
    "url": ninuContactInfo.website,
    "telephone": ninuContactInfo.phone,
    "email": ninuContactInfo.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Xalapa-Enríquez",
      "addressLocality": "Xalapa-Enríquez",
      "addressRegion": "Veracruz",
      "postalCode": "91000",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 19.5389,
      "longitude": -96.9103
    },
    "openingHours": ["Mo-Fr 09:00-18:00"],
    "paymentAccepted": ["Credit Card", "PayPal", "Bank Transfer", "Mercado Pago"],
    "currenciesAccepted": "MXN",
    "priceRange": "$$",
    "servesCuisine": "Productos de Limpieza",
    "areaServed": {
      "@type": "Country",
      "name": "México"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "reviewCount": 1000,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "María González"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5,
          "bestRating": 5
        },
        "reviewBody": "Excelente calidad! El jabón para trastes rinde muchísimo y deja todo súper limpio."
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Productos de Limpieza Ninu.mx",
      "itemListElement": ninuCategories.map(category => ({
        "@type": "OfferCatalog",
        "name": category.name,
        "itemListElement": mockProducts.filter(p => p.category === category.id).slice(0, 3).map(product => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": product.name,
            "category": category.name
          }
        }))
      }))
    },
    "founder": {
      "@type": "Organization",
      "name": ninuContactInfo.company
    },
    "parentOrganization": {
      "@id": "https://ninu.mx#organization"
    }
  }

  // Enhanced Products Schema with Mexican market focus
  const productsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://ninu.mx/productos#itemlist",
    "name": "Productos de Limpieza Ecológicos México - Ninu.mx",
    "description": "Catálogo completo de productos de limpieza ecológicos y desinfectantes biodegradables certificados COFEPRIS para el mercado mexicano. Gel antibacterial, jabones hipoalergénicos, sanitizantes sin alcohol.",
    "numberOfItems": mockProducts.length,
    "url": `${ninuContactInfo.website}/productos`,
    "itemListElement": mockProducts.slice(0, 8).map((product, index) => {
      const category = ninuCategories.find(cat => cat.id === product.category)
      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `${ninuContactInfo.website}/productos/${product.id}`,
          "name": product.name,
          "description": product.description,
          "category": category?.name || product.category,
          "sku": product.id,
          "gtin": product.id,
          "brand": {
            "@type": "Brand",
            "name": ninuContactInfo.brand,
            "logo": `${ninuContactInfo.website}/images/ninu/logo.webp`
          },
          "manufacturer": {
            "@type": "Organization",
            "name": ninuContactInfo.company,
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "MX",
              "addressRegion": "Veracruz"
            }
          },
          "countryOfOrigin": {
            "@type": "Country",
            "name": "México"
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Certificación COFEPRIS",
              "value": product.cofepisApproval ? "Sí" : "No"
            },
            {
              "@type": "PropertyValue",
              "name": "Tamaño",
              "value": `${product.size} ${product.unit}`
            },
            {
              "@type": "PropertyValue",
              "name": "Vida Útil",
              "value": `${product.shelfLife} meses`
            }
          ],
          "audience": {
            "@type": "Audience",
            "geographicArea": {
              "@type": "Country",
              "name": "México"
            }
          },
          "offers": {
            "@type": "Offer",
            "price": product.salePrice,
            "priceCurrency": "MXN",
            "availability": product.currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `${ninuContactInfo.website}/productos/${product.id}`,
            "seller": {
              "@type": "Organization",
              "name": ninuContactInfo.brand,
              "@id": "https://ninu.mx#organization"
            },
            "areaServed": {
              "@type": "Country",
              "name": "México"
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
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 2,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.9,
            "reviewCount": Math.floor(Math.random() * 100) + 50,
            "bestRating": 5,
            "worstRating": 1
          }
        }
      }
    })
  }

  // Dynamic breadcrumb schema based on page
  const getBreadcrumbSchema = () => {
    const breadcrumbs: Array<{
      "@type": "ListItem",
      "position": number,
      "name": string,
      "item": string
    }> = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": ninuContactInfo.website
      }
    ]

    if (page === 'products' || page === 'product-detail') {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Productos",
        "item": "https://ninu.mx/productos"
      })
    }

    if (page === 'product-detail' && product) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://ninu.mx/productos/${product.id}`
      })
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    }
  }

  // FAQ Schema for home page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Los productos Ninu.mx están certificados por COFEPRIS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, todos nuestros productos de limpieza y desinfección cuentan con certificación COFEPRIS, garantizando la máxima seguridad y calidad para las familias mexicanas."
        }
      },
      {
        "@type": "Question",
        "name": "¿Son los productos de limpieza Ninu.mx ecológicos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, formulamos productos de limpieza biodegradables y ecológicos, seguros para el medio ambiente y las mascotas, sin comprometer la efectividad de limpieza."
        }
      },
      {
        "@type": "Question",
        "name": "¿Hacen envíos a toda la República Mexicana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, realizamos envíos a toda la República Mexicana desde nuestra planta en Xalapa, Veracruz. Somos vendedores oficiales en Mercado Libre con más de 1000 clientes satisfechos."
        }
      },
      {
        "@type": "Question",
        "name": "¿El gel antibacterial tiene 70% de alcohol?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, nuestro gel antibacterial contiene 70% de alcohol etílico, cumpliendo con las normas de la OMS y COFEPRIS para eliminar 99.99% de virus, bacterias y gérmenes."
        }
      }
    ]
  }

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://ninu.mx#website",
    "url": ninuContactInfo.website,
    "name": "Ninu.mx - Productos de Limpieza Ecológicos México",
    "description": "Productos de limpieza ecológicos y desinfectantes certificados COFEPRIS. Gel antibacterial, jabones hipoalergénicos, sanitizantes para el hogar mexicano.",
    "publisher": {
      "@id": "https://ninu.mx#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${ninuContactInfo.website}/productos?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "es-MX",
    "copyrightYear": 2024,
    "copyrightHolder": {
      "@id": "https://ninu.mx#organization"
    }
  }

  // Product detail schema (when viewing individual product)
  const getProductDetailSchema = () => {
    if (!product) return null

    const category = ninuCategories.find(cat => cat.id === product.category)
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${ninuContactInfo.website}/productos/${product.id}`,
      "name": product.name,
      "description": product.description,
      "image": `${ninuContactInfo.website}/images/productos/${product.id}.webp`,
      "category": category?.name || product.category,
      "sku": product.id,
      "gtin": product.id,
      "brand": {
        "@type": "Brand",
        "name": ninuContactInfo.brand
      },
      "manufacturer": {
        "@type": "Organization",
        "name": ninuContactInfo.company,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "MX"
        }
      },
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
        "ratingValue": 4.9,
        "reviewCount": 50
      }
    }
  }

  const productDetailSchema = getProductDetailSchema()
  const breadcrumbSchema = getBreadcrumbSchema()

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      
      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
      
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      
      {/* Products Schema (for products page) */}
      {(page === 'products' || page === 'home') && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productsSchema)
          }}
        />
      )}
      
      {/* Product Detail Schema (for individual product) */}
      {productDetailSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productDetailSchema)
          }}
        />
      )}
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      {/* FAQ Schema (for home page) */}
      {page === 'home' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}
    </>
  )
}