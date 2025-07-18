#!/usr/bin/env python3
"""
Density Optimization Enforcer - Context Engineering
Real-time output analysis and blocking for sub-optimal communication
Enforces ≥75% character reduction and ≤0.8 second comprehension time
"""

import json
import re
import sys
import os
import sqlite3
import time
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import math

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "scripts/results/compliance/metrics/density_enforcer.db"
DENSITY_LOG = PROJECT_ROOT / "scripts/results/compliance/density-enforcer.log"

# Density thresholds
MIN_CHARACTER_EFFICIENCY = 0.75  # 75% character reduction requirement
MAX_COMPREHENSION_TIME = 0.8     # 0.8 seconds maximum
MIN_VALUE_PER_TOKEN = 0.6        # 60% minimum value per token
VERBOSE_PATTERN_THRESHOLD = 3    # Maximum verbose patterns allowed

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(DENSITY_LOG),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DensityAnalysis:
    """Data class for density analysis results"""
    text_id: str
    timestamp: datetime
    original_text: str
    character_count: int
    word_count: int
    sentence_count: int
    character_efficiency: float
    estimated_comprehension_time: float
    value_per_token: float
    verbose_patterns_count: int
    redundancy_score: float
    is_compliant: bool
    violations: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'text_id': self.text_id,
            'timestamp': self.timestamp.isoformat(),
            'original_text': self.original_text[:200] + '...' if len(self.original_text) > 200 else self.original_text,
            'character_count': self.character_count,
            'word_count': self.word_count,
            'sentence_count': self.sentence_count,
            'character_efficiency': self.character_efficiency,
            'estimated_comprehension_time': self.estimated_comprehension_time,
            'value_per_token': self.value_per_token,
            'verbose_patterns_count': self.verbose_patterns_count,
            'redundancy_score': self.redundancy_score,
            'is_compliant': self.is_compliant,
            'violations': self.violations
        }

@dataclass
class DensityViolation:
    """Data class for density violations"""
    timestamp: datetime
    text_id: str
    violation_type: str
    metric_value: float
    threshold_value: float
    severity: str
    suggested_improvement: str
    blocked: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'text_id': self.text_id,
            'violation_type': self.violation_type,
            'metric_value': self.metric_value,
            'threshold_value': self.threshold_value,
            'severity': self.severity,
            'suggested_improvement': self.suggested_improvement,
            'blocked': self.blocked
        }

