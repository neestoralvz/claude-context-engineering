#!/usr/bin/env python3
"""
Enhanced YAML Elimination Script
Systematic conversion of YAML blocks to P55/P6 compliant structured formats

This script implements comprehensive YAML elimination with semantic preservation,
supporting multiple output formats and maintaining full functionality.
"""

import os
import re
import json
import yaml
from typing import List, Dict, Any, Tuple
from pathlib import Path
from datetime import datetime
import argparse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class YAMLConverter:
    """Enhanced YAML to structured format converter with semantic preservation"""
    
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.conversions = []
        self.stats = {
            'files_processed': 0,
            'yaml_blocks_found': 0,
            'yaml_blocks_converted': 0,
            'conversion_errors': 0
        }
        
    def find_yaml_files(self) -> List[Path]:
        """Find all markdown files with YAML blocks"""
        yaml_files = []
        
        for md_file in self.root_dir.rglob("*.md"):
            # Skip backup directories and node_modules
            if any(skip in str(md_file) for skip in ['backups', 'node_modules', '.git']):
                continue
                
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '```yaml' in content or '```yml' in content:
                        yaml_files.append(md_file)
            except Exception as e:
                logger.error(f"Error reading {md_file}: {e}")
                
        return yaml_files
    
    def extract_yaml_blocks(self, content: str) -> List[Tuple[str, str, int, int]]:
        """Extract YAML blocks with positions for replacement"""
        blocks = []
        
        # Pattern to match YAML blocks
        pattern = r'```ya?ml\n(.*?)\n```'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            yaml_content = match.group(1)
            start_pos = match.start()
            end_pos = match.end()
            full_block = match.group(0)
            
            blocks.append((full_block, yaml_content, start_pos, end_pos))
            
        return blocks
    
    def convert_yaml_to_structured(self, yaml_content: str) -> str:
        """Convert YAML content to structured markdown format"""
        try:
            # Parse YAML to understand structure
            parsed = yaml.safe_load(yaml_content)
            
            if isinstance(parsed, dict):
                return self._convert_dict_to_markdown(parsed)
            elif isinstance(parsed, list):
                return self._convert_list_to_markdown(parsed)
            else:
                return f"**Value**: {parsed}"
                
        except yaml.YAMLError as e:
            logger.warning(f"YAML parsing error: {e}")
            # Fallback to line-by-line conversion
            return self._convert_yaml_lines(yaml_content)
    
    def _convert_dict_to_markdown(self, data: Dict[str, Any], level: int = 0) -> str:
        """Convert dictionary to structured markdown"""
        lines = []
        indent = "  " * level
        
        for key, value in data.items():
            # Clean key name for display
            display_key = key.replace('_', ' ').title()
            
            if isinstance(value, dict):
                lines.append(f"{indent}**{display_key}**:")
                lines.append(self._convert_dict_to_markdown(value, level + 1))
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
    
    def _convert_list_to_markdown(self, data: List[Any]) -> str:
        """Convert list to structured markdown"""
        lines = []
        for item in data:
            if isinstance(item, str):
                lines.append(f"- {item}")
            else:
                lines.append(f"- {str(item)}")
        return "\n".join(lines)
    
    def _convert_yaml_lines(self, yaml_content: str) -> str:
        """Fallback line-by-line conversion for complex YAML"""
        lines = yaml_content.strip().split('\n')
        converted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            # Handle key-value pairs
            if ':' in line and not line.startswith('-'):
                key, value = line.split(':', 1)
                key = key.strip().replace('_', ' ').title()
                value = value.strip().strip('"').strip("'")
                
                if value:
                    converted_lines.append(f"- **{key}**: {value}")
                else:
                    converted_lines.append(f"**{key}**:")
            # Handle list items
            elif line.startswith('-'):
                item = line[1:].strip().strip('"').strip("'")
                converted_lines.append(f"- {item}")
            else:
                converted_lines.append(f"- {line}")
        
        return "\n".join(converted_lines)
    
    def determine_conversion_format(self, yaml_content: str) -> str:
        """Determine the best format for conversion based on content"""
        try:
            parsed = yaml.safe_load(yaml_content)
            
            # Complex nested structures -> JSON
            if isinstance(parsed, dict) and self._is_complex_structure(parsed):
                return 'json'
            
            # Configuration blocks -> Table format
            elif isinstance(parsed, dict) and self._is_configuration_block(parsed):
                return 'table'
            
            # Simple structures -> Markdown lists
            else:
                return 'markdown'
                
        except yaml.YAMLError:
            return 'markdown'
    
    def _is_complex_structure(self, data: Dict[str, Any]) -> bool:
        """Check if structure is complex enough to warrant JSON format"""
        max_depth = self._get_dict_depth(data)
        return max_depth > 3 or len(data) > 8
    
    def _is_configuration_block(self, data: Dict[str, Any]) -> bool:
        """Check if structure is a configuration block suitable for table format"""
        # Look for configuration patterns
        config_keys = ['command_trigger', 'execution_mode', 'model_type', 'configuration']
        return any(key in data for key in config_keys)
    
    def _get_dict_depth(self, data: Dict[str, Any]) -> int:
        """Calculate maximum depth of nested dictionary"""
        if not isinstance(data, dict):
            return 0
        
        if not data:
            return 1
            
        return 1 + max(self._get_dict_depth(value) for value in data.values())
    
    def convert_to_table_format(self, yaml_content: str) -> str:
        """Convert YAML to table format for configuration blocks"""
        try:
            parsed = yaml.safe_load(yaml_content)
            
            if not isinstance(parsed, dict):
                return self.convert_yaml_to_structured(yaml_content)
            
            # Extract configuration pairs
            config_pairs = []
            for key, value in parsed.items():
                if isinstance(value, (str, int, float, bool)):
                    config_pairs.append((key.replace('_', ' ').title(), str(value)))
                elif isinstance(value, dict):
                    # Flatten nested dict
                    for subkey, subvalue in value.items():
                        full_key = f"{key.replace('_', ' ').title()} - {subkey.replace('_', ' ').title()}"
                        config_pairs.append((full_key, str(subvalue)))
            
            if config_pairs:
                lines = ["| Configuration | Value |", "|---------------|-------|"]
                for key, value in config_pairs:
                    lines.append(f"| **{key}** | {value} |")
                return "\n".join(lines)
            
        except yaml.YAMLError:
            pass
        
        return self.convert_yaml_to_structured(yaml_content)
    
    def convert_to_json_format(self, yaml_content: str) -> str:
        """Convert YAML to JSON format for complex structures"""
        try:
            parsed = yaml.safe_load(yaml_content)
            json_content = json.dumps(parsed, indent=2)
            return f"```json\n{json_content}\n```"
        except (yaml.YAMLError, json.JSONEncodeError):
            return self.convert_yaml_to_structured(yaml_content)
    
    def process_file(self, file_path: Path) -> bool:
        """Process a single file and convert all YAML blocks"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            yaml_blocks = self.extract_yaml_blocks(content)
            
            if not yaml_blocks:
                return True
                
            logger.info(f"Processing {file_path}: {len(yaml_blocks)} YAML blocks")
            
            # Process blocks in reverse order to maintain positions
            for full_block, yaml_content, start_pos, end_pos in reversed(yaml_blocks):
                try:
                    # Determine best conversion format
                    format_type = self.determine_conversion_format(yaml_content)
                    
                    if format_type == 'table':
                        converted = self.convert_to_table_format(yaml_content)
                    elif format_type == 'json':
                        converted = self.convert_to_json_format(yaml_content)
                    else:
                        converted = self.convert_yaml_to_structured(yaml_content)
                    
                    # Replace the YAML block
                    content = content[:start_pos] + converted + content[end_pos:]
                    
                    self.stats['yaml_blocks_converted'] += 1
                    
                except Exception as e:
                    logger.error(f"Error converting YAML block in {file_path}: {e}")
                    self.stats['conversion_errors'] += 1
                    continue
            
            # Write back the converted content
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.conversions.append({
                    'file': str(file_path),
                    'yaml_blocks': len(yaml_blocks),
                    'converted_blocks': len(yaml_blocks) - (self.stats['conversion_errors'] - len(yaml_blocks)),
                    'timestamp': datetime.now().isoformat()
                })
            
            self.stats['files_processed'] += 1
            self.stats['yaml_blocks_found'] += len(yaml_blocks)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return False
    
    def process_all_files(self) -> None:
        """Process all files with YAML blocks"""
        yaml_files = self.find_yaml_files()
        
        logger.info(f"Found {len(yaml_files)} files with YAML blocks")
        
        for file_path in yaml_files:
            self.process_file(file_path)
    
    def generate_report(self) -> str:
        """Generate conversion report"""
        report = f"""# YAML Elimination Report

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary Statistics

