#!/usr/bin/env python3
"""
Claude Code Worktree Session Monitor
Real-time monitoring and dashboard for multiple Claude Code sessions
"""

import os
import json
import time
import psutil
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse

class ClaudeSessionMonitor:
    """Monitor and manage Claude Code sessions across git worktrees"""
    
    def __init__(self, worktrees_dir: str = "../worktrees"):
        self.worktrees_dir = Path(worktrees_dir)
        self.log_file = Path(__file__).parent / "session-monitor.log"
        
    def log(self, message: str, level: str = "INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        print(log_entry)
        
        with open(self.log_file, "a") as f:
            f.write(log_entry + "\n")
    
    def get_active_worktrees(self) -> List[Dict]:
        """Get list of active worktrees with metadata"""
        worktrees = []
        
        if not self.worktrees_dir.exists():
            self.log(f"Worktrees directory not found: {self.worktrees_dir}")
            return worktrees
        
        for worktree_path in self.worktrees_dir.iterdir():
            if worktree_path.is_dir() and not worktree_path.name.startswith('.'):
                worktree_info = self._analyze_worktree(worktree_path)
                if worktree_info:
                    worktrees.append(worktree_info)
        
        return worktrees
    
    def _analyze_worktree(self, worktree_path: Path) -> Optional[Dict]:
        """Analyze individual worktree for status and metrics"""
        try:
            # Basic info
            name = worktree_path.name
            
            # Git information
            git_info = self._get_git_info(worktree_path)
            
            # Claude session info
            claude_info = self._get_claude_session_info(worktree_path)
            
            # File system info
            fs_info = self._get_filesystem_info(worktree_path)
            
            # Session context
            context_info = self._get_session_context(worktree_path)
            
            return {
                "name": name,
                "path": str(worktree_path),
                "git": git_info,
                "claude": claude_info,
                "filesystem": fs_info,
                "context": context_info,
                "last_analyzed": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.log(f"Error analyzing worktree {worktree_path}: {e}", "ERROR")
            return None
    
    def _get_git_info(self, worktree_path: Path) -> Dict:
        """Get git status and branch information"""
        try:
            os.chdir(worktree_path)
            
            # Current branch
            branch = subprocess.check_output(
                ["git", "branch", "--show-current"], 
                text=True
            ).strip()
            
            # Uncommitted changes
            status_output = subprocess.check_output(
                ["git", "status", "--porcelain"], 
                text=True
            )
            uncommitted_files = len(status_output.strip().split('\n')) if status_output.strip() else 0
            
            # Last commit
            try:
                last_commit = subprocess.check_output(
                    ["git", "log", "-1", "--format=%h %s (%ar)"], 
                    text=True
                ).strip()
            except subprocess.CalledProcessError:
                last_commit = "No commits"
            
            # Commits ahead of main
            try:
                ahead = subprocess.check_output(
                    ["git", "rev-list", "--count", "HEAD", "^origin/main"], 
                    text=True
                ).strip()
                commits_ahead = int(ahead) if ahead else 0
            except subprocess.CalledProcessError:
                commits_ahead = 0
            
            return {
                "branch": branch,
                "uncommitted_files": uncommitted_files,
                "last_commit": last_commit,
                "commits_ahead": commits_ahead,
                "status": "clean" if uncommitted_files == 0 else "modified"
            }
            
        except Exception as e:
            return {"error": str(e)}
        finally:
            os.chdir(Path(__file__).parent)
    
    def _get_claude_session_info(self, worktree_path: Path) -> Dict:
        """Get Claude Code session information"""
        claude_info = {
            "running": False,
            "pid": None,
            "uptime": None,
            "memory_usage": 0,
            "cpu_percent": 0,
            "session_log_size": 0
        }
        
        # Check for PID file
        pid_file = worktree_path / ".claude-session.pid"
        if pid_file.exists():
            try:
                pid = int(pid_file.read_text().strip())
                
                if psutil.pid_exists(pid):
                    process = psutil.Process(pid)
                    
                    # Check if it's actually a Claude process
                    if 'claude' in process.name().lower():
                        claude_info.update({
                            "running": True,
                            "pid": pid,
                            "uptime": self._format_uptime(process.create_time()),
                            "memory_usage": process.memory_info().rss / 1024 / 1024,  # MB
                            "cpu_percent": process.cpu_percent(),
                            "status": process.status()
                        })
                    else:
                        # PID exists but not Claude process
                        claude_info["status"] = "stale_pid"
                else:
                    # PID file exists but process is dead
                    claude_info["status"] = "dead"
                    
            except (ValueError, psutil.NoSuchProcess, PermissionError) as e:
                claude_info["error"] = str(e)
        
        # Check session log size
        session_log = worktree_path / ".claude-session.log"
        if session_log.exists():
            claude_info["session_log_size"] = session_log.stat().st_size / 1024  # KB
        
        return claude_info
    
    def _get_filesystem_info(self, worktree_path: Path) -> Dict:
        """Get filesystem information for worktree"""
        try:
            # Directory size
            total_size = sum(f.stat().st_size for f in worktree_path.rglob('*') if f.is_file())
            
            # File counts by type
            file_counts = {}
            for file_path in worktree_path.rglob('*'):
                if file_path.is_file():
                    ext = file_path.suffix.lower()
                    file_counts[ext] = file_counts.get(ext, 0) + 1
            
            # Recently modified files
            now = datetime.now()
            recent_files = []
            for file_path in worktree_path.rglob('*'):
                if file_path.is_file():
                    mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if now - mtime < timedelta(hours=24):
                        recent_files.append({
                            "path": str(file_path.relative_to(worktree_path)),
                            "modified": mtime.isoformat(),
                            "size": file_path.stat().st_size
                        })
            
            # Sort by modification time
            recent_files.sort(key=lambda x: x["modified"], reverse=True)
            
            return {
                "total_size_mb": total_size / 1024 / 1024,
                "file_counts": file_counts,
                "recent_files": recent_files[:10],  # Last 10 modified files
                "total_files": sum(file_counts.values())
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _get_session_context(self, worktree_path: Path) -> Dict:
        """Get session context information"""
        context = {}
        
        # Claude memory file
        memory_file = worktree_path / ".claude-memory.md"
        if memory_file.exists():
            try:
                content = memory_file.read_text()
                context["memory_file_size"] = len(content)
                
                # Extract session focus if available
                lines = content.split('\n')
                for line in lines:
                    if line.startswith("**Session Focus**:"):
                        context["focus"] = line.split(":", 1)[1].strip()
                    elif line.startswith("**Current Objective**:"):
                        context["objective"] = line.split(":", 1)[1].strip()
                    elif line.startswith("**Created**:"):
                        context["created"] = line.split(":", 1)[1].strip()
                        
            except Exception as e:
                context["memory_error"] = str(e)
        
        # Package.json for Node.js projects
        package_file = worktree_path / "package.json"
        if package_file.exists():
            try:
                package_data = json.loads(package_file.read_text())
                context["project_name"] = package_data.get("name", "unknown")
                context["project_version"] = package_data.get("version", "unknown")
                context["project_type"] = "node.js"
            except Exception:
                context["project_type"] = "node.js (invalid package.json)"
        
        # Python requirements
        requirements_file = worktree_path / "requirements.txt"
        if requirements_file.exists():
            context["project_type"] = "python"
        
        return context
    
    def _format_uptime(self, create_time: float) -> str:
        """Format process uptime in human readable format"""
        uptime_seconds = time.time() - create_time
        
        if uptime_seconds < 60:
            return f"{int(uptime_seconds)}s"
        elif uptime_seconds < 3600:
            return f"{int(uptime_seconds / 60)}m"
        else:
            hours = int(uptime_seconds / 3600)
            minutes = int((uptime_seconds % 3600) / 60)
            return f"{hours}h {minutes}m"
    
    def get_system_overview(self) -> Dict:
        """Get overall system resource usage"""
        # CPU and memory
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('.')
        
        # All Claude processes
        claude_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'cpu_percent', 'create_time']):
            try:
                if 'claude' in proc.info['name'].lower():
                    claude_processes.append({
                        "pid": proc.info['pid'],
                        "memory_mb": proc.info['memory_info'].rss / 1024 / 1024,
                        "cpu_percent": proc.info['cpu_percent'],
                        "uptime": self._format_uptime(proc.info['create_time'])
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return {
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_gb": memory.used / 1024 / 1024 / 1024,
                "memory_total_gb": memory.total / 1024 / 1024 / 1024,
                "disk_percent": (disk.used / disk.total) * 100,
                "disk_free_gb": disk.free / 1024 / 1024 / 1024
            },
            "claude_processes": claude_processes,
            "total_claude_sessions": len(claude_processes),
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_dashboard(self) -> Dict:
        """Generate complete dashboard data"""
        worktrees = self.get_active_worktrees()
        system = self.get_system_overview()
        
        # Summary statistics
        total_worktrees = len(worktrees)
        active_sessions = sum(1 for w in worktrees if w['claude']['running'])
        total_uncommitted = sum(w['git']['uncommitted_files'] for w in worktrees)
        total_memory_mb = sum(w['claude']['memory_usage'] for w in worktrees if w['claude']['running'])
        
        return {
            "summary": {
                "total_worktrees": total_worktrees,
                "active_claude_sessions": active_sessions,
                "total_uncommitted_files": total_uncommitted,
                "total_claude_memory_mb": total_memory_mb,
                "generated_at": datetime.now().isoformat()
            },
            "system": system,
            "worktrees": worktrees,
            "recommendations": self._generate_recommendations(worktrees, system)
        }
    
    def _generate_recommendations(self, worktrees: List[Dict], system: Dict) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        # Session count recommendations
        active_sessions = sum(1 for w in worktrees if w['claude']['running'])
        if active_sessions > 4:
            recommendations.append(
                f"High session count ({active_sessions}) - consider reducing for optimal performance"
            )
        elif active_sessions == 0:
            recommendations.append("No active Claude sessions - all resources available")
        
        # Memory recommendations
        if system['system']['memory_percent'] > 80:
            recommendations.append("High memory usage - consider closing some sessions")
        
        # Uncommitted changes
        uncommitted_worktrees = [w for w in worktrees if w['git']['uncommitted_files'] > 0]
        if len(uncommitted_worktrees) > 3:
            recommendations.append(f"{len(uncommitted_worktrees)} worktrees have uncommitted changes")
        
        # Stale sessions
        stale_sessions = [w for w in worktrees if 
                         w['claude'].get('status') in ['dead', 'stale_pid']]
        if stale_sessions:
            recommendations.append(f"{len(stale_sessions)} stale Claude sessions need cleanup")
        
        # Large worktrees
        large_worktrees = [w for w in worktrees if 
                          w['filesystem']['total_size_mb'] > 500]
        if large_worktrees:
            recommendations.append(f"{len(large_worktrees)} worktrees are using significant disk space")
        
        return recommendations
    
    def save_dashboard(self, output_file: str = "dashboard.json"):
        """Save dashboard data to JSON file"""
        dashboard = self.generate_dashboard()
        
        output_path = Path(output_file)
        with open(output_path, 'w') as f:
            json.dump(dashboard, f, indent=2)
        
        self.log(f"Dashboard saved to: {output_path}")
        return dashboard
    
    def print_summary(self):
        """Print human-readable summary"""
        dashboard = self.generate_dashboard()
        
        print("\n" + "="*60)
        print("CLAUDE CODE WORKTREE DASHBOARD")
        print("="*60)
        print(f"Generated: {dashboard['summary']['generated_at']}")
        print()
        
        # Summary
        summary = dashboard['summary']
        print("📊 SUMMARY")
        print(f"  Total Worktrees: {summary['total_worktrees']}")
        print(f"  Active Claude Sessions: {summary['active_claude_sessions']}")
        print(f"  Uncommitted Files: {summary['total_uncommitted_files']}")
        print(f"  Total Claude Memory: {summary['total_claude_memory_mb']:.1f} MB")
        print()
        
        # System resources
        system = dashboard['system']['system']
        print("💻 SYSTEM RESOURCES")
        print(f"  CPU Usage: {system['cpu_percent']:.1f}%")
        print(f"  Memory Usage: {system['memory_percent']:.1f}% "
              f"({system['memory_used_gb']:.1f}/{system['memory_total_gb']:.1f} GB)")
        print(f"  Disk Usage: {system['disk_percent']:.1f}% "
              f"({system['disk_free_gb']:.1f} GB free)")
        print()
        
        # Worktree details
        print("📁 WORKTREES")
        for worktree in dashboard['worktrees']:
            name = worktree['name']
            git = worktree['git']
            claude = worktree['claude']
            
            status_icon = "🟢" if claude['running'] else "🔴"
            print(f"  {status_icon} {name}")
            print(f"     Branch: {git['branch']}")
            print(f"     Changes: {git['uncommitted_files']} files")
            
            if claude['running']:
                print(f"     Claude: Running (PID {claude['pid']}, "
                      f"{claude['memory_usage']:.1f} MB, {claude['uptime']})")
            else:
                print(f"     Claude: Not running")
            print()
        
        # Recommendations
        if dashboard['recommendations']:
            print("💡 RECOMMENDATIONS")
            for rec in dashboard['recommendations']:
                print(f"  • {rec}")
            print()

def main():
    parser = argparse.ArgumentParser(description="Claude Code Worktree Session Monitor")
    parser.add_argument(
        "--worktrees-dir", 
        default="../worktrees",
        help="Path to worktrees directory (default: ../worktrees)"
    )
    parser.add_argument(
        "--output", 
        help="Save dashboard to JSON file"
    )
    parser.add_argument(
        "--watch", 
        action="store_true",
        help="Watch mode - continuously update dashboard"
    )
    parser.add_argument(
        "--interval", 
        type=int, 
        default=30,
        help="Update interval in seconds for watch mode (default: 30)"
    )
    
    args = parser.parse_args()
    
    monitor = ClaudeSessionMonitor(args.worktrees_dir)
    
    if args.watch:
        print("Starting watch mode... Press Ctrl+C to exit")
        try:
            while True:
                os.system('clear' if os.name == 'posix' else 'cls')
                monitor.print_summary()
                
                if args.output:
                    monitor.save_dashboard(args.output)
                
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nExiting watch mode...")
    else:
        monitor.print_summary()
        
        if args.output:
            monitor.save_dashboard(args.output)

if __name__ == "__main__":
    main()