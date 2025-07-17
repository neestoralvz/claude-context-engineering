# Task Agent Communication Bridge

## Overview

**Core technical component** that enables bidirectional communication between Task agents and Principal agent, solving the communication black hole identified in the current system.

**Purpose**: Implement the technical infrastructure required by the [Task Agent Communication Protocol](../protocols/task-agent-communication-protocol.md) and Principle #56 enhanced requirements.

---

## 🏗️ Architecture Components

### **1. Message Queue System**
```typescript
interface TaskAgentMessage {
  type: 'INITIALIZATION' | 'PROGRESS_UPDATE' | 'MILESTONE_COMPLETED' | 'ERROR_REPORT' | 'COMPLETION' | 'HANDOFF_REQUEST'
  timestamp: string
  agent_id: string
  payload: {
    status?: string
    progress_percentage?: number
    current_action?: string
    tools_active?: string[]
    error_details?: string
    results_summary?: string
    handoff_data?: object
  }
}

interface PrincipalResponse {
  type: 'STATUS_ACKNOWLEDGED' | 'CONTROL_ACCEPTED' | 'ERROR_RECOVERY_INSTRUCTION'
  timestamp: string
  agent_id: string
  action: 'CONTINUE' | 'PAUSE' | 'ABORT' | 'RETRY'
  message?: string
}
```

### **2. Communication Bridge Core**
```typescript
class TaskAgentCommunicationBridge {
  private messageQueue: MessageQueue<TaskAgentMessage>
  private responseQueue: MessageQueue<PrincipalResponse>
  private activeAgents: Map<string, TaskAgentSession>
  private timeoutManager: TimeoutManager
  
  // Message Handling
  async sendStatusUpdate(message: TaskAgentMessage): Promise<void>
  async receiveStatusUpdate(): Promise<TaskAgentMessage | null>
  async sendResponse(response: PrincipalResponse): Promise<void>
  async waitForResponse(agentId: string, timeout: number): Promise<PrincipalResponse>
  
  // Session Management
  async initializeTaskAgent(agentId: string, command: string): Promise<TaskAgentSession>
  async terminateTaskAgent(agentId: string): Promise<void>
  async handleTimeout(agentId: string): Promise<void>
  
  // Error Recovery
  async recoverFromCommunicationFailure(agentId: string): Promise<boolean>
  async escalateToManualTakeover(agentId: string): Promise<void>
}
```

### **3. Task Agent Session Management**
```typescript
interface TaskAgentSession {
  agent_id: string
  command: string
  status: 'INITIALIZING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'TIMEOUT'
  start_time: string
  last_update: string
  progress_percentage: number
  milestones_completed: string[]
  tools_used: string[]
  communication_health: 'HEALTHY' | 'DEGRADED' | 'FAILED'
}

class TaskAgentSessionManager {
  private sessions: Map<string, TaskAgentSession>
  
  async createSession(agentId: string, command: string): Promise<TaskAgentSession>
  async updateSession(agentId: string, update: Partial<TaskAgentSession>): Promise<void>
  async getSession(agentId: string): Promise<TaskAgentSession | null>
  async getAllActiveSessions(): Promise<TaskAgentSession[]>
  async cleanupCompletedSessions(): Promise<void>
}
```

---

## 🔄 Implementation Flow

### **Task Agent Side Implementation**

