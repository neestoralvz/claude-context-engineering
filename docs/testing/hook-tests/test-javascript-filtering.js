// Test de Filtrado para Archivos No-Markdown
// Este archivo prueba que el hook muestre notificación informativa para archivos JavaScript

console.log("Testing non-markdown file filtering");

// Resultado esperado:
// 🟨 =============================================
//    DETECCIÓN DE TIPO DE ARCHIVO
//    Archivo: test-javascript-filtering.js (javascript)
//    Optimización de escritura: No aplicable
// ==============================================
// ℹ️  La optimización inteligente está disponible para archivos Markdown (.md)

function testHookFiltering() {
    return "Hook should show informative message, not run optimization";
}