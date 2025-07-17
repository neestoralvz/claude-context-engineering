#!/usr/bin/env python3
import os
import re
import glob

def find_unspecified_code_blocks(root_dir):
    """Find code blocks that should have language specifications but don't."""
    problems = []
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
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
                                
                                rel_path = os.path.relpath(file_path, root_dir)
                                problems.append({
                                    'file': rel_path,
                                    'line': i + 1,
                                    'suggested_language': language,
                                    'content_preview': lines[i+1].strip()[:50] + '...' if len(lines[i+1].strip()) > 50 else lines[i+1].strip()
                                })
                i += 1
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return problems

def guess_language(content, prev_line):
    """Guess the appropriate language for a code block."""
    content_lower = content.lower()
    prev_lower = prev_line.lower()
    
    # Check content patterns
    if any(x in content_lower for x in ['{', '}', '":', ': "', ': [']):
        return 'json'
    elif any(x in content_lower for x in [':', '- ', 'version:', 'name:']):
        return 'yaml'
    elif any(x in content_lower for x in ['$', 'cd ', 'ls ', 'grep ', 'echo ', '#!/']):
        return 'bash'
    elif any(x in content_lower for x in ['def ', 'import ', 'print(', 'class ']):
        return 'python'
    elif any(x in content_lower for x in ['function ', 'const ', 'let ', 'var ', '=>']):
        return 'javascript'
    elif any(x in content_lower for x in ['<', '>', 'href=', 'div', 'span']):
        return 'html'
    elif any(x in content_lower for x in ['#', '##', '**', '*', '[', '](']):
        return 'markdown'
    
    # Check previous line context
    if any(x in prev_lower for x in ['yaml', 'configuration', 'config']):
        return 'yaml'
    elif any(x in prev_lower for x in ['json', 'object', 'data']):
        return 'json'
    elif any(x in prev_lower for x in ['command', 'script', 'bash', 'shell']):
        return 'bash'
    elif any(x in prev_lower for x in ['example', 'markdown']):
        return 'markdown'
    
    return 'text'

if __name__ == "__main__":
    problems = find_unspecified_code_blocks("docs")
    
    print(f"Found {len(problems)} code blocks that need language specifications:\n")
    
    for problem in problems[:20]:  # Show first 20
        print(f"File: {problem['file']}:{problem['line']}")
        print(f"  Suggested: {problem['suggested_language']}")
        print(f"  Content: {problem['content_preview']}")
        print()