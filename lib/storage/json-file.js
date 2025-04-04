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
  }

  /**
   * Ensure the directory for the log file exists
   * @private
   * @returns {Promise<void>}
   */
  async _ensureDirectoryExists(filePath) {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory for audit logs:', error);
      throw error; 
    }
  }

  /**
   * Save audit log to JSON file
   * @param {Object} logEntry - Audit log entry
   * @returns {Promise<void>}
   */
  async saveLog(logEntry) {
    try {
      let logFilePath;
      if (this.appendMode) {
        logFilePath = path.resolve(this.filePath, "audit-logs.json");
      } else {
        const fileName = this._getFormattedDate();
        logFilePath = path.resolve(this.filePath, fileName);
      }
      await this._ensureDirectoryExists(logFilePath);
      let logs = [];
      try {
        const data = await fs.readFile(logFilePath, 'utf8');
        logs = JSON.parse(data);
        if (!Array.isArray(logs)) {
          logs = [];
        }
      } catch (error) {
        logs = [];
      }

      logs.push(logEntry);
      
      const jsonData = this.prettyPrint 
        ? JSON.stringify(logs, null, 2) 
        : JSON.stringify(logs);

      await fs.writeFile(logFilePath, jsonData, 'utf8');
      return; // Return without errors
    } catch (error) {
      console.error('Failed to save audit log:', error);
      return;
    }
  }
  /**
   * Get formatted date string in day-month-year format
   * @private
   * @returns {string} Formatted date (DD.MM.YYYY-basename.json)
   */
  _getFormattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}-audit-logs.json`;
  }
}

module.exports = JsonFileStorage; 