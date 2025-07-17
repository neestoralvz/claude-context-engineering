"""
Usage Analytics Engine - Analyze personal Claude Code usage patterns
"""

import sqlite3
import json
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import sys
from pathlib import Path

# Add config to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config.database import get_connection

class UsageAnalyzer:
    """Analyze personal usage patterns and generate insights"""
    
    def __init__(self):
        self.conn = get_connection()
    
    def get_daily_summary(self, days=7):
        """Get daily usage summary for the last N days"""
        cursor = self.conn.cursor()
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                DATE(execution_time) as date,
                COUNT(*) as total_commands,
                COUNT(DISTINCT session_id) as sessions,
                AVG(execution_duration) as avg_duration,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_commands
            FROM commands
            WHERE execution_time >= ?
            GROUP BY DATE(execution_time)
            ORDER BY date DESC
        ''', (start_date.isoformat(),))
        
        daily_data = []
        for row in cursor.fetchall():
            daily_data.append({
                'date': row[0],
                'total_commands': row[1],
                'sessions': row[2],
                'avg_duration': round(row[3] or 0, 2),
                'successful_commands': row[4],
                'success_rate': round((row[4] / row[1] * 100) if row[1] > 0 else 0, 1)
            })
        
        return daily_data
    
    def get_command_frequency(self, days=7):
        """Get most frequently used commands"""
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                command_name,
                COUNT(*) as frequency,
                AVG(execution_duration) as avg_duration,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successes
            FROM commands
            WHERE execution_time >= ?
            GROUP BY command_name
            ORDER BY frequency DESC
            LIMIT 20
        ''', (start_date.isoformat(),))
        
        commands = []
        for row in cursor.fetchall():
            commands.append({
                'command_name': row[0],
                'frequency': row[1],
                'avg_duration': round(row[2] or 0, 2),
                'successes': row[3],
                'success_rate': round((row[3] / row[1] * 100) if row[1] > 0 else 0, 1)
            })
        
        return commands
    
    def get_session_patterns(self, days=7):
        """Analyze session patterns and timing"""
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                session_id,
                start_time,
                end_time,
                commands_used,
                context_switches,
                working_directory,
                julianday(end_time) - julianday(start_time) as duration_days
            FROM sessions
            WHERE start_time >= ? AND end_time IS NOT NULL
            ORDER BY start_time DESC
        ''', (start_date.isoformat(),))
        
        sessions = []
        total_duration = 0
        context_switches_total = 0
        
        for row in cursor.fetchall():
            duration_minutes = (row[6] * 24 * 60) if row[6] else 0
            total_duration += duration_minutes
            context_switches_total += row[4]
            
            sessions.append({
                'session_id': row[0],
                'start_time': row[1],
                'end_time': row[2],
                'commands_used': row[3],
                'context_switches': row[4],
                'working_directory': row[5],
                'duration_minutes': round(duration_minutes, 1)
            })
        
        avg_duration = total_duration / len(sessions) if sessions else 0
        avg_context_switches = context_switches_total / len(sessions) if sessions else 0
        
        return {
            'sessions': sessions,
            'avg_duration_minutes': round(avg_duration, 1),
            'avg_context_switches': round(avg_context_switches, 1),
            'total_sessions': len(sessions)
        }
    
    def get_productivity_insights(self, days=7):
        """Generate productivity insights and recommendations"""
        daily_summary = self.get_daily_summary(days)
        command_frequency = self.get_command_frequency(days)
        session_patterns = self.get_session_patterns(days)
        
        insights = []
        
        # Command usage insights
        if command_frequency:
            top_command = command_frequency[0]
            insights.append({
                'type': 'command_usage',
                'title': 'Most Used Command',
                'description': f"Your most used command is '{top_command['command_name']}' with {top_command['frequency']} uses",
                'metric': top_command['frequency'],
                'recommendation': 'Consider creating shortcuts or aliases for frequently used commands'
            })
        
        # Session duration insights
        if session_patterns['avg_duration_minutes'] > 0:
            avg_duration = session_patterns['avg_duration_minutes']
            if avg_duration > 90:
                insights.append({
                    'type': 'session_duration',
                    'title': 'Long Sessions Detected',
                    'description': f"Average session duration is {avg_duration:.1f} minutes",
                    'metric': avg_duration,
                    'recommendation': 'Consider taking breaks every 60-90 minutes to maintain focus'
                })
            elif avg_duration < 15:
                insights.append({
                    'type': 'session_duration',
                    'title': 'Short Sessions',
                    'description': f"Average session duration is {avg_duration:.1f} minutes",
                    'metric': avg_duration,
                    'recommendation': 'Longer sessions might improve context retention and productivity'
                })
        
        # Context switching insights
        if session_patterns['avg_context_switches'] > 8:
            insights.append({
                'type': 'context_switching',
                'title': 'High Context Switching',
                'description': f"Average {session_patterns['avg_context_switches']:.1f} context switches per session",
                'metric': session_patterns['avg_context_switches'],
                'recommendation': 'Try to group related tasks to reduce context switching overhead'
            })
        
        # Success rate insights
        if daily_summary:
            avg_success_rate = sum(day['success_rate'] for day in daily_summary) / len(daily_summary)
            if avg_success_rate < 85:
                insights.append({
                    'type': 'success_rate',
                    'title': 'Command Success Rate',
                    'description': f"Average success rate is {avg_success_rate:.1f}%",
                    'metric': avg_success_rate,
                    'recommendation': 'Review failed commands to identify patterns or areas for improvement'
                })
        
        # Consistency insights
        if len(daily_summary) >= 3:
            daily_commands = [day['total_commands'] for day in daily_summary]
            consistency = 1 - (max(daily_commands) - min(daily_commands)) / max(daily_commands) if max(daily_commands) > 0 else 0
            
            if consistency < 0.7:
                insights.append({
                    'type': 'consistency',
                    'title': 'Usage Consistency',
                    'description': f"Daily usage varies significantly (consistency: {consistency:.1%})",
                    'metric': consistency * 100,
                    'recommendation': 'Try to maintain more consistent daily usage patterns'
                })
        
        return insights
    
    def get_time_patterns(self, days=30):
        """Analyze usage patterns by time of day and day of week"""
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                strftime('%H', execution_time) as hour,
                strftime('%w', execution_time) as day_of_week,
                COUNT(*) as command_count
            FROM commands
            WHERE execution_time >= ?
            GROUP BY hour, day_of_week
        ''', (start_date.isoformat(),))
        
        hourly_pattern = defaultdict(int)
        weekly_pattern = defaultdict(int)
        
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        for row in cursor.fetchall():
            hour = int(row[0])
            day_of_week = int(row[1])
            count = row[2]
            
            hourly_pattern[hour] += count
            weekly_pattern[day_names[day_of_week]] += count
        
        # Find peak hours and days
        peak_hour = max(hourly_pattern.items(), key=lambda x: x[1]) if hourly_pattern else (0, 0)
        peak_day = max(weekly_pattern.items(), key=lambda x: x[1]) if weekly_pattern else ('Monday', 0)
        
        return {
            'hourly_pattern': dict(hourly_pattern),
            'weekly_pattern': dict(weekly_pattern),
            'peak_hour': {'hour': peak_hour[0], 'commands': peak_hour[1]},
            'peak_day': {'day': peak_day[0], 'commands': peak_day[1]}
        }
    
    def get_directory_usage(self, days=7):
        """Analyze usage by working directory"""
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                working_directory,
                COUNT(*) as command_count,
                COUNT(DISTINCT session_id) as session_count
            FROM commands
            WHERE execution_time >= ? AND working_directory IS NOT NULL
            GROUP BY working_directory
            ORDER BY command_count DESC
            LIMIT 10
        ''', (start_date.isoformat(),))
        
        directories = []
        for row in cursor.fetchall():
            # Simplify directory path for display
            dir_path = row[0]
            if len(dir_path) > 50:
                dir_path = '...' + dir_path[-47:]
            
            directories.append({
                'directory': dir_path,
                'full_path': row[0],
                'command_count': row[1],
                'session_count': row[2]
            })
        
        return directories
    
    def export_analytics_data(self, days=30):
        """Export comprehensive analytics data"""
        analytics_data = {
            'generated_at': datetime.now().isoformat(),
            'period_days': days,
            'daily_summary': self.get_daily_summary(days),
            'command_frequency': self.get_command_frequency(days),
            'session_patterns': self.get_session_patterns(days),
            'productivity_insights': self.get_productivity_insights(days),
            'time_patterns': self.get_time_patterns(days),
            'directory_usage': self.get_directory_usage(days)
        }
        
        return analytics_data
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def generate_analytics_report(days=7, output_file=None):
    """Generate a comprehensive analytics report"""
    analyzer = UsageAnalyzer()
    
    try:
        data = analyzer.export_analytics_data(days)
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Analytics report exported to: {output_file}")
        
        return data
        
    finally:
        analyzer.close()

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Usage Analytics CLI')
    parser.add_argument('--days', type=int, default=7, help='Number of days to analyze')
    parser.add_argument('--export', help='Export data to file')
    parser.add_argument('--insights', action='store_true', help='Show productivity insights')
    parser.add_argument('--patterns', action='store_true', help='Show time patterns')
    
    args = parser.parse_args()
    
    analyzer = UsageAnalyzer()
    
    try:
        if args.export:
            generate_analytics_report(args.days, args.export)
        elif args.insights:
            insights = analyzer.get_productivity_insights(args.days)
            print(f"\n📊 Productivity Insights (Last {args.days} days):")
            for insight in insights:
                print(f"\n🔍 {insight['title']}")
                print(f"   {insight['description']}")
                print(f"   💡 {insight['recommendation']}")
        elif args.patterns:
            patterns = analyzer.get_time_patterns(args.days)
            print(f"\n⏰ Time Patterns (Last {args.days} days):")
            print(f"Peak Hour: {patterns['peak_hour']['hour']}:00 ({patterns['peak_hour']['commands']} commands)")
            print(f"Peak Day: {patterns['peak_day']['day']} ({patterns['peak_day']['commands']} commands)")
        else:
            # Default: show daily summary
            summary = analyzer.get_daily_summary(args.days)
            print(f"\n📈 Daily Usage Summary (Last {args.days} days):")
            for day in summary:
                print(f"{day['date']}: {day['total_commands']} commands, {day['sessions']} sessions, {day['success_rate']}% success")
    
    finally:
        analyzer.close()