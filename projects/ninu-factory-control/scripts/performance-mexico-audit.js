#!/usr/bin/env node

/**
 * Performance Audit Script for Mexican Infrastructure
 * Optimized for typical Mexican internet speeds and device capabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mexican connection profiles for testing
const MEXICAN_CONNECTION_PROFILES = {
  urban: {
    name: 'Urban Mexico (CDMx, GDL, MTY)',
    downloadSpeed: 25000, // 25 Mbps
    uploadSpeed: 5000,    // 5 Mbps
    latency: 35,          // 35ms
    packetLoss: 0.5,      // 0.5%
  },
  semiUrban: {
    name: 'Semi-Urban Mexico',
    downloadSpeed: 15000, // 15 Mbps
    uploadSpeed: 3000,    // 3 Mbps
    latency: 60,          // 60ms
    packetLoss: 1.0,      // 1%
  },
  rural: {
    name: 'Rural Mexico',
    downloadSpeed: 5000,  // 5 Mbps
    uploadSpeed: 1000,    // 1 Mbps
    latency: 120,         // 120ms
    packetLoss: 2.0,      // 2%
  },
  mobile3G: {
    name: 'Mobile 3G (CFE/Telcel)',
    downloadSpeed: 2000,  // 2 Mbps
    uploadSpeed: 500,     // 500 Kbps
    latency: 200,         // 200ms
    packetLoss: 3.0,      // 3%
  },
  mobile4G: {
    name: 'Mobile 4G (Movistar/AT&T)',
    downloadSpeed: 10000, // 10 Mbps
    uploadSpeed: 2000,    // 2 Mbps
    latency: 80,          // 80ms
    packetLoss: 1.5,      // 1.5%
  }
};

// Core Web Vitals thresholds for Mexican market
const MEXICAN_THRESHOLDS = {
  fcp: { good: 2500, poor: 4000 },      // First Contentful Paint
  lcp: { good: 3500, poor: 6000 },      // Largest Contentful Paint
  fid: { good: 150, poor: 300 },        // First Input Delay
  cls: { good: 0.15, poor: 0.25 },      // Cumulative Layout Shift
  ttfb: { good: 1000, poor: 2000 },     // Time to First Byte
  si: { good: 4000, poor: 7000 },       // Speed Index
};

// Target pages for audit
const AUDIT_PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/dashboard', name: 'Dashboard' },
  { url: '/productos', name: 'Products' },
  { url: '/inventarios', name: 'Inventory' },
];

class MexicoPerformanceAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      profiles: {},
      summary: {},
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🇲🇽 Iniciando auditoría de rendimiento para México');
    console.log('📊 Perfiles de conexión a evaluar:', Object.keys(MEXICAN_CONNECTION_PROFILES).length);
    
    try {
      // Check if Lighthouse is available
      this.checkLighthouseAvailable();
      
      // Run audits for each connection profile
      for (const [profileKey, profile] of Object.entries(MEXICAN_CONNECTION_PROFILES)) {
        console.log(`\n📡 Evaluando perfil: ${profile.name}`);
        await this.auditConnectionProfile(profileKey, profile);
      }
      
      // Generate summary and recommendations
      this.generateSummary();
      this.generateRecommendations();
      
      // Save results
      await this.saveResults();
      
      console.log('\n✅ Auditoría completada');
      console.log(`📄 Reporte guardado en: performance-mexico-audit-${Date.now()}.json`);
      
    } catch (error) {
      console.error('❌ Error en auditoría:', error.message);
      process.exit(1);
    }
  }

  checkLighthouseAvailable() {
    try {
      execSync('lighthouse --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Lighthouse no está instalado. Instalar con: npm install -g lighthouse');
    }
  }

  async auditConnectionProfile(profileKey, profile) {
    this.results.profiles[profileKey] = {
      profile,
      pages: {},
      summary: {}
    };

    for (const page of AUDIT_PAGES) {
      console.log(`  📄 Auditando: ${page.name}`);
      
      try {
        const metrics = await this.runLighthouseAudit(page.url, profile);
        this.results.profiles[profileKey].pages[page.url] = {
          name: page.name,
          metrics,
          score: this.calculateMexicanScore(metrics),
          warnings: this.generateWarnings(metrics, profile)
        };
        
      } catch (error) {
        console.log(`    ⚠️  Error en ${page.name}: ${error.message}`);
        this.results.profiles[profileKey].pages[page.url] = {
          name: page.name,
          error: error.message
        };
      }
    }
    
    this.calculateProfileSummary(profileKey);
  }

  async runLighthouseAudit(url, profile) {
    const fullUrl = `http://localhost:3000${url}`;
    
    // Lighthouse command with throttling for Mexican connections
    const command = `lighthouse "${fullUrl}" \
      --throttling-method=devtools \
      --throttling.downloadThroughputKbps=${profile.downloadSpeed} \
      --throttling.uploadThroughputKbps=${profile.uploadSpeed} \
      --throttling.rttMs=${profile.latency} \
      --emulated-form-factor=mobile \
      --output=json \
      --quiet \
      --chrome-flags="--headless --no-sandbox"`;

    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: 60000, // 60 second timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      const lighthouseResult = JSON.parse(output);
      
      return {
        fcp: lighthouseResult.audits['first-contentful-paint'].numericValue,
        lcp: lighthouseResult.audits['largest-contentful-paint'].numericValue,
        fid: lighthouseResult.audits['max-potential-fid'].numericValue,
        cls: lighthouseResult.audits['cumulative-layout-shift'].numericValue,
        ttfb: lighthouseResult.audits['server-response-time'].numericValue,
        si: lighthouseResult.audits['speed-index'].numericValue,
        performanceScore: lighthouseResult.categories.performance.score * 100,
        totalByteWeight: lighthouseResult.audits['total-byte-weight'].numericValue,
        unusedJavascript: lighthouseResult.audits['unused-javascript']?.details?.overallSavingsBytes || 0,
        unusedCss: lighthouseResult.audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
        imageOptimization: lighthouseResult.audits['uses-optimized-images']?.details?.overallSavingsBytes || 0
      };
      
    } catch (error) {
      throw new Error(`Lighthouse audit failed: ${error.message}`);
    }
  }

  calculateMexicanScore(metrics) {
    let score = 0;
    let weight = 0;

    // Calculate weighted score based on Mexican priorities
    const weights = {
      lcp: 0.25,  // Critical for slow connections
      fcp: 0.20,  // Important for perceived performance
      cls: 0.15,  // UX critical
      fid: 0.15,  // Interactivity
      ttfb: 0.15, // Server response
      si: 0.10    // Overall loading
    };

    for (const [metric, metricWeight] of Object.entries(weights)) {
      const value = metrics[metric];
      const thresholds = MEXICAN_THRESHOLDS[metric];
      
      let metricScore = 0;
      if (value <= thresholds.good) {
        metricScore = 100;
      } else if (value <= thresholds.poor) {
        // Linear interpolation between good and poor
        const range = thresholds.poor - thresholds.good;
        const position = value - thresholds.good;
        metricScore = 50 * (1 - position / range);
      } else {
        metricScore = 0;
      }
      
      score += metricScore * metricWeight;
      weight += metricWeight;
    }

    return Math.round(score / weight);
  }

  generateWarnings(metrics, profile) {
    const warnings = [];

    // Check critical metrics for Mexican connections
    if (metrics.lcp > MEXICAN_THRESHOLDS.lcp.poor) {
      warnings.push({
        type: 'critical',
        metric: 'LCP',
        message: `LCP ${metrics.lcp}ms excede límite para ${profile.name}`,
        impact: 'Usuarios pueden abandonar la página'
      });
    }

    if (metrics.fcp > MEXICAN_THRESHOLDS.fcp.poor) {
      warnings.push({
        type: 'warning',
        metric: 'FCP',
        message: `FCP ${metrics.fcp}ms lento para conexiones mexicanas`,
        impact: 'Percepción de lentitud'
      });
    }

    if (metrics.totalByteWeight > 2000000) { // 2MB
      warnings.push({
        type: 'warning',
        metric: 'Bundle Size',
        message: `Tamaño total ${(metrics.totalByteWeight/1024/1024).toFixed(1)}MB muy grande`,
        impact: 'Consumo excesivo de datos móviles'
      });
    }

    if (metrics.unusedJavascript > 500000) { // 500KB
      warnings.push({
        type: 'optimization',
        metric: 'Unused JS',
        message: `${(metrics.unusedJavascript/1024).toFixed(0)}KB JavaScript no utilizado`,
        impact: 'Oportunidad de optimización'
      });
    }

    return warnings;
  }

  calculateProfileSummary(profileKey) {
    const profile = this.results.profiles[profileKey];
    const pages = Object.values(profile.pages);
    
    // Calculate averages
    const validPages = pages.filter(p => !p.error);
    if (validPages.length === 0) return;

    const avgScore = validPages.reduce((sum, p) => sum + p.score, 0) / validPages.length;
    const totalWarnings = validPages.reduce((sum, p) => sum + p.warnings.length, 0);
    const criticalWarnings = validPages.reduce((sum, p) => 
      sum + p.warnings.filter(w => w.type === 'critical').length, 0);

    profile.summary = {
      averageScore: Math.round(avgScore),
      totalWarnings,
      criticalWarnings,
      recommendation: this.getProfileRecommendation(avgScore, criticalWarnings)
    };
  }

  getProfileRecommendation(avgScore, criticalWarnings) {
    if (criticalWarnings > 0) {
      return 'CRITICO - Requiere optimización inmediata';
    } else if (avgScore < 50) {
      return 'BAJO - Necesita mejoras significativas';
    } else if (avgScore < 75) {
      return 'REGULAR - Optimizaciones recomendadas';
    } else if (avgScore < 90) {
      return 'BUENO - Optimizaciones menores';
    } else {
      return 'EXCELENTE - Optimizado para México';
    }
  }

  generateSummary() {
    const profiles = Object.values(this.results.profiles);
    const validProfiles = profiles.filter(p => p.summary.averageScore);

    if (validProfiles.length === 0) {
      this.results.summary = { error: 'No se pudieron completar las auditorías' };
      return;
    }

    const overallScore = validProfiles.reduce((sum, p) => sum + p.summary.averageScore, 0) / validProfiles.length;
    const totalCritical = validProfiles.reduce((sum, p) => sum + p.summary.criticalWarnings, 0);
    const totalWarnings = validProfiles.reduce((sum, p) => sum + p.summary.totalWarnings, 0);

    // Find worst performing profile
    const worstProfile = validProfiles.reduce((worst, current) => 
      current.summary.averageScore < worst.summary.averageScore ? current : worst);

    this.results.summary = {
      overallScore: Math.round(overallScore),
      totalCriticalIssues: totalCritical,
      totalWarnings,
      worstPerformingConnection: worstProfile.profile.name,
      readyForMexicanMarket: totalCritical === 0 && overallScore >= 75
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle size optimization
    recommendations.push({
      priority: 'high',
      category: 'Bundle Optimization',
      title: 'Implementar code splitting por rutas',
      description: 'Dividir código por páginas para cargas más rápidas',
      implementation: 'dynamic imports en componentes pesados',
      impact: 'Reducción 30-50% tiempo inicial de carga'
    });

    // Image optimization
    recommendations.push({
      priority: 'high',
      category: 'Image Optimization', 
      title: 'Optimizar imágenes para México',
      description: 'WebP/AVIF con fallbacks, lazy loading',
      implementation: 'Next.js Image component + CDN mexicano',
      impact: 'Reducción 40-60% transferencia de datos'
    });

    // Caching strategy
    recommendations.push({
      priority: 'medium',
      category: 'Caching Strategy',
      title: 'Mejorar estrategia de caché',
      description: 'Service Worker optimizado para conexiones lentas',
      implementation: 'Cache-first para assets, network-first para API',
      impact: 'Mejora significativa en visitas recurrentes'
    });

    // Mexican CDN
    recommendations.push({
      priority: 'medium',
      category: 'Infrastructure',
      title: 'CDN con presencia en México',
      description: 'Usar CDN con POPs en México',
      implementation: 'Cloudflare/AWS CloudFront con edge en México',
      impact: 'Reducción 20-40% latencia'
    });

    // Progressive loading
    recommendations.push({
      priority: 'low',
      category: 'UX Enhancement',
      title: 'Loading progressivo',
      description: 'Skeleton screens y progressive enhancement',
      implementation: 'Suspense boundaries + loading states',
      impact: 'Mejor percepción de velocidad'
    });

    this.results.recommendations = recommendations;
  }

  async saveResults() {
    const timestamp = Date.now();
    const filename = `performance-mexico-audit-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'scripts', filename);

    // Create human-readable report
    const reportContent = this.generateHumanReport();
    const reportFilename = `performance-mexico-report-${timestamp}.md`;
    const reportFilepath = path.join(process.cwd(), 'scripts', reportFilename);

    try {
      // Save JSON results
      fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
      
      // Save markdown report
      fs.writeFileSync(reportFilepath, reportContent);
      
      console.log(`📊 Reporte JSON: ${filename}`);
      console.log(`📄 Reporte MD: ${reportFilename}`);
      
    } catch (error) {
      console.error('Error guardando resultados:', error.message);
    }
  }

  generateHumanReport() {
    const { summary, profiles, recommendations } = this.results;
    
    let report = `# 🇲🇽 Reporte de Rendimiento para México\n\n`;
    report += `**Fecha:** ${new Date(this.results.timestamp).toLocaleString('es-MX')}\n\n`;
    
    // Summary
    report += `## 📊 Resumen Ejecutivo\n\n`;
    report += `- **Puntuación General:** ${summary.overallScore}/100\n`;
    report += `- **Problemas Críticos:** ${summary.totalCriticalIssues}\n`;
    report += `- **Advertencias Totales:** ${summary.totalWarnings}\n`;
    report += `- **Conexión Más Problemática:** ${summary.worstPerformingConnection}\n`;
    report += `- **Listo para Mercado Mexicano:** ${summary.readyForMexicanMarket ? '✅ SÍ' : '❌ NO'}\n\n`;

    // Profile results
    report += `## 📡 Resultados por Tipo de Conexión\n\n`;
    for (const [key, profile] of Object.entries(profiles)) {
      report += `### ${profile.profile.name}\n`;
      report += `- **Velocidad:** ${profile.profile.downloadSpeed/1000}Mbps ↓ / ${profile.profile.uploadSpeed/1000}Mbps ↑\n`;
      report += `- **Latencia:** ${profile.profile.latency}ms\n`;
      report += `- **Puntuación Promedio:** ${profile.summary.averageScore}/100\n`;
      report += `- **Estado:** ${profile.summary.recommendation}\n\n`;
    }

    // Recommendations
    report += `## 🚀 Recomendaciones de Optimización\n\n`;
    for (const rec of recommendations) {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      report += `### ${priority} ${rec.title}\n`;
      report += `**Categoría:** ${rec.category}\n\n`;
      report += `**Descripción:** ${rec.description}\n\n`;
      report += `**Implementación:** ${rec.implementation}\n\n`;
      report += `**Impacto Esperado:** ${rec.impact}\n\n`;
    }

    return report;
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new MexicoPerformanceAuditor();
  auditor.runAudit().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = MexicoPerformanceAuditor;