class DensityDatabase:
    """Database manager for density enforcement"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS density_analyses (
                    text_id TEXT PRIMARY KEY,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    original_text TEXT,
                    character_count INTEGER,
                    word_count INTEGER,
                    sentence_count INTEGER,
                    character_efficiency REAL,
                    estimated_comprehension_time REAL,
                    value_per_token REAL,
                    verbose_patterns_count INTEGER,
                    redundancy_score REAL,
                    is_compliant BOOLEAN,
                    violations TEXT
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS density_violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    text_id TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    metric_value REAL,
                    threshold_value REAL,
                    severity TEXT,
                    suggested_improvement TEXT,
                    blocked BOOLEAN DEFAULT FALSE
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS density_patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_type TEXT NOT NULL,
                    pattern_regex TEXT NOT NULL,
                    severity_weight REAL DEFAULT 1.0,
                    description TEXT,
                    active BOOLEAN DEFAULT TRUE
                )
            ''')
            
            # Initialize verbose patterns
            self._initialize_verbose_patterns(conn)
    
    def _initialize_verbose_patterns(self, conn):
        """Initialize verbose pattern detection rules"""
        verbose_patterns = [
            ('redundant_phrases', r'\b(very|really|quite|rather|somewhat|fairly)\s+', 0.8, 'Unnecessary qualifiers'),
            ('verbose_connectors', r'\b(furthermore|moreover|additionally|in addition to|on the other hand)\b', 0.6, 'Verbose connectors'),
            ('redundant_expressions', r'\b(in order to|for the purpose of|with the intent of)\b', 1.0, 'Redundant expressions'),
            ('wordy_phrases', r'\b(a large number of|a great deal of|in the event that|at this point in time)\b', 1.2, 'Wordy phrases'),
            ('excessive_courtesy', r'\b(please note that|it should be noted|it is important to|kindly be aware)\b', 0.7, 'Excessive courtesy'),
            ('verbose_references', r'\b(the above mentioned|the aforementioned|as previously stated)\b', 0.9, 'Verbose references'),
            ('filler_words', r'\b(basically|essentially|actually|literally|obviously)\b', 0.5, 'Filler words'),
            ('passive_constructions', r'\b(it is|there is|there are)\s+\w+\s+(that|which)', 0.8, 'Passive constructions'),
            ('long_introductions', r'^.{0,100}(let me|i will|we will|this document|this section).{20,}', 1.0, 'Long introductions'),
            ('repetitive_structures', r'(\w+)\s+\1', 0.6, 'Repetitive word structures')
        ]
        
        for pattern_type, regex, weight, description in verbose_patterns:
            conn.execute('''
                INSERT OR IGNORE INTO density_patterns 
                (pattern_type, pattern_regex, severity_weight, description)
                VALUES (?, ?, ?, ?)
            ''', (pattern_type, regex, weight, description))
    
    def insert_analysis(self, analysis: DensityAnalysis):
        """Insert density analysis"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO density_analyses 
                (text_id, original_text, character_count, word_count, sentence_count,
                 character_efficiency, estimated_comprehension_time, value_per_token,
                 verbose_patterns_count, redundancy_score, is_compliant, violations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                analysis.text_id,
                analysis.original_text,
                analysis.character_count,
                analysis.word_count,
                analysis.sentence_count,
                analysis.character_efficiency,
                analysis.estimated_comprehension_time,
                analysis.value_per_token,
                analysis.verbose_patterns_count,
                analysis.redundancy_score,
                analysis.is_compliant,
                json.dumps(analysis.violations)
            ))
    
    def insert_violation(self, violation: DensityViolation):
        """Insert density violation"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO density_violations 
                (text_id, violation_type, metric_value, threshold_value, severity, suggested_improvement, blocked)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                violation.text_id,
                violation.violation_type,
                violation.metric_value,
                violation.threshold_value,
                violation.severity,
                violation.suggested_improvement,
                violation.blocked
            ))
    
    def get_verbose_patterns(self) -> List[Tuple[str, str, float, str]]:
        """Get active verbose patterns"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT pattern_type, pattern_regex, severity_weight, description
                FROM density_patterns 
                WHERE active = TRUE
            ''')
            return cursor.fetchall()

class DensityOptimizationEnforcer:
    """Main enforcement engine for density optimization"""
    
    def __init__(self):
        self.db = DensityDatabase(str(DB_PATH))
        self.running = False
        self.monitoring_thread = None
        self.blocking_enabled = True
        
        # Load verbose patterns
        self.verbose_patterns = self.db.get_verbose_patterns()
        logger.info(f"Loaded {len(self.verbose_patterns)} verbose patterns")
    
    def analyze_text_density(self, text: str, text_id: Optional[str] = None) -> DensityAnalysis:
        """Analyze text for density optimization compliance"""
        if text_id is None:
            text_id = f"text_{int(time.time() * 1000)}"
        
        # Basic metrics
        character_count = len(text)
        word_count = len(text.split())
        sentence_count = len(re.findall(r'[.!?]+', text))
        
        # Calculate character efficiency
        character_efficiency = self._calculate_character_efficiency(text)
        
        # Estimate comprehension time
        comprehension_time = self._estimate_comprehension_time(text)
        
        # Calculate value per token
        value_per_token = self._calculate_value_per_token(text)
        
        # Count verbose patterns
        verbose_patterns_count = self._count_verbose_patterns(text)
        
        # Calculate redundancy score
        redundancy_score = self._calculate_redundancy_score(text)
        
        # Determine compliance
        violations = []
        
        if character_efficiency < MIN_CHARACTER_EFFICIENCY:
            violations.append(f"Character efficiency {character_efficiency:.1%} below {MIN_CHARACTER_EFFICIENCY:.1%}")
        
        if comprehension_time > MAX_COMPREHENSION_TIME:
            violations.append(f"Comprehension time {comprehension_time:.1f}s exceeds {MAX_COMPREHENSION_TIME}s")
        
        if value_per_token < MIN_VALUE_PER_TOKEN:
            violations.append(f"Value per token {value_per_token:.1%} below {MIN_VALUE_PER_TOKEN:.1%}")
        
        if verbose_patterns_count > VERBOSE_PATTERN_THRESHOLD:
            violations.append(f"Verbose patterns {verbose_patterns_count} exceed threshold {VERBOSE_PATTERN_THRESHOLD}")
        
        is_compliant = len(violations) == 0
        
        analysis = DensityAnalysis(
            text_id=text_id,
            timestamp=datetime.now(),
            original_text=text,
            character_count=character_count,
            word_count=word_count,
            sentence_count=sentence_count,
            character_efficiency=character_efficiency,
            estimated_comprehension_time=comprehension_time,
            value_per_token=value_per_token,
            verbose_patterns_count=verbose_patterns_count,
            redundancy_score=redundancy_score,
            is_compliant=is_compliant,
            violations=violations
        )
        
        # Store analysis
        self.db.insert_analysis(analysis)
        
        return analysis
    
    def _calculate_character_efficiency(self, text: str) -> float:
        """Calculate character efficiency (inverse of verbosity)"""
        # Count meaningful characters vs total characters
        meaningful_chars = len(re.sub(r'[^\w\s]', '', text))
        
        # Calculate information density
        unique_words = len(set(text.lower().split()))
        total_words = len(text.split())
        word_diversity = unique_words / max(total_words, 1)
        
        # Base efficiency from character usage
        base_efficiency = meaningful_chars / max(len(text), 1)
        
        # Adjust for word diversity
        efficiency = base_efficiency * (0.5 + 0.5 * word_diversity)
        
        # Penalize for verbose patterns
        verbose_penalty = min(self._count_verbose_patterns(text) * 0.05, 0.3)
        efficiency = max(0, efficiency - verbose_penalty)
        
        return min(efficiency, 1.0)
    
    def _estimate_comprehension_time(self, text: str) -> float:
        """Estimate comprehension time based on text complexity"""
        word_count = len(text.split())
        sentence_count = max(len(re.findall(r'[.!?]+', text)), 1)
        
        # Base reading time (assuming 200 words per minute)
        base_time = word_count / 200 * 60  # seconds
        
        # Adjust for sentence complexity
        avg_words_per_sentence = word_count / sentence_count
        complexity_multiplier = 1.0
        
        if avg_words_per_sentence > 20:
            complexity_multiplier += 0.3
        elif avg_words_per_sentence > 15:
            complexity_multiplier += 0.2
        elif avg_words_per_sentence > 10:
            complexity_multiplier += 0.1
        
        # Adjust for verbose patterns
        verbose_multiplier = 1.0 + (self._count_verbose_patterns(text) * 0.1)
        
        return base_time * complexity_multiplier * verbose_multiplier
    
    def _calculate_value_per_token(self, text: str) -> float:
        """Calculate information value per token"""
        words = text.split()
        if not words:
            return 0.0
        
        # Count unique meaningful words
        meaningful_words = [word.lower() for word in words if len(word) > 2 and word.isalpha()]
        unique_meaningful = len(set(meaningful_words))
        
        # Calculate value ratio
        value_ratio = unique_meaningful / len(words)
        
        # Adjust for information density
        # Penalize repetitive structures
        repetition_penalty = self._calculate_repetition_penalty(text)
        value_ratio = max(0, value_ratio - repetition_penalty)
        
        return min(value_ratio, 1.0)
    
    def _count_verbose_patterns(self, text: str) -> int:
        """Count verbose patterns in text"""
        count = 0
        text_lower = text.lower()
        
        for pattern_type, regex, weight, description in self.verbose_patterns:
            matches = re.findall(regex, text_lower, re.IGNORECASE)
            count += len(matches) * weight
        
        return int(count)
    
    def _calculate_redundancy_score(self, text: str) -> float:
        """Calculate redundancy score (0.0 = no redundancy, 1.0 = high redundancy)"""
        words = text.lower().split()
        if len(words) <= 1:
            return 0.0
        
        # Calculate word repetition
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        
        # Calculate redundancy based on repeated words
        total_repetitions = sum(max(0, count - 1) for count in word_counts.values())
        redundancy = total_repetitions / len(words)
        
        # Add phrase repetition penalty
        phrases = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
        phrase_counts = {}
        for phrase in phrases:
            phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1
        
        phrase_repetitions = sum(max(0, count - 1) for count in phrase_counts.values())
        phrase_redundancy = phrase_repetitions / max(len(phrases), 1)
        
        return min(redundancy + phrase_redundancy * 0.5, 1.0)
    
    def _calculate_repetition_penalty(self, text: str) -> float:
        """Calculate penalty for repetitive structures"""
        words = text.split()
        if len(words) <= 3:
            return 0.0
        
        # Check for repeated phrases
        phrase_length = 3
        phrases = [' '.join(words[i:i+phrase_length]) for i in range(len(words)-phrase_length+1)]
        
        repetitions = 0
        seen_phrases = set()
        for phrase in phrases:
            if phrase in seen_phrases:
                repetitions += 1
            seen_phrases.add(phrase)
        
        return min(repetitions / len(phrases), 0.3)
    
    def check_density_compliance(self, text: str, text_id: Optional[str] = None) -> Tuple[bool, List[DensityViolation]]:
        """Check if text complies with density requirements"""
        analysis = self.analyze_text_density(text, text_id)
        violations = []
        
        if not analysis.is_compliant:
            # Create specific violations for each failed metric
            if analysis.character_efficiency < MIN_CHARACTER_EFFICIENCY:
                violation = DensityViolation(
                    timestamp=datetime.now(),
                    text_id=analysis.text_id,
                    violation_type='CHARACTER_EFFICIENCY',
                    metric_value=analysis.character_efficiency,
                    threshold_value=MIN_CHARACTER_EFFICIENCY,
                    severity='HIGH',
                    suggested_improvement=f"Reduce verbose patterns. Remove qualifiers and redundant expressions.",
                    blocked=self.blocking_enabled
                )
                violations.append(violation)
                self.db.insert_violation(violation)
            
            if analysis.estimated_comprehension_time > MAX_COMPREHENSION_TIME:
                violation = DensityViolation(
                    timestamp=datetime.now(),
                    text_id=analysis.text_id,
                    violation_type='COMPREHENSION_TIME',
                    metric_value=analysis.estimated_comprehension_time,
                    threshold_value=MAX_COMPREHENSION_TIME,
                    severity='MEDIUM',
                    suggested_improvement="Simplify sentence structure. Break long sentences into shorter ones.",
                    blocked=self.blocking_enabled and analysis.estimated_comprehension_time > 1.5
                )
                violations.append(violation)
                self.db.insert_violation(violation)
            
            if analysis.value_per_token < MIN_VALUE_PER_TOKEN:
                violation = DensityViolation(
                    timestamp=datetime.now(),
                    text_id=analysis.text_id,
                    violation_type='VALUE_PER_TOKEN',
                    metric_value=analysis.value_per_token,
                    threshold_value=MIN_VALUE_PER_TOKEN,
                    severity='MEDIUM',
                    suggested_improvement="Increase information density. Remove filler words and repetitive content.",
                    blocked=self.blocking_enabled and analysis.value_per_token < 0.4
                )
                violations.append(violation)
                self.db.insert_violation(violation)
            
            if analysis.verbose_patterns_count > VERBOSE_PATTERN_THRESHOLD:
                violation = DensityViolation(
                    timestamp=datetime.now(),
                    text_id=analysis.text_id,
                    violation_type='VERBOSE_PATTERNS',
                    metric_value=analysis.verbose_patterns_count,
                    threshold_value=VERBOSE_PATTERN_THRESHOLD,
                    severity='HIGH',
                    suggested_improvement="Remove verbose phrases. Use direct, concise language.",
                    blocked=self.blocking_enabled
                )
                violations.append(violation)
                self.db.insert_violation(violation)
        
        return analysis.is_compliant, violations
    
    def get_optimization_suggestions(self, text: str) -> List[str]:
        """Get specific optimization suggestions for text"""
        suggestions = []
        
        # Check for specific verbose patterns
        for pattern_type, regex, weight, description in self.verbose_patterns:
            matches = re.findall(regex, text, re.IGNORECASE)
            if matches:
                suggestions.append(f"Remove {description.lower()}: {', '.join(matches[:3])}")
        
        # Check sentence length
        sentences = re.split(r'[.!?]+', text)
        long_sentences = [s.strip() for s in sentences if len(s.split()) > 20]
        if long_sentences:
            suggestions.append(f"Break down {len(long_sentences)} long sentence(s) (>20 words)")
        
        # Check word repetition
        words = text.lower().split()
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        
        repeated_words = [word for word, count in word_counts.items() if count > 3 and len(word) > 3]
        if repeated_words:
            suggestions.append(f"Reduce repetition of: {', '.join(repeated_words[:3])}")
        
        # Check for passive voice
        passive_patterns = re.findall(r'\b(is|are|was|were|being|been)\s+\w+ed\b', text)
        if len(passive_patterns) > 2:
            suggestions.append("Convert passive voice to active voice")
        
        return suggestions
    
    def start_monitoring(self):
        """Start density monitoring"""
        if self.running:
            logger.warning("Density monitoring already running")
            return
        
        logger.info("Starting Density Optimization Enforcer...")
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """Stop density monitoring"""
        if not self.running:
            logger.warning("Density monitoring not running")
            return
        
        logger.info("Stopping Density Optimization Enforcer...")
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
    
    def _monitoring_loop(self):
        """Continuous monitoring loop"""
        while self.running:
            try:
                # Refresh patterns every 30 minutes
                time.sleep(1800)
                self.verbose_patterns = self.db.get_verbose_patterns()
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(300)
    
    def get_density_stats(self) -> Dict[str, Any]:
        """Get density enforcement statistics"""
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            
            # Total analyses in last 24 hours
            cursor.execute('''
                SELECT COUNT(*), AVG(character_efficiency), AVG(estimated_comprehension_time), AVG(value_per_token)
                FROM density_analyses 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            analysis_stats = cursor.fetchone()
            
            # Violations by type
            cursor.execute('''
                SELECT violation_type, COUNT(*), AVG(metric_value)
                FROM density_violations 
                WHERE timestamp > datetime('now', '-24 hours')
                GROUP BY violation_type
            ''')
            violations_by_type = cursor.fetchall()
            
            # Compliance rate
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_compliant THEN 1 ELSE 0 END) as compliant
                FROM density_analyses 
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            compliance_stats = cursor.fetchone()
            
            total_analyses = compliance_stats[0] if compliance_stats and compliance_stats[0] else 1
            compliant_analyses = compliance_stats[1] if compliance_stats and compliance_stats[1] else 0
            compliance_rate = (compliant_analyses / total_analyses) * 100 if total_analyses > 0 else 0
            
            return {
                'total_analyses_24h': analysis_stats[0] if analysis_stats[0] else 0,
                'avg_character_efficiency': analysis_stats[1] if analysis_stats[1] else 0,
                'avg_comprehension_time': analysis_stats[2] if analysis_stats[2] else 0,
                'avg_value_per_token': analysis_stats[3] if analysis_stats[3] else 0,
                'compliance_rate': compliance_rate,
                'violations_by_type': [
                    {'type': row[0], 'count': row[1], 'avg_metric': row[2]}
                    for row in violations_by_type
                ]
            }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python density-optimization-enforcer.py {start|stop|check|stats|analyze}")
        sys.exit(1)
    
    command = sys.argv[1]
    enforcer = DensityOptimizationEnforcer()
    
    if command == 'start':
        enforcer.start_monitoring()
        logger.info("Density Optimization Enforcer started. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            enforcer.stop_monitoring()
    
    elif command == 'stop':
        enforcer.stop_monitoring()
        logger.info("Density Optimization Enforcer stopped")
    
    elif command == 'check':
        if len(sys.argv) < 3:
            print("Usage: python density-optimization-enforcer.py check <text>")
            sys.exit(1)
        
        text = sys.argv[2]
        is_compliant, violations = enforcer.check_density_compliance(text)
        
        print(f"Density Check Results:")
        print(f"Text: {text[:100]}...")
        print(f"Compliant: {is_compliant}")
        
        if violations:
            print("Violations:")
            for violation in violations:
                print(f"  {violation.violation_type}: {violation.metric_value:.3f} (threshold: {violation.threshold_value:.3f})")
                print(f"    Suggestion: {violation.suggested_improvement}")
        
        suggestions = enforcer.get_optimization_suggestions(text)
        if suggestions:
            print("Optimization Suggestions:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  {i}. {suggestion}")
    
    elif command == 'analyze':
        if len(sys.argv) < 3:
            print("Usage: python density-optimization-enforcer.py analyze <text>")
            sys.exit(1)
        
        text = sys.argv[2]
        analysis = enforcer.analyze_text_density(text)
        
        print(f"Density Analysis Results:")
        print(f"Character Efficiency: {analysis.character_efficiency:.1%}")
        print(f"Comprehension Time: {analysis.estimated_comprehension_time:.1f}s")
        print(f"Value per Token: {analysis.value_per_token:.1%}")
        print(f"Verbose Patterns: {analysis.verbose_patterns_count}")
        print(f"Redundancy Score: {analysis.redundancy_score:.1%}")
        print(f"Compliant: {analysis.is_compliant}")
        
        if analysis.violations:
            print("Violations:")
            for violation in analysis.violations:
                print(f"  - {violation}")
    
    elif command == 'stats':
        stats = enforcer.get_density_stats()
        print("Density Enforcement Statistics:")
        print(f"Total Analyses (24h): {stats['total_analyses_24h']}")
        print(f"Average Character Efficiency: {stats['avg_character_efficiency']:.1%}")
        print(f"Average Comprehension Time: {stats['avg_comprehension_time']:.1f}s")
        print(f"Average Value per Token: {stats['avg_value_per_token']:.1%}")
        print(f"Compliance Rate: {stats['compliance_rate']:.1f}%")
        print("Violations by Type:")
        for violation in stats['violations_by_type']:
            print(f"  {violation['type']}: {violation['count']} (avg: {violation['avg_metric']:.3f})")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()