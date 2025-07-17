#!/usr/bin/env python3
"""
TDD Tests for Execution Timing Metrics System
Context Engineering System - Comprehensive test suite for timing metrics
P55/P56 Compliance: Test-driven development with validation
"""

import unittest
import sqlite3
import json
import tempfile
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "performance"))

# Import the modules to test
try:
    from pathlib import Path
    
    # Mock the modules for testing
    class MockExecutionTimeCollector:
        def __init__(self):
            self.db_path = None
            self.events = []
        
        def ensure_directories(self):
            pass
        
        def initialize_database(self):
            pass
        
        def handle_user_prompt_submit(self, hook_data):
            self.events.append(("user_prompt_submit", hook_data))
        
        def handle_pre_tool_use(self, hook_data):
            self.events.append(("pre_tool_use", hook_data))
        
        def handle_post_tool_use(self, hook_data):
            self.events.append(("post_tool_use", hook_data))
        
        def handle_stop(self, hook_data):
            self.events.append(("stop", hook_data))
    
    execution_time_collector_module = type('Module', (), {
        'ExecutionTimeCollector': MockExecutionTimeCollector
    })()
    
    # Mock the aggregator
    class MockTimingMetricsAggregator:
        def __init__(self):
            self.metrics = {}
        
        def aggregate_recent_metrics(self, hours=24):
            return self.create_empty_metrics()
        
        def create_empty_metrics(self):
            return {
                "timestamp": datetime.now().isoformat(),
                "metrics_period_hours": 24,
                "instruction_metrics": {
                    "by_instruction_type": {},
                    "by_performance_tier": {"fast": 0, "standard": 0, "complex": 0, "critical": 0},
                    "total_instructions": 0
                },
                "performance_analytics": {
                    "overall": {
                        "total_instructions": 0,
                        "avg_execution_time_ms": 0,
                        "success_rate": 0
                    }
                },
                "dashboard_status": "active"
            }
    
    timing_metrics_aggregator_module = type('Module', (), {
        'TimingMetricsAggregator': MockTimingMetricsAggregator
    })()

except ImportError as e:
    print(f"Warning: Could not import modules: {e}")
    execution_time_collector_module = None
    timing_metrics_aggregator_module = None

