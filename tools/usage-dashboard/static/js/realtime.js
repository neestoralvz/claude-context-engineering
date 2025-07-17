/**
 * Personal Usage Dashboard - Real-time WebSocket Communication
 */

class RealtimeConnection {
    constructor() {
        this.socket = null;
        this.connectionStatus = document.getElementById('connectionStatus');
        this.statusIndicator = this.connectionStatus.querySelector('.status-indicator');
        this.statusText = this.connectionStatus.querySelector('.status-text');
        this.init();
    }

    init() {
        this.connect();
        this.setupConnectionMonitoring();
    }

    connect() {
        try {
            this.socket = io();
            this.setupEventListeners();
            this.updateConnectionStatus('connecting', 'Connecting...');
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.updateConnectionStatus('disconnected', 'Connection failed');
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to dashboard WebSocket');
            this.updateConnectionStatus('connected', 'Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from dashboard WebSocket');
            this.updateConnectionStatus('disconnected', 'Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateConnectionStatus('error', 'Connection error');
        });

        // Dashboard-specific events
        this.socket.on('metrics_update', (data) => {
            this.handleMetricsUpdate(data);
        });

        this.socket.on('command_executed', (data) => {
            this.handleCommandExecuted(data);
        });

        this.socket.on('new_notification', (data) => {
            this.handleNewNotification(data);
        });

        this.socket.on('session_update', (data) => {
            this.handleSessionUpdate(data);
        });

        this.socket.on('goal_progress', (data) => {
            this.handleGoalProgress(data);
        });

        this.socket.on('context_switch', (data) => {
            this.handleContextSwitch(data);
        });
    }

    setupConnectionMonitoring() {
        // Ping server every 30 seconds to maintain connection
        setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('ping');
            }
        }, 30000);

        // Attempt reconnection if disconnected
        setInterval(() => {
            if (!this.socket || !this.socket.connected) {
                console.log('Attempting to reconnect...');
                this.connect();
            }
        }, 5000);
    }

    updateConnectionStatus(status, text) {
        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusText.textContent = text;
    }

    handleMetricsUpdate(data) {
        console.log('Metrics update received:', data);
        
        // Update metrics cards
        if (data.total_sessions !== undefined) {
            document.getElementById('totalSessions').textContent = data.total_sessions;
        }
        if (data.recent_commands !== undefined) {
            document.getElementById('recentCommands').textContent = data.recent_commands;
        }
        if (data.active_sessions !== undefined) {
            document.getElementById('activeSessions').textContent = data.active_sessions;
        }
        if (data.avg_session_duration_minutes !== undefined) {
            document.getElementById('avgSessionDuration').textContent = data.avg_session_duration_minutes;
        }
    }

    handleCommandExecuted(data) {
        console.log('Command executed:', data);
        
        // Add visual notification
        this.showTemporaryNotification(`Command executed: ${data.command_name}`, 'info');
        
        // Refresh recent commands list
        if (window.dashboard) {
            window.dashboard.loadRecentCommands();
        }
    }

    handleNewNotification(data) {
        console.log('New notification:', data);
        
        // Show notification with appropriate styling
        this.showTemporaryNotification(data.message, data.type);
        
        // Refresh notifications list
        if (window.dashboard) {
            window.dashboard.loadNotifications();
        }
    }

    handleSessionUpdate(data) {
        console.log('Session update:', data);
        
        // Refresh current session info
        if (window.dashboard) {
            window.dashboard.loadCurrentSession();
        }
    }

    handleGoalProgress(data) {
        console.log('Goal progress update:', data);
        
        // Show achievement notification if goal completed
        if (data.completed) {
            this.showTemporaryNotification(`🎉 Goal completed: ${data.name}`, 'success');
        }
        
        // Refresh goals
        if (window.dashboard) {
            window.dashboard.loadGoals();
        }
    }

    handleContextSwitch(data) {
        console.log('Context switch:', data);
        
        // Show context switch notification
        this.showTemporaryNotification(
            `Context switched to: ${data.to_context}`, 
            'info'
        );
        
        // Update session info
        if (window.dashboard) {
            window.dashboard.loadCurrentSession();
        }
    }

    showTemporaryNotification(message, type = 'info') {
        // Create temporary notification element
        const notification = document.createElement('div');
        notification.className = `temp-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: this.getNotificationColor(type),
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            fontSize: '14px',
            maxWidth: '300px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationColor(type) {
        const colors = {
            info: '#2563eb',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626'
        };
        return colors[type] || colors.info;
    }

    // Public methods for external use
    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        }
    }

    isConnected() {
        return this.socket && this.socket.connected;
    }
}

// Initialize real-time connection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realtimeConnection = new RealtimeConnection();
});