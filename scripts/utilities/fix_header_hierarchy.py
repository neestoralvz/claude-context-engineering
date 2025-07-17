#!/usr/bin/env python3
import os
import re
import glob

def fix_header_hierarchy(root_dir):
    """Fix header hierarchy violations by consolidating and restructuring."""
    fixes = []
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            modified = False
            new_lines = []
            i = 0
            
            while i < len(lines):
                line = lines[i]
                
                # Check for fourth-level header (####)
                if line.startswith('#### '):
                    # Convert to third-level with strategic consolidation
                    header_text = line[5:]  # Remove #### and space
                    
                    # Check if this is part of a larger section that can be consolidated
                    if should_consolidate_header(header_text, lines, i):
                        # Convert to third-level header
                        new_lines.append(f'### {header_text}')
                        modified = True
                        fixes.append({
                            'file': os.path.relpath(file_path, root_dir),
                            'line': i + 1,
                            'change': f'#### -> ###',
                            'text': header_text
                        })
                    else:
                        # Consolidate with previous section as a subsection
                        new_lines.append(f'**{header_text}**')
                        modified = True
                        fixes.append({
                            'file': os.path.relpath(file_path, root_dir),
                            'line': i + 1,
                            'change': f'#### -> **bold**',
                            'text': header_text
                        })
                
                # Check for fifth-level header (#####)
                elif line.startswith('##### '):
                    header_text = line[6:]  # Remove ##### and space
                    # Always convert fifth-level to bold text
                    new_lines.append(f'**{header_text}**')
                    modified = True
                    fixes.append({
                        'file': os.path.relpath(file_path, root_dir),
                        'line': i + 1,
                        'change': f'##### -> **bold**',
                        'text': header_text
                    })
                
                else:
                    new_lines.append(line)
                
                i += 1
            
            # Write back the file if modified
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return fixes

def should_consolidate_header(header_text, lines, current_index):
    """Determine if a fourth-level header should become third-level or be consolidated."""
    # Strategic consolidation rules
    
    # 1. If it's a major section (contains key terms), make it third-level
    major_section_keywords = [
        'implementation', 'protocol', 'architecture', 'framework', 'system',
        'workflow', 'process', 'method', 'strategy', 'approach', 'pattern',
        'overview', 'setup', 'configuration', 'usage', 'examples', 'guide'
    ]
    
    if any(keyword in header_text.lower() for keyword in major_section_keywords):
        return True
    
    # 2. If it has substantial content (>5 lines until next header), make it third-level
    content_lines = 0
    for i in range(current_index + 1, min(len(lines), current_index + 20)):
        if lines[i].startswith('#'):
            break
        if lines[i].strip():  # Non-empty line
            content_lines += 1
    
    if content_lines > 5:
        return True
    
    # 3. If it's the first of several similar headers, consolidate as bold
    return False

def analyze_header_structure(root_dir):
    """Analyze current header structure to understand the scope of changes needed."""
    stats = {
        'files_with_violations': 0,
        'fourth_level_headers': 0,
        'fifth_level_headers': 0,
        'problematic_files': []
    }
    
    for file_path in glob.glob(f"{root_dir}/**/*.md", recursive=True):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            fourth_level = len([line for line in lines if line.startswith('#### ')])
            fifth_level = len([line for line in lines if line.startswith('##### ')])
            
            if fourth_level > 0 or fifth_level > 0:
                stats['files_with_violations'] += 1
                stats['fourth_level_headers'] += fourth_level
                stats['fifth_level_headers'] += fifth_level
                
                rel_path = os.path.relpath(file_path, root_dir)
                stats['problematic_files'].append({
                    'file': rel_path,
                    'fourth_level': fourth_level,
                    'fifth_level': fifth_level
                })
                
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
    
    return stats

if __name__ == "__main__":
    print("Analyzing header hierarchy violations...")
    stats = analyze_header_structure("docs")
    
    print(f"\nCurrent violations:")
    print(f"Files with violations: {stats['files_with_violations']}")
    print(f"Fourth-level headers (####): {stats['fourth_level_headers']}")
    print(f"Fifth-level headers (#####): {stats['fifth_level_headers']}")
    
    print(f"\nTop 10 most problematic files:")
    problematic_sorted = sorted(stats['problematic_files'], 
                               key=lambda x: x['fourth_level'] + x['fifth_level'], 
                               reverse=True)
    
    for file_info in problematic_sorted[:10]:
        print(f"  {file_info['file']}: ####={file_info['fourth_level']}, #####={file_info['fifth_level']}")
    
    print(f"\nFixing header hierarchy violations...")
    fixes = fix_header_hierarchy("docs")
    
    print(f"\nFixed {len(fixes)} header violations:")
    
    # Group by change type
    by_change_type = {}
    for fix in fixes:
        change_type = fix['change']
        if change_type not in by_change_type:
            by_change_type[change_type] = []
        by_change_type[change_type].append(fix)
    
    for change_type, type_fixes in by_change_type.items():
        print(f"\n{change_type}: {len(type_fixes)} changes")
        for fix in type_fixes[:5]:  # Show first 5 of each type
            print(f"  {fix['file']}:{fix['line']} - {fix['text'][:50]}...")
        if len(type_fixes) > 5:
            print(f"  ... and {len(type_fixes) - 5} more")