#### **1. Enhanced Task Tool Integration**
```typescript
// Extension to existing Task tool
class EnhancedTaskTool extends TaskTool {
  private communicationBridge: TaskAgentCommunicationBridge
  
  async executeCommand(command: string, args: any[]): Promise<any> {
    const agentId = this.generateAgentId()
    
    // Initialize communication
    await this.communicationBridge.initializeTaskAgent(agentId, command)
    await this.sendStatusUpdate({
      type: 'INITIALIZATION',
      agent_id: agentId,
      timestamp: new Date().toISOString(),
      payload: {
        status: 'INITIALIZING',
        current_action: `Starting execution of ${command}`,
        tools_active: []
      }
    })
    
    try {
      // Execute with progress reporting
      const result = await this.executeWithProgressReporting(command, args, agentId)
      
      // Completion handoff
      await this.sendStatusUpdate({
        type: 'COMPLETION',
        agent_id: agentId,
        timestamp: new Date().toISOString(),
        payload: {
          status: 'SUCCESS',
          results_summary: this.summarizeResults(result),
          handoff_data: {
            execution_time: this.getExecutionTime(),
            tools_used: this.getToolsUsed(),
            files_modified: this.getFilesModified()
          }
        }
      })
      
      // Request handoff
      await this.sendStatusUpdate({
        type: 'HANDOFF_REQUEST',
        agent_id: agentId,
        timestamp: new Date().toISOString(),
        payload: {
          ready_for_handoff: true
        }
      })
      
      // Wait for handoff confirmation
      await this.waitForHandoffConfirmation(agentId)
      
      return result
      
    } catch (error) {
      await this.handleError(agentId, error)
      throw error
    }
  }
  
  private async executeWithProgressReporting(command: string, args: any[], agentId: string): Promise<any> {
    const startTime = Date.now()
    let lastUpdateTime = startTime
    
    // Create progress reporting wrapper
    const progressReporter = {
      reportProgress: async (action: string, percentage: number, toolsActive: string[]) => {
        const now = Date.now()
        if (now - lastUpdateTime >= 30000) { // Report every 30 seconds minimum
          await this.sendStatusUpdate({
            type: 'PROGRESS_UPDATE',
            agent_id: agentId,
            timestamp: new Date().toISOString(),
            payload: {
              status: 'IN_PROGRESS',
              progress_percentage: percentage,
              current_action: action,
              tools_active: toolsActive
            }
          })
          lastUpdateTime = now
        }
      },
      
      reportMilestone: async (milestone: string, percentage: number) => {
        await this.sendStatusUpdate({
          type: 'MILESTONE_COMPLETED',
          agent_id: agentId,
          timestamp: new Date().toISOString(),
          payload: {
            milestone,
            progress_percentage: percentage,
            current_action: `Completed: ${milestone}`
          }
        })
      }
    }
    
    // Execute original command with progress reporting
    return await super.executeCommand(command, args, progressReporter)
  }
}
```

#### **2. Automatic Progress Detection**
```typescript
class ProgressDetector {
  static wrapToolCall(toolName: string, toolCall: Function, reporter: ProgressReporter): Function {
    return async (...args: any[]) => {
      await reporter.reportProgress(`Executing ${toolName}`, null, [toolName])
      const result = await toolCall(...args)
      await reporter.reportProgress(`Completed ${toolName}`, null, [])
      return result
    }
  }
  
  static detectMilestones(command: string): string[] {
    const milestonePatterns = {
      'sync-claude-md': ['Registry analysis', 'Pattern identification', 'Documentation generation', 'Validation', 'Final sync'],
      'build': ['Dependency analysis', 'Compilation', 'Bundling', 'Optimization', 'Output generation'],
      'analyze': ['Code scanning', 'Pattern analysis', 'Dependency mapping', 'Report generation'],
      'implement': ['Planning', 'Code generation', 'Integration', 'Testing', 'Validation']
    }
    
    return milestonePatterns[command] || ['Initialization', 'Execution', 'Completion']
  }
}
```

### **Principal Agent Side Implementation**

