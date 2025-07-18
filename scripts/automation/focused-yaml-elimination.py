#!/usr/bin/env python3
"""
Focused YAML Elimination Script
Systematic conversion of YAML blocks to P55/P6 compliant structured formats
Focus on main system files, excluding projects and backups
"""

import os
import re
import json
import yaml
from typing import List, Dict, Any, Tuple
from pathlib import Path
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def should_skip_file(file_path: str) -> bool:
    """Determine if file should be skipped"""
    skip_patterns = [
        'projects/', 'backups/', 'node_modules/', '.git/',
        'archived/', 'review/', 'scripts/results/'
    ]
    return any(pattern in file_path for pattern in skip_patterns)

def extract_yaml_blocks(content: str) -> List[Tuple[str, str, int, int]]:
    """Extract YAML blocks with positions for replacement"""
    blocks = []
    pattern = r'```ya?ml\n(.*?)\n```'
    
    for match in re.finditer(pattern, content, re.DOTALL):
        yaml_content = match.group(1)
        start_pos = match.start()
        end_pos = match.end()
        full_block = match.group(0)
        blocks.append((full_block, yaml_content, start_pos, end_pos))
    
    return blocks

def convert_yaml_to_structured(yaml_content: str) -> str:
    """Convert YAML content to structured markdown format"""
    try:
        parsed = yaml.safe_load(yaml_content)
        
        if isinstance(parsed, dict):
            return convert_dict_to_markdown(parsed)
        elif isinstance(parsed, list):
            return convert_list_to_markdown(parsed)
        else:
            return f"**Value**: {parsed}"
    except yaml.YAMLError as e:
        logger.warning(f"YAML parsing error: {e}")
        return convert_yaml_lines(yaml_content)

def convert_dict_to_markdown(data: Dict[str, Any], level: int = 0) -> str:
    """Convert dictionary to structured markdown"""
    lines = []
    indent = "  " * level
    
    for key, value in data.items():
        display_key = key.replace('_', ' ').title()
        
        if isinstance(value, dict):
            lines.append(f"{indent}**{display_key}**:")
            lines.append(convert_dict_to_markdown(value, level + 1))
        elif isinstance(value, list):
            lines.append(f"{indent}**{display_key}**:")
            for item in value:
                if isinstance(item, str):
                    lines.append(f"{indent}- {item}")
                else:
                    lines.append(f"{indent}- {str(item)}")
        else:
            lines.append(f"{indent}- **{display_key}**: {value}")
    
    return "\n".join(lines)

def convert_list_to_markdown(data: List[Any]) -> str:
    """Convert list to structured markdown"""
    lines = []
    for item in data:
        if isinstance(item, str):
            lines.append(f"- {item}")
        else:
            lines.append(f"- {str(item)}")
    return "\n".join(lines)

def convert_yaml_lines(yaml_content: str) -> str:
    """Fallback line-by-line conversion for complex YAML"""
    lines = yaml_content.strip().split('\n')
    converted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
            
        if ':' in line and not line.startswith('-'):
            key, value = line.split(':', 1)
            key = key.strip().replace('_', ' ').title()
            value = value.strip().strip('"').strip("'")
            
            if value:
                converted_lines.append(f"- **{key}**: {value}")
            else:
                converted_lines.append(f"**{key}**:")
        elif line.startswith('-'):
            item = line[1:].strip().strip('"').strip("'")
            converted_lines.append(f"- {item}")
        else:
            converted_lines.append(f"- {line}")
    
    return "\n".join(converted_lines)

def process_file(file_path: Path) -> Tuple[bool, int, int]:
    """Process a single file and convert all YAML blocks"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        yaml_blocks = extract_yaml_blocks(content)
        
        if not yaml_blocks:
            return True, 0, 0
        
        logger.info(f"Processing {file_path}: {len(yaml_blocks)} YAML blocks")
        
        converted_count = 0
        # Process blocks in reverse order to maintain positions
        for full_block, yaml_content, start_pos, end_pos in reversed(yaml_blocks):
            try:
                converted = convert_yaml_to_structured(yaml_content)
                content = content[:start_pos] + converted + content[end_pos:]
                converted_count += 1
            except Exception as e:
                logger.error(f"Error converting YAML block in {file_path}: {e}")
                continue
        
        # Write back the converted content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, len(yaml_blocks), converted_count
        
    except Exception as e:
        logger.error(f"Error processing {file_path}: {e}")
        return False, 0, 0

def main():
    root_dir = Path('/Users/nalve/claude-context-engineering')
    
    # Find all markdown files with YAML blocks
    yaml_files = []
    for md_file in root_dir.rglob("*.md"):
        if should_skip_file(str(md_file)):
            continue
            
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if '```yaml' in content or '```yml' in content:
                    yaml_files.append(md_file)
        except Exception as e:
            logger.error(f"Error reading {md_file}: {e}")
    
    logger.info(f"Found {len(yaml_files)} files with YAML blocks to process")
    
    # Process all files
    total_files = 0
    total_blocks_found = 0
    total_blocks_converted = 0
    
    for file_path in yaml_files:
        success, blocks_found, blocks_converted = process_file(file_path)
        if success:
            total_files += 1
            total_blocks_found += blocks_found
            total_blocks_converted += blocks_converted
    
    # Generate summary
    logger.info(f"Processing complete:")
    logger.info(f"- Files processed: {total_files}")
    logger.info(f"- YAML blocks found: {total_blocks_found}")
    logger.info(f"- YAML blocks converted: {total_blocks_converted}")
    logger.info(f"- Success rate: {(total_blocks_converted / max(total_blocks_found, 1) * 100):.1f}%")
    
    return total_files, total_blocks_found, total_blocks_converted

if __name__ == '__main__':
    main()