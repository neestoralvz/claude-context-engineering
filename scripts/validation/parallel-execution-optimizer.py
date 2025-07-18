#!/usr/bin/env python3
"""
Parallel Execution Optimizer for Command Independence Validation
Integrates with validation system to achieve ≥90% resource utilization
"""

import os
import json
import time
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from multiprocessing import cpu_count
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

class ParallelExecutionOptimizer:
    """
    Optimizes parallel execution for command independence validation
    Targets ≥90% resource utilization with intelligent load balancing
    """
    
    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or cpu_count()
        self.results_dir = Path(__file__).parent.parent / "results" / "parallel-execution"
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Performance metrics
        self.metrics = {
            'total_commands': 0,
            'processed_commands': 0,
            'failed_commands': 0,
            'execution_time': 0.0,
            'resource_utilization': 0.0,
            'throughput': 0.0,
            'parallel_efficiency': 0.0
        }
        
        # Resource monitoring
        self.resource_monitor = ResourceMonitor()
        self.load_balancer = LoadBalancer(self.max_workers)
    
    def optimize_batch_validation(self, command_paths: List[str]) -> Dict:
        """
        Optimize batch validation with parallel execution
        Target: ≥90% resource utilization
        """
        logger.info(f"Starting optimized batch validation for {len(command_paths)} commands")
        
        start_time = time.time()
        
        # Initialize monitoring
        self.resource_monitor.start_monitoring()
        
        # Partition commands for optimal parallel processing
        command_batches = self._partition_commands(command_paths)
        
        # Execute validation in parallel
        results = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all batches
            future_to_batch = {
                executor.submit(self._validate_batch, batch): batch 
                for batch in command_batches
            }
            
            # Collect results with progress tracking
            for future in as_completed(future_to_batch):
                batch = future_to_batch[future]
                try:
                    batch_results = future.result()
                    results.extend(batch_results)
                    
                    # Update metrics
                    self.metrics['processed_commands'] += len(batch_results)
                    
                    # Log progress
                    progress = (self.metrics['processed_commands'] / len(command_paths)) * 100
                    logger.info(f"Progress: {progress:.1f}% ({self.metrics['processed_commands']}/{len(command_paths)})")
                    
                except Exception as e:
                    logger.error(f"Batch processing failed: {e}")
                    self.metrics['failed_commands'] += len(batch)
        
        # Stop monitoring and calculate metrics
        self.resource_monitor.stop_monitoring()
        execution_time = time.time() - start_time
        
        # Calculate performance metrics
        performance_metrics = self._calculate_performance_metrics(
            len(command_paths), 
            execution_time,
            self.resource_monitor.get_metrics()
        )
        
        return {
            'validation_results': results,
            'performance_metrics': performance_metrics,
            'optimization_summary': self._generate_optimization_summary(performance_metrics),
            'resource_utilization': self.resource_monitor.get_metrics()
        }
    
    def _partition_commands(self, command_paths: List[str]) -> List[List[str]]:
        """
        Partition commands for optimal parallel processing
        """
        # Calculate optimal batch size based on available resources
        batch_size = max(1, len(command_paths) // (self.max_workers * 2))
        
        batches = []
        for i in range(0, len(command_paths), batch_size):
            batch = command_paths[i:i + batch_size]
            batches.append(batch)
        
        logger.info(f"Partitioned {len(command_paths)} commands into {len(batches)} batches (batch size: {batch_size})")
        return batches
    
    def _validate_batch(self, command_batch: List[str]) -> List[Dict]:
        """
        Validate a batch of commands
        """
        from command_independence_validator import CommandIndependenceValidator
        
        validator = CommandIndependenceValidator()
        batch_results = []
        
        for command_path in command_batch:
            try:
                result = validator.validate_single_command(command_path)
                batch_results.append(result)
            except Exception as e:
                logger.error(f"Error validating {command_path}: {e}")
                batch_results.append({
                    'command_path': command_path,
                    'error': str(e),
                    'status': 'FAILED'
                })
        
        return batch_results
    
    def _calculate_performance_metrics(self, total_commands: int, execution_time: float, resource_metrics: Dict) -> Dict:
        """
        Calculate comprehensive performance metrics
        """
        throughput = total_commands / execution_time if execution_time > 0 else 0
        
        # Calculate parallel efficiency
        theoretical_sequential_time = total_commands * 2.0  # Assume 2s per command
        parallel_efficiency = (theoretical_sequential_time / execution_time) / self.max_workers * 100
        
        # Resource utilization metrics
        avg_cpu_usage = resource_metrics.get('avg_cpu_usage', 0)
        avg_memory_usage = resource_metrics.get('avg_memory_usage', 0)
        
        # Overall resource utilization score
        resource_utilization = (avg_cpu_usage + avg_memory_usage) / 2
        
        return {
            'execution_time': execution_time,
            'throughput': throughput,
            'parallel_efficiency': min(100, parallel_efficiency),
            'resource_utilization': resource_utilization,
            'avg_cpu_usage': avg_cpu_usage,
            'avg_memory_usage': avg_memory_usage,
            'max_workers': self.max_workers,
            'total_commands': total_commands,
            'commands_per_second': throughput
        }
    
    def _generate_optimization_summary(self, performance_metrics: Dict) -> Dict:
        """
        Generate optimization summary and recommendations
        """
        utilization = performance_metrics['resource_utilization']
        efficiency = performance_metrics['parallel_efficiency']
        
        # Determine optimization status
        if utilization >= 90 and efficiency >= 80:
            status = "OPTIMAL"
            recommendations = ["✅ Excellent parallel performance achieved"]
        elif utilization >= 75 and efficiency >= 60:
            status = "GOOD"
            recommendations = [
                "✅ Good parallel performance",
                "💡 Consider increasing worker count for better utilization"
            ]
        elif utilization >= 50:
            status = "MODERATE"
            recommendations = [
                "⚠️ Moderate parallel performance",
                "💡 Optimize batch size or increase parallelism",
                "💡 Check for resource bottlenecks"
            ]
        else:
            status = "POOR"
            recommendations = [
                "❌ Poor parallel performance",
                "💡 Investigate resource constraints",
                "💡 Optimize command processing logic",
                "💡 Consider hardware upgrades"
            ]
        
        return {
            'optimization_status': status,
            'utilization_score': utilization,
            'efficiency_score': efficiency,
            'target_achievement': {
                'utilization_target': 90.0,
                'utilization_achieved': utilization,
                'utilization_met': utilization >= 90,
                'efficiency_target': 80.0,
                'efficiency_achieved': efficiency,
                'efficiency_met': efficiency >= 80
            },
            'recommendations': recommendations
        }
    
    async def async_validate_commands(self, command_paths: List[str]) -> Dict:
        """
        Asynchronous validation for maximum performance
        """
        logger.info(f"Starting async validation for {len(command_paths)} commands")
        
        start_time = time.time()
        
        # Create semaphore to limit concurrent operations
        semaphore = asyncio.Semaphore(self.max_workers)
        
        async def validate_command_async(command_path: str) -> Dict:
            async with semaphore:
                # Run validation in thread pool
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(None, self._validate_single_command, command_path)
        
        # Execute all validations concurrently
        tasks = [validate_command_async(cmd) for cmd in command_paths]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        successful_results = []
        failed_results = []
        
        for result in results:
            if isinstance(result, Exception):
                failed_results.append(str(result))
            else:
                successful_results.append(result)
        
        execution_time = time.time() - start_time
        
        return {
            'successful_validations': successful_results,
            'failed_validations': failed_results,
            'execution_time': execution_time,
            'success_rate': len(successful_results) / len(command_paths) * 100,
            'throughput': len(command_paths) / execution_time
        }
    
    def _validate_single_command(self, command_path: str) -> Dict:
        """
        Validate single command (thread-safe)
        """
        from command_independence_validator import CommandIndependenceValidator
        
        validator = CommandIndependenceValidator()
        return validator.validate_single_command(command_path)
    
    def monitor_real_time_performance(self, interval: int = 30) -> None:
        """
        Real-time performance monitoring
        """
        logger.info(f"Starting real-time performance monitoring (interval: {interval}s)")
        
        while True:
            try:
                # Collect current metrics
                current_metrics = self.resource_monitor.get_current_metrics()
                
                # Log performance status
                logger.info(f"Performance Status: CPU: {current_metrics['cpu_usage']:.1f}%, "
                           f"Memory: {current_metrics['memory_usage']:.1f}%, "
                           f"Active Workers: {current_metrics['active_workers']}")
                
                # Check for optimization opportunities
                if current_metrics['cpu_usage'] < 50:
                    logger.info("💡 CPU utilization low - consider increasing parallelism")
                
                if current_metrics['memory_usage'] > 90:
                    logger.warning("⚠️ Memory utilization high - consider reducing batch size")
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Performance monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error during performance monitoring: {e}")
                time.sleep(interval)
    
    def save_performance_report(self, results: Dict, filename: str = None) -> str:
        """
        Save performance analysis report
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            filename = f"parallel-execution-report-{timestamp}.json"
        
        filepath = self.results_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Performance report saved to: {filepath}")
        return str(filepath)

class ResourceMonitor:
    """
    Real-time resource monitoring for optimization
    """
    
    def __init__(self):
        self.monitoring = False
        self.metrics_history = []
        self.monitor_thread = None
    
    def start_monitoring(self):
        """Start resource monitoring"""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_resources)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        logger.info("Resource monitoring started")
    
    def stop_monitoring(self):
        """Stop resource monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()
        logger.info("Resource monitoring stopped")
    
    def _monitor_resources(self):
        """Internal monitoring loop"""
        import psutil
        
        while self.monitoring:
            try:
                # Get current resource usage
                cpu_percent = psutil.cpu_percent(interval=1)
                memory_percent = psutil.virtual_memory().percent
                
                # Record metrics
                self.metrics_history.append({
                    'timestamp': time.time(),
                    'cpu_usage': cpu_percent,
                    'memory_usage': memory_percent
                })
                
                # Keep only last 1000 entries
                if len(self.metrics_history) > 1000:
                    self.metrics_history = self.metrics_history[-1000:]
                
            except Exception as e:
                logger.error(f"Error monitoring resources: {e}")
                time.sleep(1)
    
    def get_metrics(self) -> Dict:
        """Get aggregated monitoring metrics"""
        if not self.metrics_history:
            return {
                'avg_cpu_usage': 0,
                'avg_memory_usage': 0,
                'max_cpu_usage': 0,
                'max_memory_usage': 0
            }
        
        cpu_values = [m['cpu_usage'] for m in self.metrics_history]
        memory_values = [m['memory_usage'] for m in self.metrics_history]
        
        return {
            'avg_cpu_usage': sum(cpu_values) / len(cpu_values),
            'avg_memory_usage': sum(memory_values) / len(memory_values),
            'max_cpu_usage': max(cpu_values),
            'max_memory_usage': max(memory_values),
            'monitoring_duration': time.time() - self.metrics_history[0]['timestamp'],
            'data_points': len(self.metrics_history)
        }
    
    def get_current_metrics(self) -> Dict:
        """Get current resource metrics"""
        import psutil
        
        return {
            'cpu_usage': psutil.cpu_percent(interval=0.1),
            'memory_usage': psutil.virtual_memory().percent,
            'active_workers': threading.active_count(),
            'timestamp': time.time()
        }

class LoadBalancer:
    """
    Intelligent load balancing for parallel execution
    """
    
    def __init__(self, max_workers: int):
        self.max_workers = max_workers
        self.worker_loads = {i: 0 for i in range(max_workers)}
        self.task_queue = []
    
    def assign_task(self, task: Any) -> int:
        """
        Assign task to optimal worker
        """
        # Find worker with lowest load
        optimal_worker = min(self.worker_loads, key=self.worker_loads.get)
        
        # Assign task
        self.worker_loads[optimal_worker] += 1
        
        return optimal_worker
    
    def complete_task(self, worker_id: int):
        """
        Mark task completion
        """
        if worker_id in self.worker_loads:
            self.worker_loads[worker_id] = max(0, self.worker_loads[worker_id] - 1)
    
    def get_load_balance_metrics(self) -> Dict:
        """
        Get load balancing metrics
        """
        loads = list(self.worker_loads.values())
        
        return {
            'total_load': sum(loads),
            'avg_load': sum(loads) / len(loads),
            'max_load': max(loads),
            'min_load': min(loads),
            'load_variance': sum((load - sum(loads) / len(loads)) ** 2 for load in loads) / len(loads),
            'balance_score': 100 - (max(loads) - min(loads)) / max(1, max(loads)) * 100
        }

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Parallel Execution Optimizer')
    parser.add_argument('--commands-dir', '-d', type=str, default="~/.claude/commands", help='Commands directory')
    parser.add_argument('--workers', '-w', type=int, help='Number of worker processes')
    parser.add_argument('--monitor', '-m', action='store_true', help='Start performance monitoring')
    parser.add_argument('--async-mode', '-a', action='store_true', help='Use asynchronous validation')
    parser.add_argument('--output', '-o', type=str, help='Output report filename')
    
    args = parser.parse_args()
    
    # Initialize optimizer
    optimizer = ParallelExecutionOptimizer(args.workers)
    
    if args.monitor:
        # Start monitoring mode
        optimizer.monitor_real_time_performance()
    else:
        # Get all command files
        commands_dir = Path(args.commands_dir).expanduser()
        command_files = []
        for root, dirs, files in os.walk(commands_dir):
            for file in files:
                if file.endswith('.md'):
                    command_files.append(os.path.join(root, file))
        
        logger.info(f"Found {len(command_files)} command files for validation")
        
        if args.async_mode:
            # Async validation
            async def run_async():
                results = await optimizer.async_validate_commands(command_files)
                report_file = optimizer.save_performance_report(results, args.output)
                print(f"Async validation complete. Report saved to: {report_file}")
            
            asyncio.run(run_async())
        else:
            # Standard parallel validation
            results = optimizer.optimize_batch_validation(command_files)
            report_file = optimizer.save_performance_report(results, args.output)
            
            # Print summary
            performance = results['performance_metrics']
            optimization = results['optimization_summary']
            
            print(f"\nParallel Execution Summary:")
            print(f"Execution Time: {performance['execution_time']:.2f}s")
            print(f"Throughput: {performance['throughput']:.2f} commands/second")
            print(f"Resource Utilization: {performance['resource_utilization']:.1f}%")
            print(f"Parallel Efficiency: {performance['parallel_efficiency']:.1f}%")
            print(f"Optimization Status: {optimization['optimization_status']}")
            print(f"Target Achievement: {'✅' if optimization['target_achievement']['utilization_met'] else '❌'}")
            print(f"Report saved to: {report_file}")

if __name__ == "__main__":
    main()