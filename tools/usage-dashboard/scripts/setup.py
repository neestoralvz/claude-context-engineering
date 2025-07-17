#!/usr/bin/env python3
"""
Setup script for Personal Usage Dashboard
"""

import sys
import subprocess
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    requirements_file = Path(__file__).parent.parent / 'requirements.txt'
    
    print("📦 Installing Python requirements...")
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
        ])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def setup_database():
    """Initialize database"""
    print("🗄️ Setting up database...")
    try:
        # Add parent directory to path
        sys.path.insert(0, str(Path(__file__).parent.parent))
        
        from config.database import init_database
        from config.settings import DEFAULT_GOALS
        
        init_database()
        
        # Add default goals
        from config.database import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        
        for goal in DEFAULT_GOALS:
            cursor.execute('''
                INSERT OR IGNORE INTO goals (name, description, target_metric, target_value)
                VALUES (?, ?, ?, ?)
            ''', (goal['name'], goal['description'], goal['target_metric'], goal['target_value']))
        
        conn.commit()
        conn.close()
        
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False
    return True

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    
    base_dir = Path(__file__).parent.parent
    directories = [
        base_dir / 'data',
        base_dir / 'data' / 'backups',
        base_dir / 'logs'
    ]
    
    for directory in directories:
        directory.mkdir(exist_ok=True)
        print(f"  Created: {directory}")
    
    print("✅ Directories created successfully")
    return True

def check_dependencies():
    """Check system dependencies"""
    print("🔍 Checking system dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} OK")
    
    # Check if pip is available
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', '--version'], 
                            stdout=subprocess.DEVNULL)
        print("✅ pip OK")
    except subprocess.CalledProcessError:
        print("❌ pip not available")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Personal Usage Dashboard\n")
    
    if not check_dependencies():
        sys.exit(1)
    
    if not create_directories():
        sys.exit(1)
    
    if not install_requirements():
        sys.exit(1)
    
    if not setup_database():
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo start the dashboard:")
    print("  python main.py")
    print("\nTo start with custom host/port:")
    print("  python main.py --host 0.0.0.0 --port 8080")
    print("\nTo enable debug mode:")
    print("  python main.py --debug")

if __name__ == '__main__':
    main()