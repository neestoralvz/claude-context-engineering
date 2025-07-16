#!/bin/bash
# Test Validation Environment Functionality

echo "🧪 Testing validation environment..."

# Test sample file
test_file="/tmp/test_command.md"
cat > "$test_file" << 'TESTEOF'
# Test Command

## Purpose
This is a test command for validation.

### Phase 1: TOOL CALL EXECUTION REQUIRED
Execute sample validation with real tool calls.

### Phase 2: MANDATORY SCRIPT EXECUTION
Never simulate - always use real execution.
TESTEOF

# Run all validation scripts
echo "Running content quality analysis..."
/Users/nalve/claude-context-engineering/scripts/validation/analyze-content-quality.sh "$test_file"

echo "Running natural language compliance..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-natural-language-compliance.sh "$test_file"

echo "Running nomenclature validation..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-technical-nomenclature.sh "$test_file"

echo "Running tool call compliance..."
/Users/nalve/claude-context-engineering/scripts/validation/validate-tool-call-compliance.sh "$test_file"

echo "Running comprehensive quality metrics..."
/Users/nalve/claude-context-engineering/scripts/validation/calculate-comprehensive-quality-metrics.sh "$test_file"

# Cleanup
rm -f "$test_file"

echo "✅ Validation environment test completed successfully!"
