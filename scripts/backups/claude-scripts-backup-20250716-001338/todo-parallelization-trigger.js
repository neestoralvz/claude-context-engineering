#!/usr/bin/env node
/**
 * Automatic Parallelization Trigger System for Todo Updates
 * Auto-executes parallelization analysis whenever todos are updated
 */

const fs = require('fs');
const path = require('path');
const ParallelizationAnalyzer = require('./parallelization-analyzer.js');

class TodoParallelizationTrigger {
    constructor() {
        this.analyzer = new ParallelizationAnalyzer();
        this.analysisCache = new Map();
        this.lastAnalysisTime = 0;
        this.minAnalysisInterval = 1000; // 1 second minimum between analyses
        this.triggers = {
            todoUpdate: true,
            statusChange: true,
            priorityChange: true,
            newTodo: true,
            completedTodo: true
        };
    }

    /**
     * Main trigger function - called automatically on todo updates
     */
    async triggerParallelizationAnalysis(todos, changeType = 'update') {
        const now = Date.now();
        
        // Rate limiting to prevent excessive analysis
        if (now - this.lastAnalysisTime < this.minAnalysisInterval) {
            console.log('⏱️ Analysis rate limited - skipping');
            return this.getLatestCachedAnalysis();
        }
        
        console.log(`🚀 AUTO-TRIGGER: Parallelization analysis on ${changeType}`);
        console.log(`📊 Analyzing ${todos.length} todos for parallel opportunities`);
        
        try {
            const analysis = await this.analyzer.analyzeTodoParallelization(todos);
            this.lastAnalysisTime = now;
            
            // Cache the analysis
            const cacheKey = this.generateCacheKey(todos);
            this.analysisCache.set(cacheKey, {
                analysis,
                timestamp: now,
                todoCount: todos.length,
                changeType
            });
            
            // Display priority-based recommendations
            this.displayPriorityRecommendations(analysis, changeType);
            
            // Auto-execute high-priority parallelization if beneficial
            if (this.shouldAutoExecuteParallelization(analysis, changeType)) {
                await this.autoExecuteParallelization(analysis, todos);
            }
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Parallelization analysis failed:', error.message);
            return this.getLatestCachedAnalysis();
        }
    }

