const JSONLProcessor = require('./JSONLProcessor');

/**
 * Conversation Analyzer for Claude Code Usage Patterns
 * Analyzes conversation data to extract insights and usage patterns
 */
class ConversationAnalyzer {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.processor = new JSONLProcessor();
    this.analysisCache = new Map();
  }

  /**
   * Analyze all conversation files and extract usage patterns
   */
  async analyzeAllConversations(options = {}) {
    try {
      console.log('Starting conversation analysis...');
      const startTime = Date.now();

      // Discover conversation files
      const files = await this.processor.discoverConversationFiles();
      if (files.length === 0) {
        console.log('No conversation files found');
        return { conversations: [], patterns: {}, insights: {} };
      }

      // Process files with progress tracking
      const { results, errors } = await this.processor.processMultipleFiles(
        files.map(f => f.path),
        {
          concurrency: options.concurrency || 3,
          onProgress: (result, current, total) => {
            console.log(`Processing: ${current}/${total} - ${result.fileName}`);
          }
        }
      );

      // Analyze patterns across all conversations
      const patterns = this.analyzeUsagePatterns(results);
      const insights = this.generateInsights(results, patterns);

      // Store results in database
      await this.storeAnalysisResults(results);

      const processingTime = Date.now() - startTime;
      console.log(`Analysis complete: ${results.length} conversations processed in ${processingTime}ms`);

      return {
        conversations: results,
        patterns,
        insights,
        errors,
        processingTime,
        totalFiles: files.length,
        processedFiles: results.length
      };

    } catch (error) {
      console.error('Error in conversation analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze usage patterns across conversations
   */
  analyzeUsagePatterns(conversations) {
    const patterns = {
      commandFrequency: {},
      topicFrequency: {},
      modelUsage: {},
      conversationLength: {
        short: 0,   // < 10 messages
        medium: 0,  // 10-50 messages
        long: 0,    // 50+ messages
        average: 0
      },
      timePatterns: {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        monthly: new Array(12).fill(0)
      },
      responsePatterns: {
        averageResponseTime: 0,
        quickResponses: 0,  // < 1 second
        mediumResponses: 0, // 1-5 seconds
        slowResponses: 0    // > 5 seconds
      },
      userBehavior: {
        averageSessionDuration: 0,
        averageMessagesPerSession: 0,
        commonQuestionTypes: {},
        errorPatterns: {}
      }
    };

    let totalMessages = 0;
    let totalDuration = 0;

    conversations.forEach(conversation => {
      // Command frequency analysis
      conversation.commands.forEach(command => {
        patterns.commandFrequency[command] = (patterns.commandFrequency[command] || 0) + 1;
      });

      // Topic frequency analysis
      conversation.topics.forEach(topic => {
        patterns.topicFrequency[topic] = (patterns.topicFrequency[topic] || 0) + 1;
      });

      // Model usage analysis
      conversation.models.forEach(model => {
        patterns.modelUsage[model] = (patterns.modelUsage[model] || 0) + 1;
      });

      // Conversation length categorization
      const messageCount = conversation.messageCount;
      if (messageCount < 10) {
        patterns.conversationLength.short++;
      } else if (messageCount < 50) {
        patterns.conversationLength.medium++;
      } else {
        patterns.conversationLength.long++;
      }

      totalMessages += messageCount;
      totalDuration += conversation.conversationDuration;

      // Time pattern analysis
      if (conversation.conversationStart) {
        const start = new Date(conversation.conversationStart);
        patterns.timePatterns.hourly[start.getHours()]++;
        patterns.timePatterns.daily[start.getDay()]++;
        patterns.timePatterns.monthly[start.getMonth()]++;
      }

      // Analyze message patterns
      this.analyzeMessagePatterns(conversation.messages, patterns);
    });

    // Calculate averages
    patterns.conversationLength.average = conversations.length > 0 ? 
      totalMessages / conversations.length : 0;
    patterns.userBehavior.averageSessionDuration = conversations.length > 0 ? 
      totalDuration / conversations.length : 0;
    patterns.userBehavior.averageMessagesPerSession = patterns.conversationLength.average;

    // Sort frequency data
    patterns.commandFrequency = this.sortByFrequency(patterns.commandFrequency);
    patterns.topicFrequency = this.sortByFrequency(patterns.topicFrequency);
    patterns.modelUsage = this.sortByFrequency(patterns.modelUsage);

    return patterns;
  }

  /**
   * Analyze message patterns within conversations
   */
  analyzeMessagePatterns(messages, patterns) {
    let responseTimes = [];
    let lastUserMessage = null;

    messages.forEach(message => {
      if (message.role === 'user') {
        lastUserMessage = new Date(message.timestamp);
        
        // Analyze question types
        const questionType = this.categorizeQuestion(message.content);
        patterns.userBehavior.commonQuestionTypes[questionType] = 
          (patterns.userBehavior.commonQuestionTypes[questionType] || 0) + 1;
        
        // Analyze error patterns
        if (this.containsError(message.content)) {
          const errorType = this.categorizeError(message.content);
          patterns.userBehavior.errorPatterns[errorType] = 
            (patterns.userBehavior.errorPatterns[errorType] || 0) + 1;
        }
      } else if (message.role === 'assistant' && lastUserMessage) {
        // Calculate response time
        const responseTime = new Date(message.timestamp) - lastUserMessage;
        responseTimes.push(responseTime);

        if (responseTime < 1000) {
          patterns.responsePatterns.quickResponses++;
        } else if (responseTime < 5000) {
          patterns.responsePatterns.mediumResponses++;
        } else {
          patterns.responsePatterns.slowResponses++;
        }
      }
    });

    // Calculate average response time
    if (responseTimes.length > 0) {
      patterns.responsePatterns.averageResponseTime = 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }
  }

  /**
   * Categorize user questions
   */
  categorizeQuestion(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('how to') || lowerContent.includes('how do')) {
      return 'how_to';
    } else if (lowerContent.includes('what is') || lowerContent.includes('what does')) {
      return 'definition';
    } else if (lowerContent.includes('why') || lowerContent.includes('explain')) {
      return 'explanation';
    } else if (lowerContent.includes('fix') || lowerContent.includes('error') || lowerContent.includes('bug')) {
      return 'troubleshooting';
    } else if (lowerContent.includes('implement') || lowerContent.includes('create') || lowerContent.includes('build')) {
      return 'implementation';
    } else if (lowerContent.includes('review') || lowerContent.includes('optimize') || lowerContent.includes('improve')) {
      return 'optimization';
    } else {
      return 'general';
    }
  }

  /**
   * Check if message contains error information
   */
  containsError(content) {
    const errorKeywords = [
      'error', 'exception', 'fail', 'crash', 'bug', 'issue', 'problem',
      'cannot', 'unable', 'not working', 'broken', 'undefined', 'null'
    ];
    
    const lowerContent = content.toLowerCase();
    return errorKeywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Categorize error types
   */
  categorizeError(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('syntax') || lowerContent.includes('parse')) {
      return 'syntax_error';
    } else if (lowerContent.includes('type') || lowerContent.includes('undefined') || lowerContent.includes('null')) {
      return 'type_error';
    } else if (lowerContent.includes('import') || lowerContent.includes('module') || lowerContent.includes('package')) {
      return 'import_error';
    } else if (lowerContent.includes('permission') || lowerContent.includes('access')) {
      return 'permission_error';
    } else if (lowerContent.includes('network') || lowerContent.includes('connection')) {
      return 'network_error';
    } else {
      return 'general_error';
    }
  }

  /**
   * Generate insights from analysis
   */
  generateInsights(conversations, patterns) {
    const insights = {
      summary: {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
        totalTokens: conversations.reduce((sum, c) => sum + c.totalTokens, 0),
        averageConversationLength: patterns.conversationLength.average,
        mostActiveHour: this.findPeakHour(patterns.timePatterns.hourly),
        mostActiveDay: this.findPeakDay(patterns.timePatterns.daily)
      },
      productivity: {
        efficiency: this.calculateEfficiency(patterns),
        commonWorkflows: this.identifyWorkflows(patterns),
        timeOptimization: this.analyzeTimeUsage(patterns),
        botlenecks: this.identifyBottlenecks(patterns)
      },
      recommendations: {
        usageOptimization: this.generateUsageRecommendations(patterns),
        trainingTopics: this.identifyTrainingNeeds(patterns),
        automationOpportunities: this.identifyAutomationOpportunities(patterns)
      },
      trends: {
        conversationGrowth: this.analyzeGrowthTrends(conversations),
        topicEvolution: this.analyzeTopicTrends(patterns),
        modelPreferences: this.analyzeModelPreferences(patterns)
      }
    };

    return insights;
  }

  /**
   * Calculate efficiency metrics
   */
  calculateEfficiency(patterns) {
    const totalInteractions = patterns.responsePatterns.quickResponses + 
                             patterns.responsePatterns.mediumResponses + 
                             patterns.responsePatterns.slowResponses;
    
    if (totalInteractions === 0) return 0;
    
    // Weight quick responses higher
    const efficiencyScore = (
      patterns.responsePatterns.quickResponses * 1.0 +
      patterns.responsePatterns.mediumResponses * 0.7 +
      patterns.responsePatterns.slowResponses * 0.3
    ) / totalInteractions;
    
    return Math.round(efficiencyScore * 100);
  }

  /**
   * Identify common workflows
   */
  identifyWorkflows(patterns) {
    const workflows = [];
    
    // Analyze command sequences
    const topCommands = Object.entries(patterns.commandFrequency)
      .slice(0, 10)
      .map(([command, count]) => ({ command, count }));
    
    workflows.push({
      type: 'command_usage',
      description: 'Most frequently used commands',
      commands: topCommands
    });
    
    // Analyze topic combinations
    const topTopics = Object.entries(patterns.topicFrequency)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
    
    workflows.push({
      type: 'topic_focus',
      description: 'Most discussed topics',
      topics: topTopics
    });
    
    return workflows;
  }

  /**
   * Analyze time usage patterns
   */
  analyzeTimeUsage(patterns) {
    const peakHour = this.findPeakHour(patterns.timePatterns.hourly);
    const peakDay = this.findPeakDay(patterns.timePatterns.daily);
    
    return {
      peakHour,
      peakDay,
      averageSessionDuration: patterns.userBehavior.averageSessionDuration,
      recommendation: this.generateTimeRecommendation(peakHour, peakDay)
    };
  }

  /**
   * Identify bottlenecks in usage
   */
  identifyBottlenecks(patterns) {
    const bottlenecks = [];
    
    // Slow response patterns
    if (patterns.responsePatterns.slowResponses > patterns.responsePatterns.quickResponses) {
      bottlenecks.push({
        type: 'slow_responses',
        description: 'High number of slow responses detected',
        impact: 'medium',
        suggestion: 'Consider optimizing query complexity or model selection'
      });
    }
    
    // High error rates
    const totalErrors = Object.values(patterns.userBehavior.errorPatterns)
      .reduce((sum, count) => sum + count, 0);
    const totalQuestions = Object.values(patterns.userBehavior.commonQuestionTypes)
      .reduce((sum, count) => sum + count, 0);
    
    if (totalErrors > totalQuestions * 0.2) {
      bottlenecks.push({
        type: 'high_error_rate',
        description: 'High error rate detected in conversations',
        impact: 'high',
        suggestion: 'Focus on error prevention and clearer documentation'
      });
    }
    
    return bottlenecks;
  }

  /**
   * Generate usage recommendations
   */
  generateUsageRecommendations(patterns) {
    const recommendations = [];
    
    // Command usage recommendations
    const underutilizedCommands = this.identifyUnderutilizedCommands(patterns);
    if (underutilizedCommands.length > 0) {
      recommendations.push({
        type: 'command_optimization',
        title: 'Explore underutilized commands',
        description: `Consider exploring these commands: ${underutilizedCommands.join(', ')}`,
        impact: 'medium'
      });
    }
    
    // Time optimization recommendations
    const timeRec = this.generateTimeRecommendation(
      this.findPeakHour(patterns.timePatterns.hourly),
      this.findPeakDay(patterns.timePatterns.daily)
    );
    
    recommendations.push({
      type: 'time_optimization',
      title: 'Optimize usage timing',
      description: timeRec,
      impact: 'low'
    });
    
    return recommendations;
  }

  /**
   * Store analysis results in database
   */
  async storeAnalysisResults(results) {
    try {
      for (const result of results) {
        await this.dbManager.runQuery(`
          INSERT OR REPLACE INTO conversation_analysis (
            conversation_file_path, file_size_bytes, file_modified_time,
            total_messages, user_messages, assistant_messages,
            total_input_tokens, total_output_tokens, estimated_cost_usd,
            avg_response_time_ms, conversation_duration_ms,
            conversation_start_time, conversation_end_time,
            pattern_analysis, cost_breakdown, productivity_metrics,
            optimization_suggestions, last_analyzed, analysis_version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          result.filePath,
          result.fileSize,
          result.modified.toISOString(),
          result.messageCount,
          result.userMessages,
          result.assistantMessages,
          result.totalInputTokens,
          result.totalOutputTokens,
          0, // estimated_cost_usd - will be calculated by CostCalculator
          0, // avg_response_time_ms - will be calculated
          result.conversationDuration,
          result.conversationStart?.toISOString(),
          result.conversationEnd?.toISOString(),
          JSON.stringify({
            commands: result.commands,
            topics: result.topics,
            models: result.models
          }),
          JSON.stringify({}), // cost_breakdown - will be populated by CostCalculator
          JSON.stringify({
            averageMessageLength: result.averageMessageLength,
            processingTime: result.processingTime
          }),
          JSON.stringify([]), // optimization_suggestions - will be populated
          new Date().toISOString(),
          '1.0'
        ]);
      }
      
      console.log(`Stored analysis results for ${results.length} conversations`);
    } catch (error) {
      console.error('Error storing analysis results:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  sortByFrequency(obj) {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }

  findPeakHour(hourlyData) {
    const maxIndex = hourlyData.indexOf(Math.max(...hourlyData));
    return maxIndex;
  }

  findPeakDay(dailyData) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxIndex = dailyData.indexOf(Math.max(...dailyData));
    return days[maxIndex];
  }

  generateTimeRecommendation(peakHour, peakDay) {
    return `Peak usage is ${peakHour}:00 on ${peakDay}s. Consider scheduling complex tasks during off-peak hours for better performance.`;
  }

  identifyUnderutilizedCommands(patterns) {
    // This would be populated with known command list
    const allCommands = ['/help', '/analyze', '/optimize', '/test', '/deploy'];
    const usedCommands = Object.keys(patterns.commandFrequency);
    return allCommands.filter(cmd => !usedCommands.includes(cmd));
  }

  identifyTrainingNeeds(patterns) {
    const errorTypes = Object.entries(patterns.userBehavior.errorPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    
    return errorTypes;
  }

  identifyAutomationOpportunities(patterns) {
    const opportunities = [];
    
    // Repetitive command patterns
    const repetitiveCommands = Object.entries(patterns.commandFrequency)
      .filter(([, count]) => count > 10)
      .map(([command, count]) => ({ command, count }));
    
    if (repetitiveCommands.length > 0) {
      opportunities.push({
        type: 'command_automation',
        description: 'Repetitive command usage detected',
        commands: repetitiveCommands
      });
    }
    
    return opportunities;
  }

  analyzeGrowthTrends(conversations) {
    // Simple growth analysis based on conversation timestamps
    const monthlyData = {};
    
    conversations.forEach(conv => {
      if (conv.conversationStart) {
        const date = new Date(conv.conversationStart);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      }
    });
    
    return monthlyData;
  }

  analyzeTopicTrends(patterns) {
    return Object.entries(patterns.topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  analyzeModelPreferences(patterns) {
    return Object.entries(patterns.modelUsage)
      .sort(([,a], [,b]) => b - a);
  }
}

module.exports = ConversationAnalyzer;