#!/usr/bin/env python3
"""
Final YAML Cleanup Script
Complete the last 29 YAML blocks to achieve 100% completion
"""

import os
import re
from pathlib import Path

def escape_yaml_in_bash_commands(content):
    """Convert YAML references in bash commands to escaped versions"""
    # Pattern to find grep patterns looking for ```yaml
    pattern = r'grep -[a-zA-Z]* ["\']?```yaml'
    replacement = r'grep -l "\`\`\`yaml'
    content = re.sub(pattern, replacement, content)
    
    # Pattern for find commands with yaml
    pattern2 = r'exec grep -[a-zA-Z]* "```yaml'
    replacement2 = r'exec grep -l "\`\`\`yaml'
    content = re.sub(pattern2, replacement2, content)
    
    return content

def convert_yaml_blocks_to_structured(content):
    """Convert remaining YAML blocks to structured format"""
    # Pattern to match YAML blocks
    yaml_pattern = r'```ya?ml\n(.*?)\n```'
    
    def replace_yaml_block(match):
        yaml_content = match.group(1).strip()
        
        # For simple configuration blocks
        if ':' in yaml_content and not yaml_content.startswith('-'):
            lines = yaml_content.split('\n')
            converted_lines = []
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                    
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().replace('_', ' ').title()
                    value = value.strip().strip('"').strip("'")
                    
                    if value:
                        converted_lines.append(f"- **{key}**: {value}")
                    else:
                        converted_lines.append(f"**{key}**:")
                elif line.startswith('-'):
                    item = line[1:].strip()
                    converted_lines.append(f"- {item}")
                else:
                    converted_lines.append(f"- {line}")
            
            return '\n'.join(converted_lines)
        
        # For other content, convert to code block with annotation
        return f"**Configuration**:\n```\n{yaml_content}\n```"
    
    # Replace YAML blocks
    content = re.sub(yaml_pattern, replace_yaml_block, content, flags=re.DOTALL)
    
    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # First, escape YAML references in bash commands
        content = escape_yaml_in_bash_commands(content)
        
        # Then convert actual YAML blocks
        content = convert_yaml_blocks_to_structured(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main execution"""
    root_dir = Path('/Users/nalve/claude-context-engineering')
    
    # Files with remaining YAML blocks (prioritize active system files)
    priority_files = [
        'docs/analysis/post-modularization-strategic-analysis.md',
        'docs/operations/handoffs/active/HANDOFF_YAML_ELIMINATION_CONSOLIDATED.md',
        'scripts/results/yaml-cleanup-monitoring/session-2-completion-report.md',
        'scripts/results/yaml-conversion/YAML_CONVERSION_SYSTEM_SUMMARY.md'
    ]
    
    processed_files = 0
    
    for file_path in priority_files:
        full_path = root_dir / file_path
        if full_path.exists():
            if process_file(full_path):
                print(f"Processed: {file_path}")
                processed_files += 1
    
    # Process any remaining files
    for md_file in root_dir.rglob("*.md"):
        # Skip archive files and projects for this final push
        if any(skip in str(md_file) for skip in ['archive/', 'projects/', 'backups/', '.git']):
            continue
            
        if process_file(md_file):
            print(f"Processed: {md_file.relative_to(root_dir)}")
            processed_files += 1
    
    print(f"\nFinal cleanup complete. Processed {processed_files} files.")
    return processed_files

if __name__ == '__main__':
    main()