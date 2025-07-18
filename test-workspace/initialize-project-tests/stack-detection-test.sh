#!/bin/bash

# Stack Detection Test Script

# Stack detection function
detect_stack() {
    local project_path="$1"
    
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

# Test stack detection
test_stack_detection() {
    echo "🧪 Testing stack detection logic..."
    
    # Test existing node project
    local node_project="/Users/nalve/claude-context-engineering/test-workspace/initialize-project-tests/test-projects/test-node-app"
    if [ -d "$node_project" ]; then
        local detected=$(detect_stack "$node_project")
        echo "Node.js project detected as: $detected"
        if [ "$detected" = "node" ]; then
            echo "✅ Node.js stack detection: PASSED"
        else
            echo "❌ Node.js stack detection: FAILED"
        fi
    fi
    
    # Create temporary test projects
    local temp_dir="/tmp/stack-test-$$"
    mkdir -p "$temp_dir"
    
    # Test Python detection
    mkdir -p "$temp_dir/python-test"
    echo "pytest>=7.0.0" > "$temp_dir/python-test/requirements.txt"
    local python_detected=$(detect_stack "$temp_dir/python-test")
    echo "Python project detected as: $python_detected"
    if [ "$python_detected" = "python" ]; then
        echo "✅ Python stack detection: PASSED"
    else
        echo "❌ Python stack detection: FAILED"
    fi
    
    # Test Rust detection
    mkdir -p "$temp_dir/rust-test"
    echo '[package]' > "$temp_dir/rust-test/Cargo.toml"
    echo 'name = "test"' >> "$temp_dir/rust-test/Cargo.toml"
    local rust_detected=$(detect_stack "$temp_dir/rust-test")
    echo "Rust project detected as: $rust_detected"
    if [ "$rust_detected" = "rust" ]; then
        echo "✅ Rust stack detection: PASSED"
    else
        echo "❌ Rust stack detection: FAILED"
    fi
    
    # Test generic detection
    mkdir -p "$temp_dir/generic-test"
    echo "# Generic project" > "$temp_dir/generic-test/README.md"
    local generic_detected=$(detect_stack "$temp_dir/generic-test")
    echo "Generic project detected as: $generic_detected"
    if [ "$generic_detected" = "generic" ]; then
        echo "✅ Generic stack detection: PASSED"
    else
        echo "❌ Generic stack detection: FAILED"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    
    echo "🏁 Stack detection tests completed"
}

# Run tests
test_stack_detection