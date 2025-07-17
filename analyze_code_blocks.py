#!/usr/bin/env python3
import re
import os

def analyze_code_blocks(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        issues = []
        in_code_block = False
        prev_line = ''
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped == '```':
                if not in_code_block:
                    # This is an opening block without language specification
                    issues.append(f'Line {i}: Opening code block without language specification')
                    # Try to guess language from context
                    prev_stripped = prev_line.strip()
                    if any(x in prev_stripped.lower() for x in ['yaml', 'configuration', 'config']):
                        issues.append(f'  -> Suggested: yaml')
                    elif any(x in prev_stripped.lower() for x in ['json', 'object', 'structure']):
                        issues.append(f'  -> Suggested: json')
                    elif any(x in prev_stripped.lower() for x in ['bash', 'shell', 'command', 'script']):
                        issues.append(f'  -> Suggested: bash')
                    elif any(x in prev_stripped.lower() for x in ['markdown', 'example']):
                        issues.append(f'  -> Suggested: markdown')
                    else:
                        issues.append(f'  -> Suggested: text')
                in_code_block = not in_code_block
            elif stripped.startswith('```'):
                in_code_block = not in_code_block
            
            prev_line = line
        
        return issues
    except Exception as e:
        return [f'Error reading file: {e}']

# Analyze first few files
files_to_check = [
    'docs/knowledge/patterns/system-management-patterns.md',
    'docs/knowledge/patterns/quality-improvement-standards.md', 
    'docs/knowledge/patterns/README.md'
]

for file_path in files_to_check:
    if os.path.exists(file_path):
        print(f'\n=== {file_path} ===')
        issues = analyze_code_blocks(file_path)
        for issue in issues[:10]:  # Show first 10 issues
            print(issue)