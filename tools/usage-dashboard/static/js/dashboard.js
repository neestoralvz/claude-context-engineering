/**
 * Personal Usage Dashboard - Main JavaScript
 */

class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        // Notification click handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                this.handleNotificationClick(e.target.closest('.notification-item'));
            }
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadMetricsSummary(),
                this.loadCurrentSession(),
                this.loadGoals(),
                this.loadRecentCommands(),
                this.loadNotifications()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadMetricsSummary() {
        try {
            const response = await fetch('/api/metrics/summary');
            const metrics = await response.json();

            document.getElementById('totalSessions').textContent = metrics.total_sessions;
            document.getElementById('recentCommands').textContent = metrics.recent_commands;
            document.getElementById('activeSessions').textContent = metrics.active_sessions;
            document.getElementById('avgSessionDuration').textContent = metrics.avg_session_duration_minutes;
        } catch (error) {
            console.error('Error loading metrics summary:', error);
        }
    }

    async loadCurrentSession() {
        try {
            const response = await fetch('/api/session/current');
            const session = await response.json();

            if (session.error) {
                document.getElementById('currentSession').innerHTML = '<p>No active session</p>';
                return;
            }

            const sessionInfo = `
                <div class="info-item">
                    <span>Session ID:</span>
                    <span>${session.session_id}</span>
                </div>
                <div class="info-item">
                    <span>Working Directory:</span>
                    <span>${session.working_directory}</span>
                </div>
                <div class="info-item">
                    <span>Commands Used:</span>
                    <span>${session.commands_used}</span>
                </div>
                <div class="info-item">
                    <span>Context Switches:</span>
                    <span>${session.context_switches}</span>
                </div>
                <div class="info-item">
                    <span>Started:</span>
                    <span>${this.formatDateTime(session.start_time)}</span>
                </div>
            `;

            document.getElementById('currentSession').innerHTML = sessionInfo;
        } catch (error) {
            console.error('Error loading current session:', error);
        }
    }

    async loadGoals() {
        try {
            const response = await fetch('/api/goals');
            const goals = await response.json();

            if (goals.length === 0) {
                document.getElementById('goalsContainer').innerHTML = '<p>No goals set</p>';
                return;
            }

            const goalsHtml = goals.map(goal => `
                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-name">${goal.name}</span>
                        <span class="goal-progress">${goal.progress_percent}%</span>
                    </div>
                    <div class="goal-description">${goal.description}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress_percent}%"></div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        ${goal.current_value} / ${goal.target_value} ${goal.target_metric}
                    </div>
                </div>
            `).join('');

            document.getElementById('goalsContainer').innerHTML = goalsHtml;
        } catch (error) {
            console.error('Error loading goals:', error);
        }
    }

    async loadRecentCommands() {
        try {
            const response = await fetch('/api/commands/recent?limit=10');
            const commands = await response.json();

            if (commands.length === 0) {
                document.getElementById('commandsList').innerHTML = '<p>No recent commands</p>';
                return;
            }

            const commandsHtml = commands.map(command => `
                <div class="command-item">
                    <div>
                        <div class="command-name">${command.command_name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${command.working_directory}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="command-time">${this.formatTime(command.execution_time)}</span>
                        <div class="command-status ${command.success ? 'success' : 'error'}"></div>
                    </div>
                </div>
            `).join('');

            document.getElementById('commandsList').innerHTML = commandsHtml;
        } catch (error) {
            console.error('Error loading recent commands:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications/unread');
            const notifications = await response.json();

            if (notifications.length === 0) {
                document.getElementById('notificationsList').innerHTML = '<p>No unread notifications</p>';
                return;
            }

            const notificationsHtml = notifications.map(notification => `
                <div class="notification-item" data-notification-id="${notification.id}">
                    <div class="notification-header">
                        <span class="notification-type ${notification.type}">${notification.type}</span>
                        <span class="notification-time">${this.formatTime(notification.created_at)}</span>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            `).join('');

            document.getElementById('notificationsList').innerHTML = notificationsHtml;
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async handleNotificationClick(notificationElement) {
        const notificationId = notificationElement.dataset.notificationId;
        
        try {
            await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
            notificationElement.style.opacity = '0.6';
            notificationElement.style.pointerEvents = 'none';
            
            // Reload notifications after a short delay
            setTimeout(() => this.loadNotifications(), 500);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    startPeriodicUpdates() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.loadMetricsSummary();
            this.loadCurrentSession();
        }, 30000);

        // Update commands and notifications every 10 seconds
        setInterval(() => {
            this.loadRecentCommands();
            this.loadNotifications();
        }, 10000);

        // Update goals every 5 minutes
        setInterval(() => {
            this.loadGoals();
        }, 300000);
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    formatTime(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});