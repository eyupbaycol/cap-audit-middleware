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
    this.table = options.table || 'AuditLogs';
    this.autoCreateTable = options.autoCreateTable !== false;
    
    // Tabloyu otomatik oluştur
    if (this.autoCreateTable) {
      this._ensureTableExists();
    }
  }

  /**
   * Ensure the audit logs table exists
   * @private
   */
  async _ensureTableExists() {
    try {
      // Tablo var mı kontrol et
      const tableExists = await this._checkTableExists();
      
      if (!tableExists) {
        console.log(`Audit logs table '${this.table}' does not exist. Creating...`);
        await this._createTable();
        console.log(`Audit logs table '${this.table}' created successfully.`);
      }
    } catch (error) {
      console.error(`Failed to ensure audit logs table exists: ${error.message}`);
    }
  }

  /**
   * Check if the audit logs table exists
   * @private
   * @returns {Promise<boolean>}
   */
  async _checkTableExists() {
    try {
      // SQLite için
      const result = await this.db.run(`SELECT name FROM sqlite_master WHERE type='table' AND name='${this.table}'`);
      return result && result.length > 0;
    } catch (error) {
      // Diğer veritabanları için farklı sorgular gerekebilir
      // Bu durumda varsayılan olarak false döndür
      return false;
    }
  }

  /**
   * Create the audit logs table
   * @private
   */
  async _createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.table} (
        ID VARCHAR(36) PRIMARY KEY,
        timestamp TIMESTAMP,
        user VARCHAR(255),
        operation VARCHAR(50),
        entity VARCHAR(255),
        data TEXT,
        originalData TEXT,
        changes TEXT,
        result TEXT,
        success BOOLEAN
      )
    `;
    
    await this.db.run(createTableSQL);
  }

  /**
   * Save audit log to database
   * @param {Object} logEntry - Audit log entry
   * @returns {Promise<void>}
   */
  async saveLog(logEntry) {
    try {
      // UUID oluştur (eğer yoksa)
      if (!logEntry.ID) {
        logEntry.ID = this._generateUUID();
      }
      
      // Convert to format suitable for database
      const dbEntry = {
        ID: logEntry.ID,
        operation: logEntry.operation,
        entity: logEntry.entity,
        timestamp: logEntry.timestamp,
        user: logEntry.user,
        data: JSON.stringify(logEntry.data || null),
        originalData: JSON.stringify(logEntry.originalData || null),
        changes: JSON.stringify(logEntry.changes || null),
        result: JSON.stringify(logEntry.result || null),
        success: logEntry.success
      };

      await this.db.create(this.table).entries(dbEntry);
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