    /**
     * Display priority-based recommendations
     */
    displayPriorityRecommendations(analysis, changeType) {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              🎯 PARALLELIZATION PRIORITY ANALYSIS         ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║ Trigger: ${changeType.toUpperCase().padEnd(20)} | Net Benefit: ${analysis.analysis.parallelBenefit.netBenefit.toString().padEnd(10)} ║`);
        console.log(`║ Threshold: ${analysis.analysis.parallelBenefit.threshold.toString().padEnd(17)} | Passes: ${analysis.analysis.parallelBenefit.passesThreshold ? '✅ YES' : '❌ NO'.padEnd(10)} ║`);
        console.log('╚═══════════════════════════════════════════════════════════╝');
        
        if (analysis.analysis.parallelBenefit.passesThreshold) {
            console.log('\n🟢 HIGH PRIORITY PARALLELIZATION RECOMMENDED:');
            analysis.analysis.recommendations.forEach((rec, index) => {
                if (rec.priority === 'HIGH') {
                    console.log(`   ${index + 1}. ${rec.action}`);
                    console.log(`      Speedup: ${rec.estimatedSpeedup} | Potential: ${rec.parallelPotential}`);
                }
            });
        } else {
            console.log('\n🟡 SEQUENTIAL EXECUTION RECOMMENDED:');
            console.log(`   Reason: ${analysis.analysis.recommendations[0]?.reason || 'Insufficient parallel benefit'}`);
        }
        
        // Show top parallel opportunities
        if (analysis.analysis.parallelGroups.length > 0) {
            console.log('\n📊 PARALLEL OPPORTUNITIES DETECTED:');
            analysis.analysis.parallelGroups.forEach((group, index) => {
                console.log(`   Group ${index + 1} (${group.type}): ${group.todos.length} todos`);
                console.log(`   └── Potential: ${Math.round(group.parallelPotential * 100)}% | Speedup: ${group.estimatedSpeedup}x`);
            });
        }
    }

    /**
     * Determine if parallelization should auto-execute
     */
    shouldAutoExecuteParallelization(analysis, changeType) {
        // Auto-execute conditions
        const conditions = {
            highBenefit: analysis.analysis.parallelBenefit.netBenefit >= 0.5,
            multipleGroups: analysis.analysis.parallelGroups.length >= 2,
            highPriorityTodos: analysis.analysis.recommendations.some(r => r.priority === 'HIGH'),
            statusUpdate: ['completion', 'new_todo', 'priority_change'].includes(changeType),
            feasibleResources: analysis.analysis.resourceAnalysis.feasible
        };
        
        const autoExecute = conditions.highBenefit && 
                           conditions.multipleGroups && 
                           conditions.feasibleResources;
        
        if (autoExecute) {
            console.log('\n⚡ AUTO-EXECUTION CRITERIA MET:');
            Object.entries(conditions).forEach(([key, value]) => {
                console.log(`   ${key}: ${value ? '✅' : '❌'}`);
            });
        }
        
        return autoExecute;
    }

    /**
     * Auto-execute parallelization for high-benefit scenarios
     */
    async autoExecuteParallelization(analysis, todos) {
        console.log('\n🚀 AUTO-EXECUTING PARALLELIZATION:');
        
        // Deploy Task agents based on recommendations
        for (const recommendation of analysis.analysis.recommendations) {
            if (recommendation.type === 'PARALLEL_GROUP' && recommendation.priority === 'HIGH') {
                console.log(`\n🤖 Deploying Task agents for Group ${recommendation.groupId}:`);
                console.log(`   Todos: ${recommendation.todos.length}`);
                console.log(`   Expected speedup: ${recommendation.estimatedSpeedup}`);
                console.log(`   Action: ${recommendation.action}`);
                
                // Here you would typically deploy Task agents
                // For now, we simulate the deployment
                await this.simulateTaskAgentDeployment(recommendation);
            }
        }
    }

    /**
     * Simulate Task agent deployment (placeholder for real implementation)
     */
    async simulateTaskAgentDeployment(recommendation) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`   ✅ Task agents deployed for Group ${recommendation.groupId}`);
                console.log(`   📊 Estimated completion: ${Math.round(Math.random() * 10 + 5)}min`);
                resolve();
            }, 100);
        });
    }

    /**
     * Generate cache key for analysis results
     */
    generateCacheKey(todos) {
        const todoSignature = todos.map(t => `${t.id}-${t.status}-${t.priority}`).sort().join('|');
        return Buffer.from(todoSignature).toString('base64').substring(0, 16);
    }

    /**
     * Get latest cached analysis if available
     */
    getLatestCachedAnalysis() {
        const entries = Array.from(this.analysisCache.entries());
        if (entries.length === 0) return null;
        
        const latest = entries.reduce((latest, [key, value]) => 
            value.timestamp > latest.timestamp ? value : latest
        );
        
        console.log(`📋 Using cached analysis from ${new Date(latest.timestamp).toLocaleTimeString()}`);
        return latest.analysis;
    }

    /**
     * Configure trigger sensitivity
     */
    configureTriggers(config) {
        this.triggers = { ...this.triggers, ...config };
        console.log('⚙️ Trigger configuration updated:', this.triggers);
    }

    /**
     * Get analysis statistics
     */
    getAnalysisStats() {
        const cacheSize = this.analysisCache.size;
        const analyses = Array.from(this.analysisCache.values());
        
        return {
            totalAnalyses: cacheSize,
            avgBenefit: analyses.length > 0 ? 
                analyses.reduce((sum, a) => sum + a.analysis.analysis.parallelBenefit.netBenefit, 0) / analyses.length : 0,
            successfulParallelizations: analyses.filter(a => a.analysis.analysis.parallelBenefit.passesThreshold).length,
            lastAnalysis: analyses.length > 0 ? new Date(Math.max(...analyses.map(a => a.timestamp))) : null
        };
    }

    /**
     * Integration hook for todo systems
     */
    createTodoUpdateHook() {
        return {
            onTodoUpdate: (todos, changeType) => this.triggerParallelizationAnalysis(todos, changeType),
            onTodoComplete: (todos) => this.triggerParallelizationAnalysis(todos, 'completion'),
            onTodoAdd: (todos) => this.triggerParallelizationAnalysis(todos, 'new_todo'),
            onPriorityChange: (todos) => this.triggerParallelizationAnalysis(todos, 'priority_change')
        };
    }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoParallelizationTrigger;
}

// CLI usage and testing
if (require.main === module) {
    const trigger = new TodoParallelizationTrigger();
    
    // Example usage with sample todos
    const sampleTodos = [
        { id: '1', content: 'Implement real parallelization analysis system for todo updates', status: 'completed', priority: 'high' },
        { id: '2', content: 'Create parallel-over-sequential command with mathematical validation', status: 'completed', priority: 'high' },
        { id: '3', content: 'Add automatic parallelization triggers for todo updates', status: 'in_progress', priority: 'medium' },
        { id: '4', content: 'Integrate dependency analysis with todo workflow optimization', status: 'pending', priority: 'medium' }
    ];
    
    // Simulate todo updates
    async function simulateTodoUpdates() {
        console.log('🧪 TESTING AUTO-TRIGGER SYSTEM:\n');
        
        // Initial analysis
        await trigger.triggerParallelizationAnalysis(sampleTodos, 'initial_load');
        
        // Simulate todo completion
        console.log('\n' + '='.repeat(60));
        console.log('SIMULATING TODO COMPLETION...');
        const updatedTodos = sampleTodos.map(t => 
            t.id === '3' ? { ...t, status: 'completed' } : t
        );
        await trigger.triggerParallelizationAnalysis(updatedTodos, 'completion');
        
        // Show statistics
        console.log('\n' + '='.repeat(60));
        console.log('📊 ANALYSIS STATISTICS:');
        const stats = trigger.getAnalysisStats();
        console.log(`Total analyses: ${stats.totalAnalyses}`);
        console.log(`Average benefit: ${Math.round(stats.avgBenefit * 100)}%`);
        console.log(`Successful parallelizations: ${stats.successfulParallelizations}`);
        console.log(`Last analysis: ${stats.lastAnalysis ? stats.lastAnalysis.toLocaleString() : 'None'}`);
    }
    
    simulateTodoUpdates().catch(console.error);
}