#### **1. Status Receiver and Display Manager**
```typescript
class PrincipalAgentStatusHandler {
  private communicationBridge: TaskAgentCommunicationBridge
  private displayManager: ProgressDisplayManager
  private sessionManager: TaskAgentSessionManager
  
  async monitorTaskAgent(agentId: string): Promise<void> {
    const session = await this.sessionManager.getSession(agentId)
    if (!session) throw new Error(`Session ${agentId} not found`)
    
    // Start monitoring loop
    while (session.status === 'ACTIVE') {
      try {
        const message = await this.communicationBridge.receiveStatusUpdate()
        if (message && message.agent_id === agentId) {
          await this.processStatusUpdate(message)
        }
        
        // Check for communication timeout
        if (this.isTimeout(session)) {
          await this.handleCommunicationTimeout(agentId)
        }
        
        await this.sleep(1000) // Check every second
      } catch (error) {
        await this.handleMonitoringError(agentId, error)
      }
    }
  }
  
  private async processStatusUpdate(message: TaskAgentMessage): Promise<void> {
    // Update session
    await this.sessionManager.updateSession(message.agent_id, {
      last_update: message.timestamp,
      progress_percentage: message.payload.progress_percentage || 0,
      status: this.mapMessageToStatus(message.type)
    })
    
    // Update user display
    await this.displayManager.updateProgress(message)
    
    // Send acknowledgment
    await this.communicationBridge.sendResponse({
      type: 'STATUS_ACKNOWLEDGED',
      timestamp: new Date().toISOString(),
      agent_id: message.agent_id,
      action: 'CONTINUE'
    })
    
    // Handle completion and handoff
    if (message.type === 'HANDOFF_REQUEST') {
      await this.handleHandoff(message)
    }
  }
  
  private async handleHandoff(message: TaskAgentMessage): Promise<void> {
    // Accept control transfer
    await this.communicationBridge.sendResponse({
      type: 'CONTROL_ACCEPTED',
      timestamp: new Date().toISOString(),
      agent_id: message.agent_id,
      action: 'CONTINUE',
      message: 'Control transfer accepted. Task agent work completed successfully.'
    })
    
    // Update session status
    await this.sessionManager.updateSession(message.agent_id, {
      status: 'COMPLETED'
    })
    
    // Display completion to user
    await this.displayManager.showCompletion(message)
    
    // Clean up session
    await this.sessionManager.cleanupCompletedSessions()
  }
}
```

#### **2. Progress Display Manager**
```typescript
class ProgressDisplayManager {
  async showInitialization(message: TaskAgentMessage): Promise<void> {
    const display = `
╔═══════════════════════════════════════════════════════════╗
║                🎯 CLAUDE CODE COMMAND EXECUTION           ║
╠═══════════════════════════════════════════════════════════╣
║ Command: ${message.payload.command}                        ║
║ Task Agent: ${message.agent_id}                           ║
║ Status: INITIALIZING...                                   ║
╚═══════════════════════════════════════════════════════════╝

🚀 TASK AGENT DEPLOYED FOR COMMAND EXECUTION...
📊 Communication bridge established
⚡ Monitoring progress...
`
    console.log(display)
  }
  
  async updateProgress(message: TaskAgentMessage): Promise<void> {
    if (message.type === 'PROGRESS_UPDATE') {
      const progress = `
📊 COMMAND PROGRESS: ${message.payload.command}
├─ Progress: ${message.payload.progress_percentage}%
├─ Current Action: ${message.payload.current_action}
├─ Active Tools: ${message.payload.tools_active?.join(', ') || 'None'}
└─ Last Update: ${new Date(message.timestamp).toLocaleTimeString()}
`
      console.log(progress)
    }
    
    if (message.type === 'MILESTONE_COMPLETED') {
      const milestone = `
🎯 MILESTONE COMPLETED: ${message.payload.milestone}
├─ Progress: ${message.payload.progress_percentage}%
├─ Status: ✅ Completed
└─ Next: ${message.payload.next_action || 'Continuing execution...'}
`
      console.log(milestone)
    }
  }
  
  async showCompletion(message: TaskAgentMessage): Promise<void> {
    const completion = `
╔═══════════════════════════════════════════════════════════╗
║              ✅ COMMAND EXECUTION COMPLETED               ║
╠═══════════════════════════════════════════════════════════╣
║ Command: ${message.payload.command}                        ║
║ Status: ${message.payload.status} ✅                       ║
║ Task Agent: ${message.agent_id}                           ║
║ Results: ${message.payload.results_summary}               ║
╚═══════════════════════════════════════════════════════════╝

🎯 Control returned to principal agent. Ready for next command.
`
    console.log(completion)
  }
  
  async showError(agentId: string, error: any): Promise<void> {
    const errorDisplay = `
