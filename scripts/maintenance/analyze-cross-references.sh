#!/bin/bash
# 🔍 Context Engineering - Cross-Reference Analysis System
# Mapeo automático y análisis de todas las referencias cruzadas

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/scripts/results/cross-references"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
OUTPUT_FILE="$RESULTS_DIR/cross-reference-analysis-$TIMESTAMP.json"
REPORT_FILE="$RESULTS_DIR/cross-reference-report-$TIMESTAMP.md"

# Ripgrep path detection
if command -v rg &> /dev/null; then
    RG_CMD="rg"
elif [ -f "/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg" ]; then
    RG_CMD="/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg"
else
    RG_CMD="grep" # fallback
fi

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}🔍 Context Engineering - Cross-Reference Analysis System${NC}"
echo "=================================================================="
echo ""

# Function to log with timestamp
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to analyze principle references
analyze_principle_references() {
    log "Analyzing principle references..."
    
    local temp_file=$(mktemp)
    
    # Patterns to search for
    local patterns=(
        '#[0-9]+[[:space:]]*[A-Za-z]'  # #94 Strategic
        '[0-9]+[[:space:]]*principio'  # 94 principios
        '[0-9]+[[:space:]]*principle'  # 94 principles
        'Principle[[:space:]]*#[0-9]+' # Principle #94
        'principio[[:space:]]*#[0-9]+' # principio #94
    )
    
    echo "{" > "$temp_file"
    echo "  \"principle_references\": {" >> "$temp_file"
    
    local first_pattern=true
    for pattern in "${patterns[@]}"; do
        if [ "$first_pattern" = false ]; then
            echo "," >> "$temp_file"
        fi
        first_pattern=false
        
        echo "    \"$pattern\": [" >> "$temp_file"
        
        # Search for pattern in all text files
        local first_result=true
        while IFS= read -r line; do
            if [ "$first_result" = false ]; then
                echo "," >> "$temp_file"
            fi
            first_result=false
            
            local file_path=$(echo "$line" | cut -d':' -f1)
            local line_num=$(echo "$line" | cut -d':' -f2)
            local content=$(echo "$line" | cut -d':' -f3-)
            
            # Clean content for JSON
            content=$(echo "$content" | sed 's/"/\\"/g' | tr -d '\n\r')
            
            echo "      {" >> "$temp_file"
            echo "        \"file\": \"$file_path\"," >> "$temp_file"
            echo "        \"line\": $line_num," >> "$temp_file"
            echo "        \"content\": \"$content\"" >> "$temp_file"
            echo "      }" >> "$temp_file"
            
        done < <($RG_CMD -n "$pattern" "$PROJECT_ROOT" \
                    --type md --type json --type js --type ts --type sh \
                    2>/dev/null || true)
        
        echo "" >> "$temp_file"
        echo "    ]" >> "$temp_file"
    done
    
    echo "" >> "$temp_file"
    echo "  }" >> "$temp_file"
    
    cat "$temp_file"
    rm "$temp_file"
}

# Function to analyze file dependencies
analyze_file_dependencies() {
    log "Analyzing file dependencies..."
    
    echo ","
    echo "  \"file_dependencies\": {"
    
    # Find all markdown files with links
    local first_file=true
    find "$PROJECT_ROOT" -name "*.md" -type f | while read -r file; do
        if [ "$first_file" = false ]; then
            echo ","
        fi
        first_file=false
        
        local relative_path="${file#$PROJECT_ROOT/}"
        echo "    \"$relative_path\": {"
        
        # Count different types of references
        local md_links=$($RG_CMD -c '\]\([^)]*\.md[^)]*\)' "$file" 2>/dev/null || echo 0)
        local principle_refs=$($RG_CMD -c '#[0-9]+' "$file" 2>/dev/null || echo 0)
        local see_also_refs=$($RG_CMD -c '\*\*See Also\*\*' "$file" 2>/dev/null || echo 0)
        
        echo "      \"markdown_links\": $md_links,"
        echo "      \"principle_references\": $principle_refs,"
        echo "      \"see_also_sections\": $see_also_refs,"
        
        # Extract linked files
        echo "      \"linked_files\": ["
        local first_link=true
        $RG_CMD -o '\]\(([^)]*\.md[^)]*)\)' "$file" 2>/dev/null | sed 's/](\([^)]*\))/\1/' | while read -r link; do
            if [ "$first_link" = false ]; then
                echo ","
            fi
            first_link=false
            echo "        \"$link\""
        done
        echo "      ]"
        echo "    }"
    done
    
    echo "  }"
}

# Function to analyze critical paths
analyze_critical_paths() {
    log "Analyzing critical paths..."
    
    echo ","
    echo "  \"critical_paths\": {"
    echo "    \"high_reference_files\": ["
    
    # Find files with most references
    local first_critical=true
    find "$PROJECT_ROOT" -name "*.md" -type f | while read -r file; do
        local ref_count=$($RG_CMD -c '#[0-9]+' "$file" 2>/dev/null || echo 0)
        if [ "$ref_count" -gt 10 ]; then
            if [ "$first_critical" = false ]; then
                echo ","
            fi
            first_critical=false
            
            local relative_path="${file#$PROJECT_ROOT/}"
            echo "      {\"file\": \"$relative_path\", \"reference_count\": $ref_count}"
        fi
    done
    
    echo "    ],"
    echo "    \"core_principle_files\": ["
    
    # Identify core principle files
    local core_files=(
        "docs/knowledge/principles/README.md"
        "docs/knowledge/principles/principle-cross-reference-network.md"
        "CLAUDE.md"
    )
    
    local first_core=true
    for file in "${core_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            if [ "$first_core" = false ]; then
                echo ","
            fi
            first_core=false
            echo "      \"$file\""
        fi
    done
    
    echo "    ]"
    echo "  }"
}