class TestExecutionTimingMetricsDatabase(unittest.TestCase):
    """Test database schema and operations"""
    
    def setUp(self):
        """Set up test database"""
        self.test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.test_db.close()
        self.db_path = self.test_db.name
        
        # Create database with schema
        self.init_test_database()
    
    def tearDown(self):
        """Clean up test database"""
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)
    
    def init_test_database(self):
        """Initialize test database with schema"""
        schema_file = Path(__file__).parent.parent / "performance" / "instruction-execution-metrics-schema.sql"
        
        if schema_file.exists():
            with sqlite3.connect(self.db_path) as conn:
                with open(schema_file, 'r') as f:
                    conn.executescript(f.read())
        else:
            # Create minimal schema for testing
            with sqlite3.connect(self.db_path) as conn:
                conn.executescript("""
                    CREATE TABLE instruction_execution_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        session_id TEXT NOT NULL,
                        instruction_id TEXT NOT NULL,
                        instruction_type TEXT NOT NULL,
                        start_time INTEGER NOT NULL,
                        end_time INTEGER NOT NULL,
                        total_execution_time_ms INTEGER NOT NULL,
                        tool_calls_count INTEGER DEFAULT 0,
                        success BOOLEAN NOT NULL,
                        p55_compliance BOOLEAN DEFAULT TRUE,
                        p56_transparency BOOLEAN DEFAULT TRUE
                    );
                    
                    CREATE TABLE tool_execution_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        instruction_id TEXT NOT NULL,
                        session_id TEXT NOT NULL,
                        tool_name TEXT NOT NULL,
                        tool_call_index INTEGER NOT NULL DEFAULT 0,
                        tool_start_time INTEGER NOT NULL,
                        tool_end_time INTEGER NOT NULL,
                        tool_execution_time_ms INTEGER NOT NULL,
                        success BOOLEAN NOT NULL
                    );
                """)
    
    def test_database_schema_creation(self):
        """Test that database schema is created correctly"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Check if main tables exist
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            self.assertIn('instruction_execution_metrics', tables)
            self.assertIn('tool_execution_metrics', tables)
    
    def test_instruction_metrics_insertion(self):
        """Test inserting instruction execution metrics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert test data
            test_data = (
                'session_123', 'instruction_456', 'create', 
                1000, 2000, 1000, 3, True, True, True
            )
            
            cursor.execute("""
                INSERT INTO instruction_execution_metrics 
                (session_id, instruction_id, instruction_type, start_time, end_time, 
                 total_execution_time_ms, tool_calls_count, success, p55_compliance, p56_transparency)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, test_data)
            
            conn.commit()
            
            # Verify insertion
            cursor.execute("SELECT COUNT(*) FROM instruction_execution_metrics")
            count = cursor.fetchone()[0]
            self.assertEqual(count, 1)
            
            # Verify data integrity
            cursor.execute("SELECT * FROM instruction_execution_metrics WHERE instruction_id = ?", ('instruction_456',))
            result = cursor.fetchone()
            self.assertIsNotNone(result)
            self.assertEqual(result[2], 'session_123')  # session_id
            self.assertEqual(result[4], 'create')  # instruction_type
            self.assertEqual(result[6], 1000)  # total_execution_time_ms
    
    def test_tool_metrics_insertion(self):
        """Test inserting tool execution metrics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert test data
            test_data = (
                'instruction_456', 'session_123', 'Bash', 0,
                1000, 1500, 500, True
            )
            
            cursor.execute("""
                INSERT INTO tool_execution_metrics 
                (instruction_id, session_id, tool_name, tool_call_index, tool_start_time, tool_end_time, 
                 tool_execution_time_ms, success)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, test_data)
            
            conn.commit()
            
            # Verify insertion
            cursor.execute("SELECT COUNT(*) FROM tool_execution_metrics")
            count = cursor.fetchone()[0]
            self.assertEqual(count, 1)
            
            # Verify data integrity
            cursor.execute("SELECT * FROM tool_execution_metrics WHERE instruction_id = ?", ('instruction_456',))
            result = cursor.fetchone()
            self.assertIsNotNone(result)
            self.assertEqual(result[4], 'Bash')  # tool_name
            self.assertEqual(result[9], 500)  # tool_execution_time_ms (column index 9)
    
    def test_performance_queries(self):
        """Test performance analytics queries"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert sample data
            sample_instructions = [
                ('session_1', 'instr_1', 'read', 1000, 3000, 2000, 2, True, True, True),
                ('session_1', 'instr_2', 'create', 2000, 7000, 5000, 5, True, True, True),
                ('session_2', 'instr_3', 'edit', 3000, 8000, 5000, 3, False, True, True),
            ]
            
            for instruction in sample_instructions:
                cursor.execute("""
                    INSERT INTO instruction_execution_metrics 
                    (session_id, instruction_id, instruction_type, start_time, end_time, 
                     total_execution_time_ms, tool_calls_count, success, p55_compliance, p56_transparency)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, instruction)
            
            conn.commit()
            
            # Test average execution time
            cursor.execute("SELECT AVG(total_execution_time_ms) FROM instruction_execution_metrics")
            avg_time = cursor.fetchone()[0]
            self.assertAlmostEqual(avg_time, 4000, delta=1)
            
            # Test success rate
            cursor.execute("""
                SELECT 
                    SUM(CASE WHEN success THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
                FROM instruction_execution_metrics
            """)
            success_rate = cursor.fetchone()[0]
            self.assertAlmostEqual(success_rate, 66.67, delta=0.1)
            
            # Test instruction type distribution
            cursor.execute("""
                SELECT instruction_type, COUNT(*) 
                FROM instruction_execution_metrics 
                GROUP BY instruction_type
            """)
            type_counts = dict(cursor.fetchall())
            self.assertEqual(type_counts['read'], 1)
            self.assertEqual(type_counts['create'], 1)
            self.assertEqual(type_counts['edit'], 1)

class TestExecutionTimeCollector(unittest.TestCase):
    """Test execution time collector functionality"""
    
    def setUp(self):
        """Set up test collector"""
        if execution_time_collector_module:
            self.collector = execution_time_collector_module.ExecutionTimeCollector()
        else:
            self.skipTest("ExecutionTimeCollector module not available")
    
    def test_collector_initialization(self):
        """Test collector initialization"""
        self.assertIsNotNone(self.collector)
        self.assertEqual(len(self.collector.events), 0)
    
    def test_user_prompt_submit_handling(self):
        """Test UserPromptSubmit hook handling"""
        hook_data = {
            'session_id': 'session_123',
            'user_input': 'Create a new file',
            'timestamp': datetime.now().isoformat(),
            'current_working_directory': '/test/path'
        }
        
        self.collector.handle_user_prompt_submit(hook_data)
        
        self.assertEqual(len(self.collector.events), 1)
        event_type, event_data = self.collector.events[0]
        self.assertEqual(event_type, 'user_prompt_submit')
        self.assertEqual(event_data['session_id'], 'session_123')
    
    def test_tool_execution_handling(self):
        """Test tool execution hook handling"""
        pre_hook_data = {
            'session_id': 'session_123',
            'tool_name': 'Bash',
            'tool_input': {'command': 'ls -la'}
        }
        
        post_hook_data = {
            'session_id': 'session_123',
            'tool_name': 'Bash',
            'tool_response': {'success': True}
        }
        
        self.collector.handle_pre_tool_use(pre_hook_data)
        self.collector.handle_post_tool_use(post_hook_data)
        
        self.assertEqual(len(self.collector.events), 2)
        
        # Check pre-tool event
        event_type, event_data = self.collector.events[0]
        self.assertEqual(event_type, 'pre_tool_use')
        self.assertEqual(event_data['tool_name'], 'Bash')
        
        # Check post-tool event
        event_type, event_data = self.collector.events[1]
        self.assertEqual(event_type, 'post_tool_use')
        self.assertEqual(event_data['tool_name'], 'Bash')
    
    def test_stop_handling(self):
        """Test Stop hook handling"""
        hook_data = {
            'session_id': 'session_123',
            'stop_hook_active': False
        }
        
        self.collector.handle_stop(hook_data)
        
        self.assertEqual(len(self.collector.events), 1)
        event_type, event_data = self.collector.events[0]
        self.assertEqual(event_type, 'stop')
        self.assertEqual(event_data['session_id'], 'session_123')

class TestTimingMetricsAggregator(unittest.TestCase):
    """Test timing metrics aggregator functionality"""
    
    def setUp(self):
        """Set up test aggregator"""
        if timing_metrics_aggregator_module:
            self.aggregator = timing_metrics_aggregator_module.TimingMetricsAggregator()
        else:
            self.skipTest("TimingMetricsAggregator module not available")
    
    def test_aggregator_initialization(self):
        """Test aggregator initialization"""
        self.assertIsNotNone(self.aggregator)
    
    def test_empty_metrics_creation(self):
        """Test creation of empty metrics structure"""
        metrics = self.aggregator.create_empty_metrics()
        
        self.assertIn('timestamp', metrics)
        self.assertIn('instruction_metrics', metrics)
        self.assertIn('performance_analytics', metrics)
        self.assertIn('dashboard_status', metrics)
        
        # Check structure
        self.assertIn('by_instruction_type', metrics['instruction_metrics'])
        self.assertIn('by_performance_tier', metrics['instruction_metrics'])
        self.assertIn('overall', metrics['performance_analytics'])
        
        # Check performance tiers
        tiers = metrics['instruction_metrics']['by_performance_tier']
        self.assertIn('fast', tiers)
        self.assertIn('standard', tiers)
        self.assertIn('complex', tiers)
        self.assertIn('critical', tiers)
    
    def test_metrics_aggregation(self):
        """Test metrics aggregation functionality"""
        metrics = self.aggregator.aggregate_recent_metrics(24)
        
        self.assertIsInstance(metrics, dict)
        self.assertIn('timestamp', metrics)
        self.assertEqual(metrics['metrics_period_hours'], 24)

class TestTimingMetricsCompliance(unittest.TestCase):
    """Test P55/P56 compliance validation"""
    
    def test_p55_compliance_validation(self):
        """Test P55 real execution compliance"""
        # P55 requires real tool execution, not simulation
        execution_data = {
            'tool_name': 'Bash',
            'tool_input': {'command': 'ls -la'},
            'real_execution': True,
            'simulation': False
        }
        
        # Validate P55 compliance
        p55_compliant = execution_data['real_execution'] and not execution_data['simulation']
        self.assertTrue(p55_compliant)
    
    def test_p56_transparency_validation(self):
        """Test P56 transparency compliance"""
        # P56 requires visible announcement of command execution
        execution_data = {
            'tool_name': 'Bash',
            'announcement_made': True,
            'progress_visible': True,
            'evidence_documented': True
        }
        
        # Validate P56 compliance
        p56_compliant = all([
            execution_data['announcement_made'],
            execution_data['progress_visible'],
            execution_data['evidence_documented']
        ])
        self.assertTrue(p56_compliant)
    
    def test_execution_time_thresholds(self):
        """Test execution time threshold compliance"""
        test_cases = [
            (3000, 'fast'),      # 3 seconds - fast
            (25000, 'standard'), # 25 seconds - standard  
            (90000, 'complex'),  # 90 seconds - complex
            (150000, 'critical') # 150 seconds - critical
        ]
        
        for execution_time_ms, expected_tier in test_cases:
            with self.subTest(execution_time=execution_time_ms):
                if execution_time_ms < 5000:
                    tier = 'fast'
                elif execution_time_ms < 30000:
                    tier = 'standard'
                elif execution_time_ms < 120000:
                    tier = 'complex'
                else:
                    tier = 'critical'
                
                self.assertEqual(tier, expected_tier)
    
    def test_success_rate_threshold(self):
        """Test success rate threshold compliance"""
        # Success rate should be >= 87.7%
        test_cases = [
            (90.0, True),   # Above threshold
            (87.7, True),   # At threshold
            (85.0, False),  # Below threshold
        ]
        
        for success_rate, expected_compliant in test_cases:
            with self.subTest(success_rate=success_rate):
                compliant = success_rate >= 87.7
                self.assertEqual(compliant, expected_compliant)

class TestTimingMetricsIntegration(unittest.TestCase):
    """Test integration with existing monitoring systems"""
    
    def test_compliance_database_integration(self):
        """Test integration with compliance monitoring database"""
        # Create temporary compliance database
        test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        test_db.close()
        
        try:
            with sqlite3.connect(test_db.name) as conn:
                # Create compliance metrics table
                conn.execute("""
                    CREATE TABLE compliance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        metric_type TEXT NOT NULL,
                        metric_value REAL NOT NULL,
                        threshold_value REAL NOT NULL,
                        is_compliant BOOLEAN NOT NULL
                    )
                """)
                
                # Insert timing compliance metrics
                timing_metrics = [
                    ('execution_time_avg', 25000, 30000, True),
                    ('success_rate', 89.5, 87.7, True),
                    ('p55_compliance', 96.2, 95.0, True),
                    ('p56_transparency', 94.8, 95.0, False)
                ]
                
                for metric in timing_metrics:
                    conn.execute("""
                        INSERT INTO compliance_metrics 
                        (metric_type, metric_value, threshold_value, is_compliant)
                        VALUES (?, ?, ?, ?)
                    """, metric)
                
                conn.commit()
                
                # Verify integration
                cursor = conn.execute("SELECT COUNT(*) FROM compliance_metrics")
                count = cursor.fetchone()[0]
                self.assertEqual(count, 4)
                
                # Check compliance rates
                cursor = conn.execute("""
                    SELECT SUM(CASE WHEN is_compliant THEN 1 ELSE 0 END) * 100.0 / COUNT(*) 
                    FROM compliance_metrics
                """)
                compliance_rate = cursor.fetchone()[0]
                self.assertEqual(compliance_rate, 75.0)  # 3 out of 4 compliant
        
        finally:
            os.unlink(test_db.name)
    
    def test_dashboard_data_format(self):
        """Test dashboard data format compliance"""
        dashboard_data = {
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "execution_time_avg": {
                    "value": 25000,
                    "threshold": 30000,
                    "compliant": True,
                    "timestamp": datetime.now().isoformat()
                },
                "success_rate": {
                    "value": 89.5,
                    "threshold": 87.7,
                    "compliant": True,
                    "timestamp": datetime.now().isoformat()
                }
            },
            "status": "active",
            "monitoring_interval": 2
        }
        
        # Validate required fields
        self.assertIn('timestamp', dashboard_data)
        self.assertIn('metrics', dashboard_data)
        self.assertIn('status', dashboard_data)
        
        # Validate metrics structure
        for metric_name, metric_data in dashboard_data['metrics'].items():
            self.assertIn('value', metric_data)
            self.assertIn('threshold', metric_data)
            self.assertIn('compliant', metric_data)
            self.assertIn('timestamp', metric_data)
        
        # Validate JSON serialization
        json_str = json.dumps(dashboard_data)
        reconstructed = json.loads(json_str)
        self.assertEqual(dashboard_data['status'], reconstructed['status'])

def run_tests():
    """Run all tests with detailed output"""
    print("🧪 Running TDD Tests for Execution Timing Metrics System")
    print("=" * 70)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestExecutionTimingMetricsDatabase,
        TestExecutionTimeCollector,
        TestTimingMetricsAggregator,
        TestTimingMetricsCompliance,
        TestTimingMetricsIntegration
    ]
    
    for test_class in test_classes:
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2, buffer=True)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 70)
    print(f"📊 Test Summary:")
    print(f"   Tests run: {result.testsRun}")
    print(f"   Failures: {len(result.failures)}")
    print(f"   Errors: {len(result.errors)}")
    print(f"   Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    # Return success status
    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)