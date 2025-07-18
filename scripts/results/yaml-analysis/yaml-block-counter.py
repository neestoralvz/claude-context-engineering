#!/usr/bin/env python3
"""
YAML Block Counter - Precise Analysis
Counts actual YAML code blocks (```yaml) vs casual yaml mentions
"""

import os
import re
from pathlib import Path

def count_yaml_blocks(directory):
    """Count actual YAML code blocks vs casual mentions"""
    yaml_block_pattern = r'```yaml'
    yaml_mention_pattern = r'\byaml\b'
    
    stats = {
        'files_with_yaml_blocks': 0,
        'files_with_yaml_mentions': 0,
        'total_yaml_blocks': 0,
        'total_yaml_mentions': 0,
        'files_analyzed': 0,
        'yaml_block_files': [],
        'yaml_mention_files': []
    }
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, directory)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    stats['files_analyzed'] += 1
                    
                    # Count YAML code blocks
                    yaml_blocks = len(re.findall(yaml_block_pattern, content))
                    if yaml_blocks > 0:
                        stats['files_with_yaml_blocks'] += 1
                        stats['total_yaml_blocks'] += yaml_blocks
                        stats['yaml_block_files'].append({
                            'file': relative_path,
                            'blocks': yaml_blocks
                        })
                    
                    # Count YAML mentions (casual)
                    yaml_mentions = len(re.findall(yaml_mention_pattern, content, re.IGNORECASE))
                    if yaml_mentions > 0:
                        stats['files_with_yaml_mentions'] += 1
                        stats['total_yaml_mentions'] += yaml_mentions
                        stats['yaml_mention_files'].append({
                            'file': relative_path,
                            'mentions': yaml_mentions
                        })
                
                except Exception as e:
                    print(f"Error reading {relative_path}: {e}")
    
    return stats

def main():
    project_root = Path(__file__).parent.parent.parent.parent
    stats = count_yaml_blocks(str(project_root))
    
    print("🔍 YAML ANALYSIS RESULTS")
    print("=" * 50)
    print(f"Files analyzed: {stats['files_analyzed']}")
    print(f"Files with YAML blocks (```yaml): {stats['files_with_yaml_blocks']}")
    print(f"Total YAML code blocks: {stats['total_yaml_blocks']}")
    print(f"Files with yaml mentions: {stats['files_with_yaml_mentions']}")
    print(f"Total yaml mentions: {stats['total_yaml_mentions']}")
    
    print("\n📊 YAML CODE BLOCKS BY FILE:")
    print("-" * 30)
    for file_info in sorted(stats['yaml_block_files'], key=lambda x: x['blocks'], reverse=True):
        print(f"{file_info['blocks']:3d} blocks: {file_info['file']}")
    
    if stats['total_yaml_blocks'] == 0:
        print("\n✅ NO YAML CODE BLOCKS FOUND - Session 2 appears complete!")
    else:
        print(f"\n🚨 {stats['total_yaml_blocks']} YAML blocks still need conversion")
    
    # Session 2 specific files check
    session2_files = [
        'docs/commands/shared/monitoring/progress-tracking-system.md',
        'docs/commands/shared/routing/decision-engine-integration.md', 
        'docs/knowledge/reference/claude-github-integration.md'
    ]
    
    print("\n🎯 SESSION 2 FILES STATUS:")
    print("-" * 30)
    session2_blocks = 0
    for target_file in session2_files:
        blocks_in_file = 0
        for file_info in stats['yaml_block_files']:
            if target_file in file_info['file']:
                blocks_in_file = file_info['blocks']
                session2_blocks += blocks_in_file
        print(f"{blocks_in_file:3d} blocks: {target_file}")
    
    print(f"\nSession 2 Total: {session2_blocks} blocks")
    if session2_blocks == 0:
        print("✅ SESSION 2 COMPLETE - All target files converted!")
    else:
        print(f"🚨 Session 2 needs {session2_blocks} blocks converted")

if __name__ == "__main__":
    main()