#!/usr/bin/env python3
import os
import re
import glob
from urllib.parse import unquote

def validate_cross_references(root_dir):
    """Validate and optimize cross-references across all markdown files."""
    issues = []
    fixes = []
    all_files = {}
    
    # Build index of all markdown files
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        rel_path = os.path.relpath(file_path, root_dir)
        all_files[rel_path] = file_path
        # Also index without extension
        base_name = os.path.splitext(rel_path)[0]
        all_files[base_name] = file_path
    
    print(f"Indexed {len(all_files)} markdown files...")
    
    # Patterns for finding references
    link_patterns = [
        r'\[([^\]]*)\]\(([^)]+)\)',  # [text](link)
        r'\[([^\]]*)\]\[([^\]]*)\]', # [text][ref]
        r']\(([^)]+\.md[^)]*)\)',    # Direct .md links
    ]
    
    total_references = 0
    broken_references = 0
    standardized_references = 0
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            file_dir = os.path.dirname(file_path)
            rel_file_path = os.path.relpath(file_path, root_dir)
            modified = False
            new_lines = []
            
            for line_num, line in enumerate(lines, 1):
                new_line = line
                
                # Find markdown links
                for pattern in link_patterns:
                    matches = re.finditer(pattern, line)
                    for match in matches:
                        total_references += 1
                        if len(match.groups()) >= 2:
                            link_text = match.group(1)
                            link_url = match.group(2)
                        else:
                            link_url = match.group(1)
                            link_text = ""
                        
                        # Skip external links
                        if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
                            continue
                        
                        # Decode URL encoding
                        decoded_url = unquote(link_url)
                        
                        # Handle anchors
                        if '#' in decoded_url:
                            file_part, anchor = decoded_url.split('#', 1)
                        else:
                            file_part = decoded_url
                            anchor = None
                        
                        if not file_part or file_part == '.':
                            continue  # Same file reference
                        
                        # Resolve relative path
                        if file_part.startswith('./'):
                            file_part = file_part[2:]
                        elif file_part.startswith('../'):
                            # Handle relative paths
                            current_dir = os.path.dirname(rel_file_path)
                            target_path = os.path.normpath(os.path.join(current_dir, file_part))
                        else:
                            target_path = file_part
                        
                        # Check if file exists
                        target_exists = False
                        potential_paths = [
                            target_path,
                            target_path + '.md' if not target_path.endswith('.md') else target_path,
                            os.path.join('docs', target_path),
                            os.path.join('docs', target_path + '.md'),
                        ]
                        
                        for potential_path in potential_paths:
                            if potential_path in all_files:
                                target_exists = True
                                break
                            # Also check actual file existence
                            full_path = os.path.join(root_dir, potential_path)
                            if os.path.exists(full_path):
                                target_exists = True
                                break
                        
                        if not target_exists:
                            broken_references += 1
                            issues.append({
                                'file': rel_file_path,
                                'line': line_num,
                                'issue': 'broken_link',
                                'link': link_url,
                                'text': link_text
                            })
                        
                        # Standardize relative path format
                        if '../' in link_url or './' in link_url:
                            # Try to standardize to a consistent format
                            if link_url.startswith('../'):
                                # Count how many levels up
                                levels_up = link_url.count('../')
                                cleaned_url = link_url.replace('../', '')
                                
                                # Convert to consistent format if possible
                                if not cleaned_url.startswith('docs/'):
                                    standardized_url = f"../{cleaned_url}"
                                    if standardized_url != link_url:
                                        new_line = new_line.replace(link_url, standardized_url)
                                        modified = True
                                        standardized_references += 1
                                        fixes.append({
                                            'file': rel_file_path,
                                            'line': line_num,
                                            'change': f'{link_url} → {standardized_url}',
                                            'type': 'standardization'
                                        })
                
                new_lines.append(new_line)
            
            # Write back if modified
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))
                
        except Exception as e:
            issues.append({
                'file': os.path.relpath(file_path, root_dir),
                'line': 0,
                'issue': 'read_error',
                'error': str(e)
            })
    
    return {
        'total_references': total_references,
        'broken_references': broken_references,
        'standardized_references': standardized_references,
        'issues': issues,
        'fixes': fixes
    }

def analyze_cross_reference_patterns(root_dir):
    """Analyze cross-reference patterns to understand the scope."""
    patterns = {
        'internal_md_links': 0,
        'external_links': 0,
        'anchor_links': 0,
        'relative_up_links': 0,
        'relative_down_links': 0,
        'absolute_links': 0
    }
    
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            matches = re.findall(link_pattern, content)
            for text, url in matches:
                if url.startswith(('http://', 'https://')):
                    patterns['external_links'] += 1
                elif url.startswith('#'):
                    patterns['anchor_links'] += 1
                elif url.endswith('.md'):
                    patterns['internal_md_links'] += 1
                    if '../' in url:
                        patterns['relative_up_links'] += 1
                    elif './' in url:
                        patterns['relative_down_links'] += 1
                    elif url.startswith('/'):
                        patterns['absolute_links'] += 1
                        
        except Exception:
            continue
    
    return patterns

if __name__ == "__main__":
    print("Analyzing cross-reference patterns...")
    patterns = analyze_cross_reference_patterns("docs")
    
    print(f"\nCross-reference analysis:")
    for pattern, count in patterns.items():
        print(f"  {pattern}: {count}")
    
    print(f"\nValidating and optimizing cross-references...")
    results = validate_cross_references("docs")
    
    print(f"\nCross-reference validation results:")
    print(f"Total references analyzed: {results['total_references']}")
    print(f"Broken references found: {results['broken_references']}")
    print(f"References standardized: {results['standardized_references']}")
    print(f"Issues identified: {len(results['issues'])}")
    print(f"Fixes applied: {len(results['fixes'])}")
    
    if results['issues']:
        print(f"\nTop 10 issues:")
        for issue in results['issues'][:10]:
            if issue['issue'] == 'broken_link':
                print(f"  {issue['file']}:{issue['line']} - Broken link: {issue['link']}")
            else:
                print(f"  {issue['file']}:{issue['line']} - {issue['issue']}: {issue.get('error', 'Unknown')}")
    
    if results['fixes']:
        print(f"\nTop 10 fixes applied:")
        for fix in results['fixes'][:10]:
            print(f"  {fix['file']}:{fix['line']} - {fix['change']}")
    
    # Calculate improvement metrics
    if results['total_references'] > 0:
        integrity_rate = ((results['total_references'] - results['broken_references']) / results['total_references']) * 100
        standardization_rate = (results['standardized_references'] / results['total_references']) * 100
        
        print(f"\nIntegrity metrics:")
        print(f"  Link integrity rate: {integrity_rate:.1f}%")
        print(f"  Standardization improvements: {standardization_rate:.1f}%")
        
        if results['broken_references'] > 0:
            print(f"  Attention needed: {results['broken_references']} broken references require manual review")