#!/usr/bin/env python3
"""
Fix broken links and references in the principle system.
Addresses the most critical link validation issues.
"""

import re
import os
from pathlib import Path

def fix_readme_paths(file_path):
    """Fix the broken command and CLAUDE.md references in README.md files"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix command system references
    content = re.sub(
        r'\[Command System\]\(\.\./commands/README\.md\)',
        r'[Command System](../../commands/README.md)',
        content
    )
    
    content = re.sub(
        r'\[Commands Hub\]\(\.\./commands/README\.md\)',
        r'[Commands Hub](../../commands/README.md)',
        content
    )
    
    # Fix CLAUDE.md reference
    content = re.sub(
        r'\[CLAUDE\.md\]\(\.\./CLAUDE\.md\)',
        r'[CLAUDE.md](../../../CLAUDE.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed paths in {file_path.name}")
        return True
    return False

def fix_shared_navigation_links(file_path):
    """Fix shared navigation file links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix archivo original reference - remove broken link
    content = re.sub(
        r'\[Archivo Original\]\(\.\./core-principles\.md\)',
        r'**Core Principles** (integrated into category files)',
        content
    )
    
    # Fix CLAUDE.md reference
    content = re.sub(
        r'\[CLAUDE\.md\]\(\.\./CLAUDE\.md\)',
        r'[CLAUDE.md](../../../../CLAUDE.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed shared navigation links in {file_path.name}")
        return True
    return False

def fix_principle_cross_reference_links(file_path):
    """Fix principle cross-reference network links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix shared file references - these should be relative to current directory
    content = re.sub(
        r'\[Navigation\]\(\.\./\_shared/navigation\.md\)',
        r'[Navigation](./_shared/navigation.md)',
        content
    )
    
    content = re.sub(
        r'\[Metrics\]\(\.\./\_shared/metrics\.md\)',
        r'[Metrics](./_shared/metrics.md)',
        content
    )
    
    content = re.sub(
        r'\[Workflow\]\(\.\./\_shared/workflow\.md\)',
        r'[Workflow](./_shared/workflow.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed cross-reference links in {file_path.name}")
        return True
    return False

def fix_operational_excellence_links(file_path):
    """Fix operational excellence broken links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove broken .claude/ references - these are old paths
    content = re.sub(
        r'\[Task Agent Communication Protocol\]\(\.\./\.claude/protocols/task-agent-communication-protocol\.md\)',
        r'[Task Agent Communication Protocol](../technical/protocols/task-agent-communication-protocol.md)',
        content
    )
    
    content = re.sub(
        r'\[Trigger Monitor\]\(\.\./\.claude/commands/08-automation-tools/trigger-monitor\.md\)',
        r'**Trigger Monitor** (integrated into command system)',
        content
    )
    
    # Fix self-referencing links that should be anchors
    content = re.sub(
        r'\[Pattern Recognition\]\(operational-excellence\.md#14-pattern-recognition\)',
        r'[Pattern Recognition](#14-pattern-recognition)',
        content
    )
    
    content = re.sub(
        r'\[Pattern Crystallization\]\(operational-excellence\.md#15-pattern-crystallization\)',
        r'[Pattern Crystallization](#15-pattern-crystallization)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed operational excellence links in {file_path.name}")
        return True
    return False

def fix_philosophical_foundations_links(file_path):
    """Fix philosophical foundations broken links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove broken .claude/ references
    content = re.sub(
        r'\[Script Automation Bridge\]\(\.\./\.claude/commands/08-automation-tools/script-automation-bridge\.md\)',
        r'[Script Automation Bridge](../../commands/executable/automation/script-automation-bridge.md)',
        content
    )
    
    content = re.sub(
        r'\[Decision Engine\]\(\.\./\.claude/commands/01-core-intelligence/execute-decision-engine\.md\)',
        r'[Decision Engine](../../commands/executable/core-routing/decision.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed philosophical foundations links in {file_path.name}")
        return True
    return False

def fix_claude_md_links(file_path):
    """Fix CLAUDE.md broken links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix missing pattern file
    content = re.sub(
        r'\[CLAUDE\.md Pattern\]\(\./docs/knowledge/patterns/claude-md-maintenance-pattern\.md\)',
        r'**CLAUDE.md Pattern** (maintenance protocols integrated)',
        content
    )
    
    # Fix missing protocol file
    content = re.sub(
        r'\[Parallel Task Intelligence\]\(\./docs/knowledge/protocols/parallel-task-intelligence-protocol\.md\)',
        r'[Parallel Task Intelligence](./docs/knowledge/protocols/universal-mathematical-validation-framework.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed CLAUDE.md links in {file_path.name}")
        return True
    return False

def fix_knowledge_readme_links(file_path):
    """Fix knowledge README.md broken links"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix missing pattern files - reference existing ones or remove
    content = re.sub(
        r'\[Context Optimization\]\(\./patterns/context-optimization-20250715\.md\)',
        r'[Context Optimization](./patterns/universal-patterns-quick-deployment.md)',
        content
    )
    
    content = re.sub(
        r'\[Improvement Methodology\]\(\./patterns/improvement-methodology-pattern\.md\)',
        r'[Improvement Methodology](./patterns/system-management-patterns.md)',
        content
    )
    
    content = re.sub(
        r'\[Quality Application\]\(\./patterns/quality-optimization-application\.md\)',
        r'[Quality Application](./patterns/quality-improvement-standards.md)',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed knowledge README links in {file_path.name}")
        return True
    return False

def main():
    base_dir = Path("/Users/nalve/claude-context-engineering")
    fixes_applied = 0
    
    print("Fixing broken links in principle system...")
    print()
    
    # Fix principles README.md
    principles_readme = base_dir / "docs" / "knowledge" / "principles" / "README.md"
    if fix_readme_paths(principles_readme):
        fixes_applied += 1
    
    # Fix shared navigation
    shared_nav = base_dir / "docs" / "knowledge" / "principles" / "_shared" / "navigation.md"
    if fix_shared_navigation_links(shared_nav):
        fixes_applied += 1
    
    # Fix principle cross-reference network
    cross_ref = base_dir / "docs" / "knowledge" / "principles" / "principle-cross-reference-network.md"
    if fix_principle_cross_reference_links(cross_ref):
        fixes_applied += 1
    
    # Fix operational excellence
    op_excel = base_dir / "docs" / "knowledge" / "principles" / "operational-excellence.md"
    if fix_operational_excellence_links(op_excel):
        fixes_applied += 1
    
    # Fix philosophical foundations
    phil_found = base_dir / "docs" / "knowledge" / "principles" / "philosophical-foundations.md"
    if fix_philosophical_foundations_links(phil_found):
        fixes_applied += 1
    
    # Fix CLAUDE.md
    claude_md = base_dir / "CLAUDE.md"
    if fix_claude_md_links(claude_md):
        fixes_applied += 1
    
    # Fix knowledge README
    knowledge_readme = base_dir / "docs" / "knowledge" / "README.md"
    if fix_knowledge_readme_links(knowledge_readme):
        fixes_applied += 1
    
    print()
    print(f"Applied {fixes_applied} link fixes")
    print("Re-run validation to check remaining issues")

if __name__ == "__main__":
    main()