#!/usr/bin/env python3
"""
Containerization Principle Enforcement Engine

Automatic enforcement of Principles #101-104 with real-time validation and blocking.
Integrates with Claude Code execution to ensure containerization compliance.
"""

import os
import sys
import json
import subprocess
import re
import yaml
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class EnforcementResult:
    """Result of principle enforcement check"""
    principle_id: str
    compliant: bool
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    message: str
    remediation: Optional[str] = None
    blocking: bool = False

class ContainerizationEnforcer:
    """
    Enforcement engine for containerization principles #101-104
    """
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.results: List[EnforcementResult] = []
        
    def enforce_all_principles(self) -> List[EnforcementResult]:
        """Execute all containerization principle enforcement"""
        self.results = []
        
        # Principle #101: Container-First Development
        self.results.extend(self._enforce_principle_101())
        
        # Principle #102: Multi-Architecture Support  
        self.results.extend(self._enforce_principle_102())
        
        # Principle #103: Security Hardening
        self.results.extend(self._enforce_principle_103())
        
        # Principle #104: Performance Optimization
        self.results.extend(self._enforce_principle_104())
        
        return self.results
    
    def _enforce_principle_101(self) -> List[EnforcementResult]:
        """Principle #101: Container-First Development Strategy"""
        results = []
        
        # Check for Dockerfile presence
        dockerfile_path = self.project_path / "Dockerfile"
        if not dockerfile_path.exists():
            results.append(EnforcementResult(
                principle_id="101",
                compliant=False,
                severity="CRITICAL",
                message="🚨 BLOCKING: No Dockerfile found - Container-First Development MANDATORY",
                remediation="Run `/containerize [project]` to generate production-ready Dockerfile",
                blocking=True
            ))
        else:
            # Validate Dockerfile compliance
            dockerfile_content = dockerfile_path.read_text()
            
            # Check for multi-stage build
            if "FROM" not in dockerfile_content or dockerfile_content.count("FROM") < 2:
                results.append(EnforcementResult(
                    principle_id="101",
                    compliant=False,
                    severity="HIGH", 
                    message="⚠️ Dockerfile missing multi-stage build pattern (Principle #101 requirement)",
                    remediation="Update Dockerfile to use multi-stage builds: builder + runtime stages"
                ))
        
        # Check for docker-compose.yml
        compose_path = self.project_path / "docker-compose.yml"
        if not compose_path.exists():
            results.append(EnforcementResult(
                principle_id="101",
                compliant=False,
                severity="HIGH",
                message="⚠️ No docker-compose.yml found - Development environment setup incomplete",
                remediation="Run `/docker-deploy development` to generate development environment"
            ))
        
        # Check for .dockerignore
        dockerignore_path = self.project_path / ".dockerignore"
        if not dockerignore_path.exists():
            results.append(EnforcementResult(
                principle_id="101", 
                compliant=False,
                severity="MEDIUM",
                message="⚠️ No .dockerignore found - Build optimization missing",
                remediation="Create .dockerignore to optimize build context and security"
            ))
        
        # If all checks pass
        if not results:
            results.append(EnforcementResult(
                principle_id="101",
                compliant=True,
                severity="LOW",
                message="✅ Container-First Development: All requirements satisfied"
            ))
            
        return results
    
    def _enforce_principle_102(self) -> List[EnforcementResult]:
        """Principle #102: Multi-Architecture Container Support"""
        results = []
        
        dockerfile_path = self.project_path / "Dockerfile"
        if not dockerfile_path.exists():
            return results  # Will be caught by #101
            
        dockerfile_content = dockerfile_path.read_text()
        
        # Check for platform-aware builds
        if "--platform=" not in dockerfile_content and "BUILDPLATFORM" not in dockerfile_content:
            results.append(EnforcementResult(
                principle_id="102",
                compliant=False,
                severity="HIGH",
                message="⚠️ Multi-architecture support missing - ARM64/AMD64 compatibility required",
                remediation="Add --platform=$BUILDPLATFORM to FROM statements for multi-arch support"
            ))
        
        # Check for BuildKit usage in CI/CD
        github_workflows = self.project_path / ".github" / "workflows"
        if github_workflows.exists():
            workflow_files = list(github_workflows.glob("*.yml")) + list(github_workflows.glob("*.yaml"))
            multi_arch_found = False
            
            for workflow_file in workflow_files:
                content = workflow_file.read_text()
                if "linux/amd64,linux/arm64" in content or "buildx" in content:
                    multi_arch_found = True
                    break
            
            if not multi_arch_found:
                results.append(EnforcementResult(
                    principle_id="102",
                    compliant=False,
                    severity="MEDIUM",
                    message="⚠️ CI/CD missing multi-architecture builds",
                    remediation="Add docker buildx with --platform linux/amd64,linux/arm64 to GitHub Actions"
                ))
        
        if not results:
            results.append(EnforcementResult(
                principle_id="102",
                compliant=True,
                severity="LOW", 
                message="✅ Multi-Architecture Support: ARM64/AMD64 compatibility configured"
            ))
            
        return results
    
    def _enforce_principle_103(self) -> List[EnforcementResult]:
        """Principle #103: Container Security Hardening Protocol"""
        results = []
        
        dockerfile_path = self.project_path / "Dockerfile"
        if not dockerfile_path.exists():
            return results  # Will be caught by #101
            
        dockerfile_content = dockerfile_path.read_text()
        
        # Check for non-root user
        if "USER " not in dockerfile_content or "USER root" in dockerfile_content:
            results.append(EnforcementResult(
                principle_id="103",
                compliant=False,
                severity="CRITICAL",
                message="🚨 CRITICAL: Container running as root - Security violation",
                remediation="Add non-root user: RUN groupadd -r app && useradd -r -g app app; USER app",
                blocking=True
            ))
        
        # Check for minimal base image
        base_images = re.findall(r'FROM\s+([^\s]+)', dockerfile_content)
        non_minimal = [img for img in base_images if not any(variant in img.lower() 
                      for variant in ['slim', 'alpine', 'distroless'])]
        
        if non_minimal:
            results.append(EnforcementResult(
                principle_id="103",
                compliant=False,
                severity="HIGH",
                message=f"⚠️ Non-minimal base images detected: {non_minimal}",
                remediation="Use slim/alpine/distroless variants for minimal attack surface"
            ))
        
        # Check for secrets in Dockerfile
        secret_patterns = [r'ENV.*(?:PASSWORD|SECRET|KEY|TOKEN)=\w+', r'ARG.*(?:PASSWORD|SECRET|KEY|TOKEN)=\w+']
        for pattern in secret_patterns:
            if re.search(pattern, dockerfile_content, re.IGNORECASE):
                results.append(EnforcementResult(
                    principle_id="103",
                    compliant=False,
                    severity="CRITICAL",
                    message="🚨 CRITICAL: Secrets detected in Dockerfile - Security violation",
                    remediation="Remove secrets from Dockerfile, use runtime injection",
                    blocking=True
                ))
        
        # Check for security scanning in CI/CD
        github_workflows = self.project_path / ".github" / "workflows"
        if github_workflows.exists():
            workflow_files = list(github_workflows.glob("*.yml")) + list(github_workflows.glob("*.yaml"))
            security_scan_found = False
            
            for workflow_file in workflow_files:
                content = workflow_file.read_text()
                if any(tool in content.lower() for tool in ['docker scout', 'trivy', 'snyk']):
                    security_scan_found = True
                    break
            
            if not security_scan_found:
                results.append(EnforcementResult(
                    principle_id="103",
                    compliant=False,
                    severity="HIGH",
                    message="⚠️ No automated security scanning in CI/CD",
                    remediation="Add Docker Scout or Trivy scanning to GitHub Actions workflow"
                ))
        
        if not results:
            results.append(EnforcementResult(
                principle_id="103",
                compliant=True,
                severity="LOW",
                message="✅ Container Security Hardening: All security requirements satisfied"
            ))
            
        return results
    
    def _enforce_principle_104(self) -> List[EnforcementResult]:
        """Principle #104: Container Performance Optimization Standards"""
        results = []
        
        dockerfile_path = self.project_path / "Dockerfile"
        if not dockerfile_path.exists():
            return results  # Will be caught by #101
            
        dockerfile_content = dockerfile_path.read_text()
        
        # Check for BuildKit cache mounts
        if "--mount=type=cache" not in dockerfile_content:
            results.append(EnforcementResult(
                principle_id="104",
                compliant=False,
                severity="MEDIUM",
                message="⚠️ Missing BuildKit cache optimization",
                remediation="Add --mount=type=cache for pip/npm cache optimization"
            ))
        
        # Check for layer optimization (consolidated RUN commands)
        run_commands = dockerfile_content.count("RUN ")
        if run_commands > 5:  # Threshold for excessive layers
            results.append(EnforcementResult(
                principle_id="104",
                compliant=False,
                severity="MEDIUM",
                message=f"⚠️ Too many RUN commands ({run_commands}) - Layer optimization needed",
                remediation="Consolidate RUN commands to reduce image layers"
            ))
        
        # Check for health checks
        if "HEALTHCHECK" not in dockerfile_content:
            results.append(EnforcementResult(
                principle_id="104",
                compliant=False,
                severity="MEDIUM",
                message="⚠️ No health check configured",
                remediation="Add HEALTHCHECK instruction for container orchestration"
            ))
        
        # Check docker-compose for resource limits
        compose_path = self.project_path / "docker-compose.yml"
        if compose_path.exists():
            try:
                compose_content = yaml.safe_load(compose_path.read_text())
                services = compose_content.get('services', {})
                
                for service_name, service_config in services.items():
                    deploy = service_config.get('deploy', {})
                    resources = deploy.get('resources', {})
                    limits = resources.get('limits', {})
                    
                    if not limits.get('memory') or not limits.get('cpus'):
                        results.append(EnforcementResult(
                            principle_id="104",
                            compliant=False,
                            severity="MEDIUM",
                            message=f"⚠️ Service '{service_name}' missing resource limits",
                            remediation="Add memory and CPU limits in docker-compose.yml deploy.resources.limits"
                        ))
            except yaml.YAMLError:
                results.append(EnforcementResult(
                    principle_id="104",
                    compliant=False,
                    severity="LOW",
                    message="⚠️ Unable to parse docker-compose.yml for resource validation",
                    remediation="Validate docker-compose.yml syntax"
                ))
        
        if not results:
            results.append(EnforcementResult(
                principle_id="104",
                compliant=True,
                severity="LOW",
                message="✅ Container Performance Optimization: All requirements satisfied"
            ))
            
        return results
    
    def generate_enforcement_report(self) -> Dict:
        """Generate comprehensive enforcement report"""
        blocking_violations = [r for r in self.results if r.blocking]
        critical_violations = [r for r in self.results if r.severity == "CRITICAL"]
        high_violations = [r for r in self.results if r.severity == "HIGH"]
        
        compliance_score = len([r for r in self.results if r.compliant]) / len(self.results) * 100
        
        return {
            "timestamp": "2025-07-17T21:30:00Z",
            "compliance_score": f"{compliance_score:.1f}%",
            "blocking_violations": len(blocking_violations),
            "critical_violations": len(critical_violations),
            "high_violations": len(high_violations),
            "total_checks": len(self.results),
            "enforcement_status": "BLOCKING" if blocking_violations else "COMPLIANT" if compliance_score >= 90 else "WARNING",
            "violations": [
                {
                    "principle": r.principle_id,
                    "severity": r.severity,
                    "message": r.message,
                    "remediation": r.remediation,
                    "blocking": r.blocking
                }
                for r in self.results if not r.compliant
            ],
            "compliant_principles": [r.principle_id for r in self.results if r.compliant]
        }

