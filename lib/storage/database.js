/**
 * Database storage implementation for audit logs
 */
class DatabaseStorage {
  /**
   * @param {Object} options - Database storage options
   * @param {Object} options.db - Database connection or service
   * @param {string} [options.table='AuditLogs'] - Table name for audit logs
   * @param {boolean} [options.autoCreateTable=true] - Automatically create table if it doesn't exist
   */
  constructor(options) {
    if (!options || !options.db) {
      throw new Error('Database connection is required');
    }

    this.db = options.db;
    this.table = options.table || 'ServiceLogs';
    this.autoCreateTable = options.autoCreateTable !== false;
  }


  /**
   * Save audit log to database
   * @param {Object} logEntry - Audit log entry
   * @returns {Promise<void>}
   */
  async saveLog(logEntry) {
    try {
      if (!logEntry.ID) {
        logEntry.ID = this._generateUUID();
      }
      
      const dbEntry = {
        operation: logEntry.operation,
        entity: logEntry.entity,
        user: logEntry.user,
        data: JSON.stringify(logEntry.data|| null),
        originalData: JSON.stringify(logEntry.originalData || null),
        changes: JSON.stringify(logEntry.changes || null),
        result: JSON.stringify(logEntry.result || null),
        success: logEntry.success ? 1 : 0
      };

       await this.db.run(INSERT.into(this.table).entries(dbEntry))
     
    } catch (error) {
      console.error('Failed to save audit log to database:', error);
      throw error;
    }
  }
  
  /**
   * Generate a UUID
   * @private
   * @returns {string}
   */
  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = DatabaseStorage; 