🚨 TASK AGENT ERROR: ${agentId}
├─ Error: ${error.message}
├─ Recovery: Attempting automatic recovery...
└─ Fallback: Principal agent will take over if recovery fails
`
    console.log(errorDisplay)
  }
}
```

---

## 🚨 Error Handling & Recovery

### **Communication Failure Recovery**
```typescript
class CommunicationFailureRecovery {
  private maxRetries = 3
  private retryDelays = [1000, 3000, 5000] // Progressive delays
  
  async recoverFromTimeout(agentId: string): Promise<boolean> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Attempt to re-establish communication
        await this.pingTaskAgent(agentId)
        await this.requestStatusUpdate(agentId)
        
        // Wait for response
        const response = await this.waitForResponse(agentId, 5000)
        if (response) {
          console.log(`🔄 Communication recovered for agent ${agentId}`)
          return true
        }
      } catch (error) {
        console.log(`❌ Recovery attempt ${attempt + 1} failed for agent ${agentId}`)
        await this.sleep(this.retryDelays[attempt])
      }
    }
    
    // Recovery failed - escalate to manual takeover
    await this.escalateToManualTakeover(agentId)
    return false
  }
  
  private async escalateToManualTakeover(agentId: string): Promise<void> {
    console.log(`🚨 ESCALATING TO MANUAL TAKEOVER: Agent ${agentId} communication failed`)
    console.log(`🔄 Principal agent taking over execution...`)
    
    // Mark session as failed
    await this.sessionManager.updateSession(agentId, {
      status: 'FAILED',
      communication_health: 'FAILED'
    })
    
    // Principal agent continues execution
    // Implementation would continue from last known checkpoint
  }
}
```

### **Timeout Management**
```typescript
class TimeoutManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly COMMUNICATION_TIMEOUT = 60000 // 60 seconds
  
  startTimeout(agentId: string, callback: () => void): void {
    this.clearTimeout(agentId)
    
    const timeout = setTimeout(() => {
      console.log(`⏰ Communication timeout for agent ${agentId}`)
      callback()
    }, this.COMMUNICATION_TIMEOUT)
    
    this.timeouts.set(agentId, timeout)
  }
  
  resetTimeout(agentId: string, callback: () => void): void {
    this.startTimeout(agentId, callback) // Restart timeout
  }
  
  clearTimeout(agentId: string): void {
    const timeout = this.timeouts.get(agentId)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(agentId)
    }
  }
}
```

---

## 🔧 Integration Points

### **1. Task Tool Enhancement**
- Extend existing Task tool with communication bridge
- Add automatic progress reporting wrappers
- Implement milestone detection and reporting
- Add error communication and recovery

### **2. Principal Agent Integration**
- Monitor Task agent communication in background
- Display progress updates to user in real-time
- Handle handoff requests and control transfer
- Manage communication failures and recovery

### **3. Command System Integration**
- Update all slash commands to use enhanced Task tool
- Implement command-specific milestone definitions
- Add communication protocol compliance validation
- Integrate with existing P55/P56 requirements

---

## 📊 Performance Metrics

### **Communication Efficiency**
- **Message Latency**: Target <500ms for status updates
- **Update Frequency**: Every 30 seconds minimum during execution  
- **Handoff Speed**: <1 second for control transfer
- **Recovery Time**: <10 seconds for communication failure recovery

### **User Experience Metrics**
- **Progress Visibility**: 100% transparency into Task agent work
- **Communication Continuity**: No communication black holes
- **Error Transparency**: Immediate visibility of issues and recovery
- **Completion Confirmation**: Clear handoff notification to user

---

## 🎯 Next Steps

1. **Implement Message Queue System** - Core communication infrastructure
2. **Enhance Task Tool** - Add communication bridge integration
3. **Create Principal Status Handler** - Progress monitoring and display
4. **Test Communication Protocol** - Validate bidirectional flow
5. **Update Commands** - Integrate with existing slash commands
6. **Performance Optimization** - Ensure sub-second response times

---

**Status**: Technical specification complete
**Dependencies**: Task Agent Communication Protocol, Enhanced Principle #56
**Integration**: Ready for implementation with existing Claude Code architecture