def main():
    """Main enforcement execution"""
    if len(sys.argv) > 1:
        project_path = sys.argv[1]
    else:
        project_path = "."
    
    enforcer = ContainerizationEnforcer(project_path)
    results = enforcer.enforce_all_principles()
    report = enforcer.generate_enforcement_report()
    
    # P56 Transparency: Visual enforcement feedback
    print("🔒 Containerization Principle Enforcement Report")
    print("=" * 60)
    print(f"📊 Compliance Score: {report['compliance_score']}")
    print(f"🚨 Blocking Violations: {report['blocking_violations']}")
    print(f"⚠️  Critical Issues: {report['critical_violations']}")
    print(f"📋 Total Checks: {report['total_checks']}")
    print()
    
    # Display violations
    for violation in report['violations']:
        icon = "🚨" if violation['blocking'] else "⚠️"
        print(f"{icon} Principle #{violation['principle']}: {violation['message']}")
        if violation['remediation']:
            print(f"   💡 {violation['remediation']}")
        print()
    
    # Display compliant principles
    if report['compliant_principles']:
        print("✅ Compliant Principles:", ", ".join([f"#{p}" for p in report['compliant_principles']]))
    
    # Save report for dashboard integration
    report_path = Path("scripts/results/enforcement/containerization-enforcement-report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2))
    
    # Exit with error code if blocking violations
    if report['blocking_violations'] > 0:
        print("\n🚨 EXECUTION BLOCKED: Resolve blocking violations before proceeding")
        sys.exit(1)
    elif report['compliance_score'] < 90:
        print(f"\n⚠️ WARNING: Compliance score {report['compliance_score']} below 90% threshold")
        sys.exit(2)
    else:
        print("\n✅ All containerization principles compliant")
        sys.exit(0)

if __name__ == "__main__":
    main()