#!/usr/bin/env python3
import os
import re
import glob

def fix_unspecified_code_blocks(root_dir):
    """Fix code blocks that should have language specifications but don't."""
    fixes = []
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            modified = False
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                # Found an unspecified opening code block
                if line == '```':
                    # Check if this is an opening block by looking ahead
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        # If next line has content (not empty or just whitespace), this is likely an opening block
                        if next_line and not next_line.startswith('#') and not next_line.startswith('*'):
                            # Look for the closing block
                            j = i + 1
                            found_content = False
                            while j < len(lines):
                                if lines[j].strip() == '```':
                                    break
                                if lines[j].strip():  # Found non-empty content
                                    found_content = True
                                j += 1
                            
                            if found_content:
                                # Guess the language based on content
                                block_content = '\n'.join(lines[i+1:j])
                                language = guess_language(block_content, lines[i-1] if i > 0 else '')
                                
                                # Fix the line
                                lines[i] = f'```{language}'
                                modified = True
                                
                                rel_path = os.path.relpath(file_path, root_dir)
                                fixes.append({
                                    'file': rel_path,
                                    'line': i + 1,
                                    'language': language
                                })
                i += 1
            
            # Write back the file if modified
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return fixes

def guess_language(content, prev_line):
    """Guess the appropriate language for a code block."""
    content_lower = content.lower()
    prev_lower = prev_line.lower()
    
    # Check for box drawing characters (visual templates)
    if any(char in content for char in ['╔', '║', '╠', '╣', '╚', '╝', '═', '╗']):
        return 'text'
    
    # Check content patterns
    if any(x in content_lower for x in ['{', '}', '":', ': "', ': [']) and '"' in content:
        return 'json'
    elif any(x in content_lower for x in [':', '- ', 'version:', 'name:', 'description:']) and not content_lower.startswith('<'):
        return 'yaml'
    elif any(x in content_lower for x in ['$', 'cd ', 'ls ', 'grep ', 'echo ', '#!/', 'chmod ', 'mkdir ']):
        return 'bash'
    elif any(x in content_lower for x in ['def ', 'import ', 'print(', 'class ', 'if __name__']):
        return 'python'
    elif any(x in content_lower for x in ['function ', 'const ', 'let ', 'var ', '=>', 'console.log']):
        return 'javascript'
    elif any(x in content_lower for x in ['<html', '<div', '<span', 'href=', '<body', '</html']):
        return 'html'
    elif any(x in content_lower for x in ['#', '##', '**', '*', '[', '](', '<!--']):
        return 'markdown'
    elif any(x in content for x in ['├──', '└──', '│', '→', '🌟', '🔄', '🚀', '🔧', '📊']):
        return 'text'
    
    # Check previous line context
    if any(x in prev_lower for x in ['yaml', 'configuration', 'config']):
        return 'yaml'
    elif any(x in prev_lower for x in ['json', 'object', 'data']):
        return 'json'
    elif any(x in prev_lower for x in ['command', 'script', 'bash', 'shell']):
        return 'bash'
    elif any(x in prev_lower for x in ['example', 'template', 'format']):
        return 'text'
    elif any(x in prev_lower for x in ['announcement', 'visual', 'display']):
        return 'text'
    
    # Default to text for unclear cases
    return 'text'

if __name__ == "__main__":
    print("Fixing code blocks that need language specifications...")
    fixes = fix_unspecified_code_blocks("docs")
    
    print(f"\nFixed {len(fixes)} code blocks:")
    
    # Group by language
    by_language = {}
    for fix in fixes:
        lang = fix['language']
        if lang not in by_language:
            by_language[lang] = []
        by_language[lang].append(fix)
    
    for lang, lang_fixes in by_language.items():
        print(f"\n{lang}: {len(lang_fixes)} blocks")
        for fix in lang_fixes[:5]:  # Show first 5 of each type
            print(f"  {fix['file']}:{fix['line']}")
        if len(lang_fixes) > 5:
            print(f"  ... and {len(lang_fixes) - 5} more")