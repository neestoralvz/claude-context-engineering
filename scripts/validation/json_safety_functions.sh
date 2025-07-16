#!/bin/bash
# JSON Safety Functions Library
# Ensures reliable JSON generation from bash variables

# Sanitize numeric value for JSON output
sanitize_numeric() {
    local value="$1"
    local default="${2:-0.0000}"
    
    # Remove newlines and whitespace
    value=$(echo "$value" | tr -d '\n\r' | xargs)
    
    # Check if value is a valid number
    if [[ "$value" =~ ^-?[0-9]+\.?[0-9]*$ ]] || [[ "$value" =~ ^-?\.[0-9]+$ ]]; then
        # Ensure 4 decimal places
        printf "%.4f" "$value"
    else
        echo "$default"
    fi
}

# Sanitize integer value for JSON output
sanitize_integer() {
    local value="$1"
    local default="${2:-0}"
    
    # Remove newlines and whitespace
    value=$(echo "$value" | tr -d '\n\r' | xargs)
    
    # Check if value is a valid integer
    if [[ "$value" =~ ^-?[0-9]+$ ]]; then
        echo "$value"
    else
        echo "$default"
    fi
}

# Safe bc calculation with guaranteed JSON output
safe_bc_calc() {
    local expression="$1"
    local default="${2:-0.0000}"
    
    # Perform calculation and sanitize result
    local result=$(echo "scale=4; $expression" | bc 2>/dev/null || echo "$default")
    sanitize_numeric "$result" "$default"
}

# Generate JSON boolean from comparison
json_boolean() {
    local condition="$1"
    if eval "$condition" 2>/dev/null; then
        echo "true"
    else
        echo "false"
    fi
}

# Generate JSON string with proper escaping
json_string() {
    local value="$1"
    # Escape quotes and backslashes
    value=$(echo "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    echo "\"$value\""
}

# Generate JSON array element with conditional inclusion
json_array_element() {
    local condition="$1"
    local element="$2"
    
    if eval "$condition" 2>/dev/null; then
        echo "$(json_string "$element")"
    else
        echo ""
    fi
}

# Clean up JSON array (remove empty elements and trailing commas)
clean_json_array() {
    local array_content="$1"
    # Remove empty elements, extra commas, and trailing commas
    echo "$array_content" | sed 's/,\+/,/g; s/^,//; s/,$//; s/,,\+/,/g' | grep -v '^[[:space:]]*$' | paste -sd ',' | sed 's/,$//'
}