- **Files Processed**: {self.stats['files_processed']}
- **YAML Blocks Found**: {self.stats['yaml_blocks_found']}
- **YAML Blocks Converted**: {self.stats['yaml_blocks_converted']}
- **Conversion Errors**: {self.stats['conversion_errors']}
- **Success Rate**: {(self.stats['yaml_blocks_converted'] / max(self.stats['yaml_blocks_found'], 1) * 100):.1f}%

## Conversion Details

"""
        
        for conversion in self.conversions:
            report += f"- **{conversion['file']}**: {conversion['converted_blocks']}/{conversion['yaml_blocks']} blocks converted\n"
        
        report += f"""

## Next Steps

1. Review converted files for accuracy
2. Test functionality to ensure semantic preservation
3. Validate P55/P6 compliance
4. Update cross-references as needed

## Files Processed

Total files with YAML blocks: {len(self.conversions)}

"""
        
        return report

def main():
    parser = argparse.ArgumentParser(description='Enhanced YAML Elimination Tool')
    parser.add_argument('--root-dir', 
                       default='/Users/nalve/claude-context-engineering',
                       help='Root directory to process')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be converted without making changes')
    parser.add_argument('--report-only', action='store_true',
                       help='Generate report only without conversion')
    
    args = parser.parse_args()
    
    converter = YAMLConverter(args.root_dir)
    
    if args.report_only:
        # Just find and report on YAML files
        yaml_files = converter.find_yaml_files()
        print(f"Found {len(yaml_files)} files with YAML blocks:")
        for file_path in yaml_files:
            print(f"  - {file_path}")
        return
    
    if args.dry_run:
        print("DRY RUN MODE - No files will be modified")
        yaml_files = converter.find_yaml_files()
        for file_path in yaml_files:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            yaml_blocks = converter.extract_yaml_blocks(content)
            print(f"{file_path}: {len(yaml_blocks)} YAML blocks")
        return
    
    # Process all files
    converter.process_all_files()
    
    # Generate and save report
    report = converter.generate_report()
    report_path = Path(args.root_dir) / 'logs' / 'yaml-elimination-report.md'
    report_path.parent.mkdir(exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"YAML elimination complete. Report saved to: {report_path}")
    print(f"Processed {converter.stats['files_processed']} files")
    print(f"Converted {converter.stats['yaml_blocks_converted']}/{converter.stats['yaml_blocks_found']} YAML blocks")

if __name__ == '__main__':
    main()