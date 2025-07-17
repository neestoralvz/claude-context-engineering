/**
 * TDD Test Suite for JSONLProcessor Backend Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - File discovery and parsing functionality
 * - JSONL processing logic and error handling
 * - Cache management and performance optimization
 * - Directory scanning and file validation
 * - Conversation data extraction and formatting
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const JSONLProcessor = require('../../../server/src/analysis/JSONLProcessor');

// Mock filesystem operations
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn()
  }
}));

jest.mock('readline', () => ({
  createInterface: jest.fn()
}));

describe('JSONLProcessor Backend Component', () => {
  let processor;
  let mockFs;
  let mockReadline;

  beforeEach(() => {
    processor = new JSONLProcessor();
    mockFs = require('fs').promises;
    mockReadline = require('readline');
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockFs.access.mockResolvedValue(true);
    mockFs.readdir.mockResolvedValue([]);
    mockFs.stat.mockResolvedValue({ isDirectory: () => false, isFile: () => true });
  });

  describe('Initialization and Configuration', () => {
    test('should initialize with correct default configuration', () => {
      expect(processor.claudeProjectsPath).toBe(path.join(os.homedir(), '.claude', 'projects'));
      expect(processor.supportedExtensions).toEqual(['.jsonl']);
      expect(processor.cache).toBeInstanceOf(Map);
      expect(processor.processingQueue).toEqual([]);
      expect(processor.maxCacheSize).toBe(100);
    });

    test('should initialize with empty cache and processing queue', () => {
      expect(processor.cache.size).toBe(0);
      expect(processor.processingQueue.length).toBe(0);
    });
  });

  describe('File Discovery Functionality', () => {
    test('should discover conversation files in Claude projects directory', async () => {
      // Mock directory structure with JSONL files
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'project1.jsonl', isDirectory: () => false, isFile: () => true },
          { name: 'project2.jsonl', isDirectory: () => false, isFile: () => true },
          { name: 'subdir', isDirectory: () => true, isFile: () => false }
        ])
        .mockResolvedValueOnce([
          { name: 'nested.jsonl', isDirectory: () => false, isFile: () => true }
        ]);

      const files = await processor.discoverConversationFiles();
      
      expect(mockFs.access).toHaveBeenCalledWith(processor.claudeProjectsPath);
      expect(mockFs.readdir).toHaveBeenCalledWith(processor.claudeProjectsPath, { withFileTypes: true });
      expect(files.length).toBeGreaterThan(0);
    });

    test('should handle missing Claude projects directory gracefully', async () => {
      mockFs.access.mockRejectedValue(new Error('Directory not found'));
      
      const files = await processor.discoverConversationFiles();
      
      expect(files).toEqual([]);
      expect(mockFs.access).toHaveBeenCalledWith(processor.claudeProjectsPath);
    });

    test('should filter files by supported extensions', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'conversation.jsonl', isDirectory: () => false, isFile: () => true },
        { name: 'config.json', isDirectory: () => false, isFile: () => true },
        { name: 'data.txt', isDirectory: () => false, isFile: () => true },
        { name: 'another.jsonl', isDirectory: () => false, isFile: () => true }
      ]);

      const files = await processor.discoverConversationFiles();
      
      // Should only include .jsonl files
      const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
      expect(jsonlFiles.length).toBe(files.length);
    });

    test('should recursively scan subdirectories', async () => {
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'main.jsonl', isDirectory: () => false, isFile: () => true },
          { name: 'subdir1', isDirectory: () => true, isFile: () => false }
        ])
        .mockResolvedValueOnce([
          { name: 'nested.jsonl', isDirectory: () => false, isFile: () => true },
          { name: 'subdir2', isDirectory: () => true, isFile: () => false }
        ])
        .mockResolvedValueOnce([
          { name: 'deep.jsonl', isDirectory: () => false, isFile: () => true }
        ]);

      const files = await processor.discoverConversationFiles();
      
      expect(mockFs.readdir).toHaveBeenCalledTimes(3); // Main dir + 2 subdirs
      expect(files.length).toBe(3); // All .jsonl files found
    });

    test('should handle file system errors during discovery', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const files = await processor.discoverConversationFiles();
      
      expect(files).toEqual([]);
      // Should not throw error, should handle gracefully
    });
  });

  describe('JSONL Parsing and Processing', () => {
    test('should parse valid JSONL conversation file', async () => {
      const mockJSONLContent = [
        '{"id": "msg1", "type": "user", "content": "Hello", "timestamp": "2024-01-01T10:00:00Z"}',
        '{"id": "msg2", "type": "assistant", "content": "Hi there!", "timestamp": "2024-01-01T10:00:01Z"}',
        '{"id": "msg3", "type": "user", "content": "How are you?", "timestamp": "2024-01-01T10:00:02Z"}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(mockJSONLContent);

      const conversation = await processor.parseConversationFile('/test/conversation.jsonl');
      
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/conversation.jsonl', 'utf8');
      expect(conversation.messages).toHaveLength(3);
      expect(conversation.messages[0].type).toBe('user');
      expect(conversation.messages[1].type).toBe('assistant');
      expect(conversation.messageCount).toBe(3);
    });

    test('should handle malformed JSON lines gracefully', async () => {
      const mockJSONLContent = [
        '{"id": "msg1", "type": "user", "content": "Hello"}',
        'invalid json line',
        '{"id": "msg2", "type": "assistant", "content": "Hi"}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(mockJSONLContent);

      const conversation = await processor.parseConversationFile('/test/malformed.jsonl');
      
      // Should skip invalid lines and process valid ones
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.parseErrors).toBe(1);
    });

    test('should extract conversation metadata correctly', async () => {
      const mockJSONLContent = [
        '{"id": "msg1", "type": "user", "content": "Test message", "timestamp": "2024-01-01T10:00:00Z", "model": "claude-3"}',
        '{"id": "msg2", "type": "assistant", "content": "Response", "timestamp": "2024-01-01T10:00:01Z", "usage": {"input_tokens": 10, "output_tokens": 5}}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(mockJSONLContent);

      const conversation = await processor.parseConversationFile('/test/metadata.jsonl');
      
      expect(conversation.metadata.startTime).toBe('2024-01-01T10:00:00Z');
      expect(conversation.metadata.endTime).toBe('2024-01-01T10:00:01Z');
      expect(conversation.metadata.totalTokens).toBeGreaterThan(0);
      expect(conversation.metadata.messageCount).toBe(2);
    });

    test('should handle empty JSONL files', async () => {
      mockFs.readFile.mockResolvedValue('');

      const conversation = await processor.parseConversationFile('/test/empty.jsonl');
      
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.messageCount).toBe(0);
      expect(conversation.metadata.totalTokens).toBe(0);
    });

    test('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(processor.parseConversationFile('/test/nonexistent.jsonl'))
        .rejects.toThrow('File not found');
    });

    test('should process large JSONL files efficiently', async () => {
      // Create mock large file content
      const largeContent = Array.from({ length: 1000 }, (_, i) => 
        JSON.stringify({
          id: `msg${i}`,
          type: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date(Date.now() + i * 1000).toISOString()
        })
      ).join('\n');

      mockFs.readFile.mockResolvedValue(largeContent);

      const conversation = await processor.parseConversationFile('/test/large.jsonl');
      
      expect(conversation.messages).toHaveLength(1000);
      expect(conversation.messageCount).toBe(1000);
      // Should process efficiently without timeout
    });
  });

  describe('Cache Management', () => {
    test('should cache parsed conversation data', async () => {
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      mockFs.readFile.mockResolvedValue(mockContent);

      const filePath = '/test/conversation.jsonl';
      
      // First call should read from file
      const conversation1 = await processor.parseConversationFile(filePath);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const conversation2 = await processor.parseConversationFile(filePath);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // No additional file read
      
      expect(conversation1).toEqual(conversation2);
      expect(processor.cache.has(filePath)).toBe(true);
    });

    test('should respect maximum cache size limit', async () => {
      processor.maxCacheSize = 2; // Set small cache size for testing
      
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      mockFs.readFile.mockResolvedValue(mockContent);

      // Add items beyond cache limit
      await processor.parseConversationFile('/test/file1.jsonl');
      await processor.parseConversationFile('/test/file2.jsonl');
      await processor.parseConversationFile('/test/file3.jsonl');
      
      // Cache should not exceed max size
      expect(processor.cache.size).toBeLessThanOrEqual(processor.maxCacheSize);
    });

    test('should provide cache statistics', () => {
      // Add some items to cache
      processor.cache.set('file1', { messages: [] });
      processor.cache.set('file2', { messages: [] });
      
      const stats = processor.getCacheStats();
      
      expect(stats.cacheSize).toBe(2);
      expect(stats.maxCacheSize).toBe(processor.maxCacheSize);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    test('should clear cache when requested', () => {
      // Add items to cache
      processor.cache.set('file1', { messages: [] });
      processor.cache.set('file2', { messages: [] });
      
      expect(processor.cache.size).toBe(2);
      
      processor.clearCache();
      
      expect(processor.cache.size).toBe(0);
    });
  });

  describe('Batch Processing and Queue Management', () => {
    test('should process multiple files in batch', async () => {
      const files = ['/test/file1.jsonl', '/test/file2.jsonl', '/test/file3.jsonl'];
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      mockFs.readFile.mockResolvedValue(mockContent);

      const results = await processor.processBatch(files);
      
      expect(results).toHaveLength(3);
      expect(mockFs.readFile).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result.messages).toHaveLength(1);
      });
    });

    test('should handle mixed success/failure in batch processing', async () => {
      const files = ['/test/valid.jsonl', '/test/invalid.jsonl'];
      
      mockFs.readFile
        .mockResolvedValueOnce('{"id": "msg1", "type": "user", "content": "Valid"}')
        .mockRejectedValueOnce(new Error('File not found'));

      const results = await processor.processBatch(files);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('File not found');
    });

    test('should manage processing queue for concurrent operations', async () => {
      const files = Array.from({ length: 5 }, (_, i) => `/test/file${i}.jsonl`);
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      mockFs.readFile.mockResolvedValue(mockContent);

      // Start multiple concurrent processing operations
      const promises = files.map(file => processor.parseConversationFile(file));
      
      // Should manage queue properly
      expect(processor.processingQueue.length).toBeGreaterThan(0);
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      // Queue should be empty after completion
      expect(processor.processingQueue.length).toBe(0);
    });

    test('should limit concurrent processing operations', async () => {
      processor.maxConcurrent = 2; // Set low limit for testing
      
      const files = Array.from({ length: 10 }, (_, i) => `/test/file${i}.jsonl`);
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      
      // Mock slow file reading to test concurrency
      mockFs.readFile.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContent), 10))
      );

      const startTime = Date.now();
      const results = await processor.processBatch(files);
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      // Should take longer due to concurrency limits
      expect(endTime - startTime).toBeGreaterThan(50); // With 2 concurrent, 10 files should take ~50ms
    });
  });

  describe('Data Validation and Error Handling', () => {
    test('should validate message structure in JSONL', async () => {
      const mockContent = [
        '{"id": "msg1", "type": "user", "content": "Valid message"}',
        '{"id": "msg2", "type": "invalid_type", "content": "Invalid type"}',
        '{"type": "user", "content": "Missing ID"}',
        '{"id": "msg3", "content": "Missing type"}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(mockContent);

      const conversation = await processor.parseConversationFile('/test/validation.jsonl');
      
      // Should include validation results
      expect(conversation.validationErrors).toBeGreaterThan(0);
      expect(conversation.validMessages).toBe(1); // Only first message is valid
    });

    test('should handle different message formats', async () => {
      const mockContent = [
        '{"id": "msg1", "type": "user", "content": "Simple message"}',
        '{"id": "msg2", "type": "assistant", "content": "Response", "usage": {"input_tokens": 10}}',
        '{"id": "msg3", "type": "system", "content": "System message", "metadata": {"priority": "high"}}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(mockContent);

      const conversation = await processor.parseConversationFile('/test/formats.jsonl');
      
      expect(conversation.messages).toHaveLength(3);
      expect(conversation.messages[1].usage).toBeDefined();
      expect(conversation.messages[2].metadata).toBeDefined();
    });

    test('should provide detailed error information', async () => {
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      try {
        await processor.parseConversationFile('/test/protected.jsonl');
      } catch (error) {
        expect(error.message).toBe('Permission denied');
        expect(error.filePath).toBe('/test/protected.jsonl');
      }
    });

    test('should handle encoding issues gracefully', async () => {
      // Mock content with encoding issues
      const invalidContent = Buffer.from([0xFF, 0xFE, 0x00, 0x00]); // Invalid UTF-8
      mockFs.readFile.mockResolvedValue(invalidContent);

      const conversation = await processor.parseConversationFile('/test/encoding.jsonl');
      
      // Should handle encoding errors gracefully
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.parseErrors).toBeGreaterThan(0);
    });
  });

  describe('Performance and Memory Management', () => {
    test('should handle memory efficiently for large files', async () => {
      // Mock very large content
      const largeContent = Array.from({ length: 10000 }, (_, i) => 
        JSON.stringify({ id: `msg${i}`, type: 'user', content: `Message ${i}` })
      ).join('\n');

      mockFs.readFile.mockResolvedValue(largeContent);

      const initialMemory = process.memoryUsage().heapUsed;
      const conversation = await processor.parseConversationFile('/test/huge.jsonl');
      const finalMemory = process.memoryUsage().heapUsed;
      
      expect(conversation.messages).toHaveLength(10000);
      // Memory usage should be reasonable
      expect(finalMemory - initialMemory).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    test('should provide processing performance metrics', async () => {
      const mockContent = Array.from({ length: 100 }, (_, i) => 
        JSON.stringify({ id: `msg${i}`, type: 'user', content: `Message ${i}` })
      ).join('\n');

      mockFs.readFile.mockResolvedValue(mockContent);

      const startTime = Date.now();
      const conversation = await processor.parseConversationFile('/test/perf.jsonl');
      const endTime = Date.now();
      
      expect(conversation.processingTime).toBeDefined();
      expect(conversation.processingTime).toBeGreaterThan(0);
      expect(conversation.processingTime).toBeLessThan(endTime - startTime + 10); // Allow some margin
    });

    test('should cleanup resources properly after processing', async () => {
      const mockContent = '{"id": "msg1", "type": "user", "content": "Test"}';
      mockFs.readFile.mockResolvedValue(mockContent);

      await processor.parseConversationFile('/test/cleanup.jsonl');
      
      // Processing queue should be clean
      expect(processor.processingQueue.length).toBe(0);
      
      // Should not have memory leaks (basic check)
      const memoryBefore = process.memoryUsage().heapUsed;
      global.gc && global.gc(); // Force garbage collection if available
      const memoryAfter = process.memoryUsage().heapUsed;
      
      // Memory should not have grown significantly
      expect(memoryAfter).toBeLessThan(memoryBefore + 10 * 1024 * 1024);
    });
  });

  describe('Integration and System Tests', () => {
    test('should integrate with filesystem watching capabilities', async () => {
      // Mock file system watcher
      const mockWatcher = {
        on: jest.fn(),
        close: jest.fn()
      };
      
      // Test file watching integration
      processor.watchDirectory('/test/watch', mockWatcher);
      
      expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockWatcher.on).toHaveBeenCalledWith('add', expect.any(Function));
    });

    test('should provide comprehensive system status', () => {
      const status = processor.getSystemStatus();
      
      expect(status.cacheSize).toBeDefined();
      expect(status.processingQueueLength).toBeDefined();
      expect(status.totalFilesProcessed).toBeDefined();
      expect(status.totalProcessingTime).toBeDefined();
      expect(status.errorRate).toBeDefined();
    });

    test('should support configuration updates at runtime', () => {
      const newConfig = {
        maxCacheSize: 200,
        maxConcurrent: 5,
        enableWatching: true
      };
      
      processor.updateConfiguration(newConfig);
      
      expect(processor.maxCacheSize).toBe(200);
      expect(processor.maxConcurrent).toBe(5);
      expect(processor.enableWatching).toBe(true);
    });
  });
});