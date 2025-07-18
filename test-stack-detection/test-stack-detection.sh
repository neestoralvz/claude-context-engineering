#!/bin/bash

# Test script for stack detection logic validation
# Based on the logic from initialize-project command

detect_stack() {
    local project_path="$1"
    
    # Check for existing files
    if [ -f "$project_path/package.json" ]; then
        echo "node"
    elif [ -f "$project_path/requirements.txt" ] || [ -f "$project_path/setup.py" ]; then
        echo "python"
    elif [ -f "$project_path/Cargo.toml" ]; then
        echo "rust"
    elif [ -f "$project_path/go.mod" ]; then
        echo "go"
    elif [ -f "$project_path/pom.xml" ] || [ -f "$project_path/build.gradle" ]; then
        echo "java"
    else
        echo "generic"
    fi
}

# Test scenarios
test_dir="/Users/nalve/claude-context-engineering/test-stack-detection"

echo "=== Stack Detection Logic Validation ==="
echo ""

# Test 1: Generic project (no stack files)
echo "Test 1: Generic project"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: generic"
if [ "$result" = "generic" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
echo ""

# Test 2: Node.js project
echo "Test 2: Node.js project"
touch "$test_dir/package.json"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: node"
if [ "$result" = "node" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/package.json"
echo ""

# Test 3: Python project with requirements.txt
echo "Test 3: Python project (requirements.txt)"
touch "$test_dir/requirements.txt"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: python"
if [ "$result" = "python" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/requirements.txt"
echo ""

# Test 4: Python project with setup.py
echo "Test 4: Python project (setup.py)"
touch "$test_dir/setup.py"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: python"
if [ "$result" = "python" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/setup.py"
echo ""

# Test 5: Rust project
echo "Test 5: Rust project"
touch "$test_dir/Cargo.toml"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: rust"
if [ "$result" = "rust" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/Cargo.toml"
echo ""

# Test 6: Go project
echo "Test 6: Go project"
touch "$test_dir/go.mod"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: go"
if [ "$result" = "go" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/go.mod"
echo ""

# Test 7: Java project with pom.xml
echo "Test 7: Java project (pom.xml)"
touch "$test_dir/pom.xml"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: java"
if [ "$result" = "java" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/pom.xml"
echo ""

# Test 8: Java project with build.gradle
echo "Test 8: Java project (build.gradle)"
touch "$test_dir/build.gradle"
result=$(detect_stack "$test_dir")
echo "Result: $result"
echo "Expected: java"
if [ "$result" = "java" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi
rm "$test_dir/build.gradle"
echo ""

echo "=== Stack Detection Tests Complete ==="