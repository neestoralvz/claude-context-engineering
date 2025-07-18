#!/usr/bin/env python3
"""Count remaining YAML blocks in the system"""

import os
import re
from pathlib import Path

def count_yaml_blocks_in_file(file_path):
    """Count YAML blocks in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return len(re.findall(r'```ya?ml', content))
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def main():
    root_dir = Path('/Users/nalve/claude-context-engineering')
    
    total_blocks = 0
    files_with_yaml = 0
    
    # Skip patterns
    skip_patterns = ['backups/', 'node_modules/', '.git/', 'projects/']
    
    for md_file in root_dir.rglob("*.md"):
        if any(skip in str(md_file) for skip in skip_patterns):
            continue
            
        block_count = count_yaml_blocks_in_file(md_file)
        if block_count > 0:
            total_blocks += block_count
            files_with_yaml += 1
            print(f"{md_file}: {block_count} YAML blocks")
    
    print(f"\nSummary:")
    print(f"Total YAML blocks remaining: {total_blocks}")
    print(f"Files with YAML blocks: {files_with_yaml}")
    
    # Compare with original count
    print(f"\nOriginal count was approximately 598 blocks")
    print(f"Blocks eliminated: {598 - total_blocks}")
    print(f"Elimination rate: {((598 - total_blocks) / 598) * 100:.1f}%")

if __name__ == '__main__':
    main()