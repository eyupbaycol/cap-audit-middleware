const fs = require('fs').promises;
const path = require('path');

/**
 * JSON file storage implementation for audit logs
 */
class JsonFileStorage {
  /**
   * @param {Object} options - JSON file storage options
   * @param {string} options.filePath - Path to JSON file
   * @param {boolean} [options.prettyPrint=false] - Whether to pretty print JSON
   * @param {boolean} [options.appendMode=true] - Whether to append to file or overwrite
   */
  constructor(options) {
    if (!options || !options.filePath) {
      throw new Error('File path is required');
    }

    this.filePath = options.filePath;
    this.prettyPrint = options.prettyPrint || false;
    this.appendMode = options.appendMode !== false;
    
    // Ensure directory exists
    this._ensureDirectoryExists();
  }

  /**
   * Ensure the directory for the log file exists
   * @private
   */
  async _ensureDirectoryExists() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory for audit logs:', error);
    }
  }

  /**
   * Save audit log to JSON file
   * @param {Object} logEntry - Audit log entry
   * @returns {Promise<void>}
   */
  async saveLog(logEntry) {
    try {
      if (this.appendMode) {
        // Append mode: read existing logs, add new one, write back
        let logs = [];
        try {
          const data = await fs.readFile(this.filePath, 'utf8');
          logs = JSON.parse(data);
        } catch (error) {
          // File might not exist yet, start with empty array
          logs = [];
        }

        logs.push(logEntry);
        
        const jsonData = this.prettyPrint 
          ? JSON.stringify(logs, null, 2) 
          : JSON.stringify(logs);
          
        await fs.writeFile(this.filePath, jsonData, 'utf8');
      } else {
        // Single log entry mode
        const jsonData = this.prettyPrint 
          ? JSON.stringify(logEntry, null, 2) 
          : JSON.stringify(logEntry);
          
        await fs.writeFile(
          `${this.filePath}.${Date.now()}.json`, 
          jsonData, 
          'utf8'
        );
      }
    } catch (error) {
      console.error('Failed to save audit log to JSON file:', error);
      throw error;
    }
  }
}

module.exports = JsonFileStorage; 