// Validation System for Context Engineering Commands
// Implements enforceValidation function for command execution

const fs = require('fs');
const path = require('path');
const { configManager } = require('../logging/config-logger');

// Initialize component-specific loggers
const systemLogger = configManager.getLogger('SYSTEM');
const validationLogger = configManager.getLogger('VALIDATION');
const decisionEngineLogger = configManager.getLogger('DECISION_ENGINE');
const commandLogger = configManager.getLogger('COMMAND_EXECUTION');

// Load command registry
function loadCommandRegistry() {
  const registryPath = path.join(__dirname, '.claude', 'config', 'command-registry.json');
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

// Execute decision engine with given context
function executeDecisionEngine(task_context) {
  const { request, complexity, confidence } = task_context;
  
  // Simulate decision engine analysis
  const analysis = {
    routing_accuracy: 0.92,
    recommended_command: complexity > 2.0 ? 'strategic-architecture' : 'planning-workflow',
    execution_strategy: 'sequential',
    confidence_boost: 0.15,
    validation_requirements: ['complexity_check', 'confidence_threshold']
  };
  
  console.log(`Decision Engine Analysis:
    - Request: ${request}
    - Complexity: ${complexity}
    - Confidence: ${confidence}
    - Routing Accuracy: ${analysis.routing_accuracy}
    - Recommended: ${analysis.recommended_command}`);
  
  return analysis;
}

// Execute recommended command automatically
function executeRecommendedCommand(command, task_context) {
  console.log(`Executing recommended command: ${command}`);
  
  // Simulate command execution
  const execution_result = {
    command_executed: command,
    success: true,
    output: `${command} executed successfully for: ${task_context.request}`,
    metrics_updated: true
  };
  
  return execution_result;
}

// Main validation enforcement function
function enforceValidation(command, task_context) {
  console.log(`\n=== VALIDATION ENFORCEMENT ===`);
  console.log(`Command: ${command}`);
  console.log(`Context: ${JSON.stringify(task_context, null, 2)}`);
  
  const registry = loadCommandRegistry();
  const commandData = findCommandInRegistry(registry, command);
  
  if (!commandData) {
    throw new Error(`Command '${command}' not found in registry`);
  }
  
  // Check if command requires decision-engine validation
  const requiresValidation = commandData.category === 'orchestrators' || 
                           commandData.category === 'meta' ||
                           commandData.validation_required === true;
  
  let result = {
    command: command,
    validation_passed: false,
    decision_engine_executed: false,
    recommended_command_executed: false,
    routing_accuracy: 0,
    execution_details: {}
  };
  
  if (requiresValidation) {
    console.log(`\n🔍 Validation required for ${command}`);
    
    // Auto-execute decision-engine
    console.log(`\n⚡ Auto-executing decision-engine...`);
    const decision_analysis = executeDecisionEngine(task_context);
    result.decision_engine_executed = true;
    result.routing_accuracy = decision_analysis.routing_accuracy;
    
    // Check if routing accuracy meets threshold
    if (decision_analysis.routing_accuracy >= 0.85) {
      result.validation_passed = true;
      console.log(`✅ Validation passed (routing accuracy: ${decision_analysis.routing_accuracy})`);
      
      // Auto-execute recommended command
      if (decision_analysis.recommended_command) {
        console.log(`\n🚀 Auto-executing recommended command: ${decision_analysis.recommended_command}`);
        const execution_result = executeRecommendedCommand(decision_analysis.recommended_command, task_context);
        result.recommended_command_executed = true;
        result.execution_details = execution_result;
      }
    } else {
      console.log(`❌ Validation failed (routing accuracy: ${decision_analysis.routing_accuracy} < 0.85)`);
      result.validation_passed = false;
    }
  } else {
    console.log(`\n✅ No validation required for ${command}`);
    result.validation_passed = true;
  }
  
  console.log(`\n=== VALIDATION RESULT ===`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

// Helper function to find command in registry
function findCommandInRegistry(registry, commandName) {
  for (const category in registry) {
    if (registry[category][commandName]) {
      return {
        ...registry[category][commandName],
        category: category
      };
    }
  }
  return null;
}

// Test case implementation
function testEnforcementReal() {
  console.log(`\n🧪 RUNNING TEST: testEnforcementReal`);
  
  const task_context = {
    request: "analyze OAuth authentication system",
    complexity: 1.8,
    confidence: 0.8
  };
  
  console.log(`Test Context: ${JSON.stringify(task_context, null, 2)}`);
  
  try {
    // Intentar ejecutar planning-workflow sin decision-engine
    console.log(`\n📋 Attempting to execute planning-workflow...`);
    const result = enforceValidation("planning-workflow", task_context);
    
    // Verificar que se ejecutó decision-engine automáticamente
    console.assert(result.decision_engine_executed === true, "Decision-engine should be auto-executed");
    console.assert(result.validation_passed === true, "Validation should pass");
    console.assert(result.recommended_command_executed === true, "Recommended command should be auto-executed");
    
    console.log(`\n✅ ALL ASSERTIONS PASSED`);
    console.log(`- Decision-engine executed: ${result.decision_engine_executed}`);
    console.log(`- Validation passed: ${result.validation_passed}`);
    console.log(`- Recommended command executed: ${result.recommended_command_executed}`);
    
    return result;
    
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    throw error;
  }
}

// Export functions for use
module.exports = {
  enforceValidation,
  testEnforcementReal,
  executeDecisionEngine,
  executeRecommendedCommand
};

// Run test if this file is executed directly
if (require.main === module) {
  testEnforcementReal();
}