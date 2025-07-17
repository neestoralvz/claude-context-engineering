#!/usr/bin/env python3
"""
Comprehensive validation of all internal links and references in the principle system.
Checks for broken links, missing files, incorrect anchors, and cross-reference integrity.
"""

import re
import os
import json
from pathlib import Path
from collections import defaultdict

class LinkValidator:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.errors = []
        self.warnings = []
        self.checked_files = set()
        
    def validate_all_principle_files(self):
        """Validate all files in the principles directory"""
        principles_dir = self.base_dir / "docs" / "knowledge" / "principles"
        
        # Get all markdown files
        md_files = list(principles_dir.rglob("*.md"))
        
        print(f"Found {len(md_files)} principle files to validate:")
        for file in sorted(md_files):
            print(f"  {file.relative_to(self.base_dir)}")
        print()
        
        # Validate each file
        for file_path in sorted(md_files):
            self.validate_file_links(file_path)
            
        # Also validate key system files that reference principles
        system_files = [
            self.base_dir / "CLAUDE.md",
            self.base_dir / "docs" / "knowledge" / "README.md",
            self.base_dir / "docs" / "commands" / "README.md"
        ]
        
        for file_path in system_files:
            if file_path.exists():
                self.validate_file_links(file_path)
        
        return self.generate_report()
    
    def extract_links(self, content):
        """Extract all markdown links from content"""
        # Pattern for [text](link) and [text](link#anchor)
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        return re.findall(link_pattern, content)
    
    def validate_file_links(self, file_path):
        """Validate all links in a single file"""
        if not file_path.exists():
            self.errors.append(f"FILE NOT FOUND: {file_path}")
            return
            
        self.checked_files.add(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            self.errors.append(f"ERROR READING {file_path}: {e}")
            return
        
        links = self.extract_links(content)
        file_rel = file_path.relative_to(self.base_dir)
        
        for text, link in links:
            self.validate_single_link(file_path, file_rel, text, link, content)
    
    def validate_single_link(self, source_file, source_rel, text, link, content):
        """Validate a single link"""
        # Skip external links
        if link.startswith(('http://', 'https://', 'mailto:')):
            return
            
        # Handle anchor-only links (#section) 
        if link.startswith('#'):
            self.validate_anchor(source_file, source_rel, text, link, content)
            return
            
        # Split link and anchor
        if '#' in link:
            link_path, anchor = link.split('#', 1)
        else:
            link_path = link
            anchor = None
            
        # Resolve the target path
        target_path = self.resolve_link_path(source_file, link_path)
        
        if not target_path.exists():
            self.errors.append(f"{source_rel}: BROKEN LINK [{text}]({link}) -> {target_path.relative_to(self.base_dir)} NOT FOUND")
            return
            
        # If there's an anchor, validate it exists in the target file
        if anchor and target_path.suffix == '.md':
            self.validate_anchor_in_file(source_rel, text, link, target_path, anchor)
    
    def resolve_link_path(self, source_file, link_path):
        """Resolve a link path relative to the source file"""
        if link_path.startswith('./'):
            # Relative to current directory
            return (source_file.parent / link_path[2:]).resolve()
        elif link_path.startswith('../'):
            # Relative to parent directory  
            return (source_file.parent / link_path).resolve()
        else:
            # Relative to base directory
            return (self.base_dir / link_path).resolve()
    
    def validate_anchor(self, source_file, source_rel, text, anchor, content):
        """Validate an anchor exists in the current file"""
        anchor_id = anchor[1:]  # Remove #
        
        # Look for headers that would generate this anchor
        header_patterns = [
            rf'^#{1,6}\s+.*{re.escape(anchor_id)}.*$',  # Direct match
            rf'^#{1,6}\s+.*{re.escape(anchor_id.replace("-", " "))}.*$',  # With spaces
            rf'^#{1,6}\s+.*{re.escape(anchor_id.replace("-", ""))}.*$',  # Without dashes
        ]
        
        found = False
        for pattern in header_patterns:
            if re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                found = True
                break
        
        if not found:
            self.warnings.append(f"{source_rel}: ANCHOR NOT FOUND [{text}]({anchor}) - no matching header found")
    
    def validate_anchor_in_file(self, source_rel, text, link, target_path, anchor):
        """Validate an anchor exists in a target file"""
        try:
            with open(target_path, 'r', encoding='utf-8') as f:
                target_content = f.read()
        except Exception as e:
            self.errors.append(f"{source_rel}: ERROR READING TARGET {target_path.relative_to(self.base_dir)}: {e}")
            return
            
        # Look for headers that would generate this anchor
        anchor_patterns = [
            rf'^#{1,6}\s+.*{re.escape(anchor)}.*$',  # Direct match
            rf'^#{1,6}\s+.*{re.escape(anchor.replace("-", " "))}.*$',  # With spaces  
            rf'^#{1,6}\s+.*{re.escape(anchor.replace("-", ""))}.*$',  # Without dashes
        ]
        
        found = False
        for pattern in anchor_patterns:
            if re.search(pattern, target_content, re.MULTILINE | re.IGNORECASE):
                found = True
                break
        
        if not found:
            target_rel = target_path.relative_to(self.base_dir)
            self.warnings.append(f"{source_rel}: ANCHOR NOT FOUND [{text}]({link}) - no matching header in {target_rel}")
    
    def generate_report(self):
        """Generate a comprehensive validation report"""
        total_issues = len(self.errors) + len(self.warnings)
        
        report = {
            "validation_summary": {
                "files_checked": len(self.checked_files),
                "total_errors": len(self.errors),
                "total_warnings": len(self.warnings),
                "total_issues": total_issues,
                "status": "FAILED" if self.errors else ("WARNINGS" if self.warnings else "PASSED")
            },
            "errors": self.errors,
            "warnings": self.warnings,
            "checked_files": [str(f.relative_to(self.base_dir)) for f in sorted(self.checked_files)]
        }
        
        # Print summary
        print("=" * 80)
        print("LINK VALIDATION REPORT")
        print("=" * 80)
        print(f"Files checked: {len(self.checked_files)}")
        print(f"Errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")
        print(f"Status: {report['validation_summary']['status']}")
        print()
        
        if self.errors:
            print("ERRORS (Broken Links):")
            print("-" * 40)
            for error in self.errors:
                print(f"  ❌ {error}")
            print()
        
        if self.warnings:
            print("WARNINGS (Anchor Issues):")
            print("-" * 40)
            for warning in self.warnings:
                print(f"  ⚠️  {warning}")
            print()
        
        if not self.errors and not self.warnings:
            print("✅ All links validate successfully!")
        
        return report

def main():
    base_dir = "/Users/nalve/claude-context-engineering"
    validator = LinkValidator(base_dir)
    
    print("Starting comprehensive link validation...")
    print(f"Base directory: {base_dir}")
    print()
    
    report = validator.validate_all_principle_files()
    
    # Save detailed report
    report_file = Path(base_dir) / "scripts" / "results" / "system-integrity" / "link-validation-report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Detailed report saved to: {report_file.relative_to(Path(base_dir))}")
    
    # Return appropriate exit code
    return len(validator.errors)

if __name__ == "__main__":
    exit(main())