# Function to detect reference patterns
detect_reference_patterns() {
    log "Detecting reference patterns..."
    
    echo ","
    echo "  \"reference_patterns\": {"
    
    # Common patterns found
    echo "    \"principle_number_patterns\": ["
    echo "      \"#[0-9]+\","
    echo "      \"[0-9]+ principio\","
    echo "      \"[0-9]+ principle\","
    echo "      \"Principle #[0-9]+\""
    echo "    ],"
    
    echo "    \"cross_reference_patterns\": ["
    echo "      \"\\[.*\\]\\(.*\\.md#.*\\)\","
    echo "      \"\\*\\*See Also\\*\\*.*\","
    echo "      \"\\[.*\\]\\(\\.\\/.*\\.md.*\\)\""
    echo "    ],"
    
    # Count total patterns
    local total_principle_refs=$($RG_CMD -c '#[0-9]+' "$PROJECT_ROOT" --type md 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
    local total_md_links=$($RG_CMD -c '\]\([^)]*\.md[^)]*\)' "$PROJECT_ROOT" --type md 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
    
    echo "    \"statistics\": {"
    echo "      \"total_principle_references\": $total_principle_refs,"
    echo "      \"total_markdown_links\": $total_md_links,"
    echo "      \"analysis_timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""
    echo "    }"
    echo "  }"
}

# Main analysis function
main() {
    log "Starting cross-reference analysis..."
    
    # Create main JSON output
    {
        echo "{"
        echo "  \"analysis_metadata\": {"
        echo "    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "    \"project_root\": \"$PROJECT_ROOT\","
        echo "    \"version\": \"1.0.0\""
        echo "  },"
        
        analyze_principle_references
        analyze_file_dependencies
        analyze_critical_paths
        detect_reference_patterns
        
        echo "}"
    } > "$OUTPUT_FILE"
    
    # Generate human-readable report
    generate_report
    
    log "Analysis complete!"
    echo ""
    echo -e "${GREEN}✅ Results saved to:${NC}"
    echo -e "  📊 JSON: ${YELLOW}$OUTPUT_FILE${NC}"
    echo -e "  📋 Report: ${YELLOW}$REPORT_FILE${NC}"
}

# Function to generate human-readable report
generate_report() {
    log "Generating human-readable report..."
    
    cat > "$REPORT_FILE" << EOF
# 🔍 Cross-Reference Analysis Report

**Generated**: $(date)
**Project**: Context Engineering
**Analysis Version**: 1.0.0

## 📊 Executive Summary

This report provides a comprehensive analysis of cross-references throughout the Context Engineering project.

### 🎯 Key Findings

$(jq -r '.reference_patterns.statistics | 
"- **Total Principle References**: \(.total_principle_references)
- **Total Markdown Links**: \(.total_markdown_links)
- **Analysis Date**: \(.analysis_timestamp)"' "$OUTPUT_FILE")

### 📁 High-Reference Files

Files with more than 10 principle references:

$(jq -r '.critical_paths.high_reference_files[] | 
"- **\(.file)**: \(.reference_count) references"' "$OUTPUT_FILE" 2>/dev/null || echo "No high-reference files detected")

### 🔗 Core Principle Files

Critical files for principle management:

$(jq -r '.critical_paths.core_principle_files[] | 
"- \(.)"' "$OUTPUT_FILE" 2>/dev/null || echo "No core files identified")

## 🛠️ Recommendations

1. **Automated Validation**: Implement pre-commit hooks for reference integrity
2. **Systematic Updates**: Use update scripts for bulk reference changes
3. **Monitoring**: Set up continuous monitoring for broken references
4. **Documentation**: Maintain registry of reference patterns

## 📋 Next Steps

1. Review high-reference files for potential consolidation opportunities
2. Implement validation scripts based on detected patterns
3. Create update procedures for systematic reference management
4. Establish monitoring for reference integrity

---

*Generated by Context Engineering Cross-Reference Analysis System*
EOF
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! $RG_CMD --version &> /dev/null; then
        missing_deps+=("ripgrep (rg)")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies:${NC}"
        printf '%s\n' "${missing_deps[@]}"
        echo ""
        echo "Please install missing dependencies and try again."
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
🔍 Context Engineering - Cross-Reference Analysis System

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -h, --help     Show this help message
    -v, --verbose  Enable verbose output

DESCRIPTION:
    Analyzes all cross-references in the Context Engineering project,
    generating comprehensive reports for systematic reference management.

EXAMPLES:
    $0                    # Run full analysis
    $0 --verbose         # Run with detailed output

OUTPUT:
    - JSON data file with complete analysis
    - Human-readable markdown report
    - Reference pattern detection
    - Critical path identification

EOF
}

# Parse command line arguments
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# Run main analysis
check_dependencies
main

echo ""
echo -e "${GREEN}🎉 Cross-reference analysis completed successfully!${NC}"