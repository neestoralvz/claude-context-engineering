const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const os = require('os');

/**
 * JSONL Processor for Claude Code Conversation Analysis
 * Handles discovery, parsing, and processing of conversation files
 */
class JSONLProcessor {
  constructor() {
    this.claudeProjectsPath = path.join(os.homedir(), '.claude', 'projects');
    this.supportedExtensions = ['.jsonl'];
    this.cache = new Map();
    this.processingQueue = [];
    this.maxCacheSize = 100; // Maximum cached files
  }

  /**
   * Discover all JSONL conversation files in the Claude projects directory
   */
  async discoverConversationFiles() {
    try {
      const files = [];
      
      // Check if Claude projects directory exists
      try {
        await fs.access(this.claudeProjectsPath);
      } catch (error) {
        console.warn('Claude projects directory not found:', this.claudeProjectsPath);
        return [];
      }

      await this.scanDirectory(this.claudeProjectsPath, files);
      
      console.log(`Discovered ${files.length} conversation files`);
      return files;
    } catch (error) {
      console.error('Error discovering conversation files:', error);
      return [];
    }
  }

  /**
   * Recursively scan directory for JSONL files
   */
  async scanDirectory(dirPath, files) {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          // Skip hidden directories and common non-conversation directories
          if (!item.name.startsWith('.') && 
              !['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
            await this.scanDirectory(itemPath, files);
          }
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (this.supportedExtensions.includes(ext)) {
            const stats = await fs.stat(itemPath);
            files.push({
              path: itemPath,
              name: item.name,
              size: stats.size,
              modified: stats.mtime,
              directory: dirPath
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  /**
   * Check if a file has been modified since last processing
   */
  async isFileModified(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const cachedEntry = this.cache.get(filePath);
      
      if (!cachedEntry) {
        return true; // File not in cache
      }
      
      return stats.mtime.getTime() !== cachedEntry.modified.getTime();
    } catch (error) {
      console.error(`Error checking file modification for ${filePath}:`, error);
      return true; // Assume modified if error
    }
  }

  /**
   * Process a single JSONL conversation file
   */
  async processConversationFile(filePath) {
    try {
      // Check if file needs processing
      if (!await this.isFileModified(filePath)) {
        console.log(`Skipping ${filePath} - not modified`);
        return this.cache.get(filePath);
      }

      console.log(`Processing conversation file: ${filePath}`);
      const startTime = Date.now();
      
      const stats = await fs.stat(filePath);
      const messages = [];
      let lineCount = 0;
      let errorCount = 0;

      // Create readline interface for efficient line-by-line processing
      const fileStream = require('fs').createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      // Process each line
      for await (const line of rl) {
        lineCount++;
        
        if (line.trim() === '') continue;

        try {
          const message = JSON.parse(line);
          
          // Validate message structure
          if (this.isValidMessage(message)) {
            messages.push(this.processMessage(message));
          } else {
            console.warn(`Invalid message structure at line ${lineCount} in ${filePath}`);
            errorCount++;
          }
        } catch (parseError) {
          console.error(`JSON parse error at line ${lineCount} in ${filePath}:`, parseError.message);
          errorCount++;
        }
      }

      // Calculate processing metrics
      const processingTime = Date.now() - startTime;
      const result = {
        filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        modified: stats.mtime,
        messages,
        messageCount: messages.length,
        lineCount,
        errorCount,
        processingTime,
        processedAt: new Date(),
        ...this.analyzeMessages(messages)
      };

      // Update cache
      this.updateCache(filePath, result);
      
      console.log(`Processed ${filePath}: ${messages.length} messages in ${processingTime}ms`);
      return result;
      
    } catch (error) {
      console.error(`Error processing conversation file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Validate message structure
   */
  isValidMessage(message) {
    return (
      message &&
      typeof message === 'object' &&
      message.role &&
      ['user', 'assistant', 'system'].includes(message.role) &&
      message.content &&
      typeof message.content === 'string'
    );
  }

  /**
   * Process and normalize a message
   */
  processMessage(message) {
    const processed = {
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || message.created_at || new Date().toISOString(),
      tokenCount: this.estimateTokenCount(message.content),
      wordCount: this.countWords(message.content),
      characterCount: message.content.length
    };

    // Extract additional metadata if available
    if (message.model) processed.model = message.model;
    if (message.usage) processed.usage = message.usage;
    if (message.metadata) processed.metadata = message.metadata;

    return processed;
  }

  /**
   * Analyze messages for insights
   */
  analyzeMessages(messages) {
    const analysis = {
      userMessages: 0,
      assistantMessages: 0,
      systemMessages: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      averageMessageLength: 0,
      conversationDuration: 0,
      models: new Set(),
      commands: [],
      topics: []
    };

    if (messages.length === 0) return analysis;

    let totalLength = 0;
    let firstTimestamp = null;
    let lastTimestamp = null;

    messages.forEach(message => {
      // Count by role
      switch (message.role) {
        case 'user':
          analysis.userMessages++;
          analysis.totalInputTokens += message.tokenCount;
          break;
        case 'assistant':
          analysis.assistantMessages++;
          analysis.totalOutputTokens += message.tokenCount;
          break;
        case 'system':
          analysis.systemMessages++;
          break;
      }

      // Track models used
      if (message.model) {
        analysis.models.add(message.model);
      }

      // Accumulate statistics
      totalLength += message.content.length;
      analysis.totalTokens += message.tokenCount;

      // Track conversation duration
      const messageTime = new Date(message.timestamp);
      if (!firstTimestamp || messageTime < firstTimestamp) {
        firstTimestamp = messageTime;
      }
      if (!lastTimestamp || messageTime > lastTimestamp) {
        lastTimestamp = messageTime;
      }

      // Extract commands (basic pattern matching)
      const commands = this.extractCommands(message.content);
      analysis.commands.push(...commands);

      // Extract topics (basic keyword extraction)
      const topics = this.extractTopics(message.content);
      analysis.topics.push(...topics);
    });

    // Calculate derived metrics
    analysis.averageMessageLength = totalLength / messages.length;
    analysis.conversationDuration = lastTimestamp && firstTimestamp ? 
      lastTimestamp.getTime() - firstTimestamp.getTime() : 0;
    analysis.models = Array.from(analysis.models);
    analysis.conversationStart = firstTimestamp;
    analysis.conversationEnd = lastTimestamp;

    return analysis;
  }

  /**
   * Estimate token count for content
   */
  estimateTokenCount(content) {
    // Simple estimation: ~4 characters per token for English text
    return Math.ceil(content.length / 4);
  }

  /**
   * Count words in content
   */
  countWords(content) {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extract commands from message content
   */
  extractCommands(content) {
    const commands = [];
    const commandPatterns = [
      /\/(\w+)/g, // Slash commands
      /\b(git|npm|yarn|docker|kubectl|python|node|curl)\s+\w+/g, // Common CLI commands
      /\b(create|update|delete|get|list|show|help)\b/g // Common command verbs
    ];

    commandPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        commands.push(match[0]);
      }
    });

    return [...new Set(commands)]; // Remove duplicates
  }

  /**
   * Extract topics from message content
   */
  extractTopics(content) {
    const topics = [];
    const topicPatterns = [
      /\b(react|vue|angular|javascript|typescript|python|java|go|rust)\b/gi, // Programming languages
      /\b(database|api|authentication|deployment|testing|debugging)\b/gi, // Technical topics
      /\b(optimization|performance|security|scalability|monitoring)\b/gi // System topics
    ];

    topicPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        topics.push(match[0].toLowerCase());
      }
    });

    return [...new Set(topics)]; // Remove duplicates
  }

  /**
   * Process multiple files with concurrency control
   */
  async processMultipleFiles(filePaths, options = {}) {
    const { concurrency = 3, onProgress } = options;
    const results = [];
    const errors = [];

    // Process files in batches
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      const batchPromises = batch.map(async (filePath) => {
        try {
          const result = await this.processConversationFile(filePath);
          if (onProgress) onProgress(result, i + batch.indexOf(filePath) + 1, filePaths.length);
          return result;
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
          errors.push({ filePath, error: error.message });
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
    }

    return { results, errors };
  }

  /**
   * Update cache with processed file data
   */
  updateCache(filePath, result) {
    // Implement LRU cache eviction
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(filePath, result);
  }

  /**
   * Get cached result for a file
   */
  getCachedResult(filePath) {
    return this.cache.get(filePath);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      queueSize: this.processingQueue.length,
      claudeProjectsPath: this.claudeProjectsPath
    };
  }
}

module.exports = JSONLProcessor;