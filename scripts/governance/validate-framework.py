#!/usr/bin/env python3
"""
Quick validation script for deduplication prevention framework
"""

import sys
import os
import json
from pathlib import Path

def main():
    print("🔍 VALIDATING: Deduplication Prevention Framework Components...")
    
    # Get script directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    
    validation_results = {
        "component_files": {},
        "configuration": {},
        "directory_structure": {},
        "integration_points": {}
    }
    
    # 1. Validate component files
    print("\n📋 CHECKING: Framework component files...")
    
    required_files = [
        "deduplication-prevention-framework.py",
        "automated-deduplication-monitor.sh", 
        "deduplication-governance-config.json"
    ]
    
    for file_name in required_files:
        file_path = script_dir / file_name
        if file_path.exists():
            validation_results["component_files"][file_name] = "✅ EXISTS"
            print(f"  ✅ {file_name}")
        else:
            validation_results["component_files"][file_name] = "❌ MISSING"
            print(f"  ❌ {file_name}")
    
    # 2. Validate configuration
    print("\n⚙️ CHECKING: Configuration file...")
    
    config_file = script_dir / "deduplication-governance-config.json"
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            
            # Check key configuration sections
            required_sections = [
                "framework_config",
                "integration_points", 
                "reporting_config",
                "maintenance_schedule"
            ]
            
            for section in required_sections:
                if section in config:
                    validation_results["configuration"][section] = "✅ PRESENT"
                    print(f"  ✅ {section}")
                else:
                    validation_results["configuration"][section] = "❌ MISSING"
                    print(f"  ❌ {section}")
                    
        except json.JSONDecodeError as e:
            validation_results["configuration"]["json_valid"] = f"❌ INVALID JSON: {e}"
            print(f"  ❌ Invalid JSON: {e}")
    else:
        validation_results["configuration"]["file_exists"] = "❌ CONFIG FILE MISSING"
        print("  ❌ Configuration file missing")
    
    # 3. Validate directory structure
    print("\n📁 CHECKING: Directory structure...")
    
    required_dirs = [
        ("docs/commands", "Commands directory"),
        ("docs/knowledge/protocols", "Protocols directory"),
        ("docs/operations/handoffs", "Handoffs directory"),
        ("scripts/results", "Results directory")
    ]
    
    for dir_path, description in required_dirs:
        full_path = project_root / dir_path
        if full_path.exists():
            validation_results["directory_structure"][dir_path] = "✅ EXISTS"
            print(f"  ✅ {description}: {dir_path}")
        else:
            validation_results["directory_structure"][dir_path] = "❌ MISSING"
            print(f"  ❌ {description}: {dir_path}")
    
    # 4. Validate integration points
    print("\n🔗 CHECKING: Integration points...")
    
    integration_files = [
        ("docs/knowledge/protocols/automated-deduplication-prevention-protocol.md", "Protocol documentation"),
        ("docs/operations/handoffs/HANDOFF_AUTOMATED_DEDUPLICATION_PREVENTION_FRAMEWORK.md", "Handoff documentation")
    ]
    
    for file_path, description in integration_files:
        full_path = project_root / file_path
        if full_path.exists():
            validation_results["integration_points"][file_path] = "✅ EXISTS"
            print(f"  ✅ {description}")
        else:
            validation_results["integration_points"][file_path] = "❌ MISSING"
            print(f"  ❌ {description}")
    
    # 5. Calculate overall validation score
    print("\n📊 VALIDATION SUMMARY:")
    
    total_checks = 0
    passed_checks = 0
    
    for category, checks in validation_results.items():
        for check, result in checks.items():
            total_checks += 1
            if "✅" in result:
                passed_checks += 1
    
    success_rate = (passed_checks / total_checks) * 100 if total_checks > 0 else 0
    
    print(f"  📋 Total Checks: {total_checks}")
    print(f"  ✅ Passed: {passed_checks}")
    print(f"  ❌ Failed: {total_checks - passed_checks}")
    print(f"  📊 Success Rate: {success_rate:.1f}%")
    
    # 6. Overall status
    if success_rate >= 95:
        print(f"\n🟢 FRAMEWORK STATUS: FULLY OPERATIONAL ({success_rate:.1f}%)")
        return True
    elif success_rate >= 80:
        print(f"\n🟡 FRAMEWORK STATUS: MOSTLY OPERATIONAL ({success_rate:.1f}%)")
        return True
    else:
        print(f"\n🔴 FRAMEWORK STATUS: NEEDS ATTENTION ({success_rate:.1f}%)")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)