class AuditMiddleware {
  /**
   * @param {Object} options - Middleware options
   * @param {Object} options.storage - Storage implementation
   * @param {Array<string>} [options.entities=[]] - Entity names to audit (empty means all)
   * @param {Array<string>} [options.operations=['CREATE', 'UPDATE', 'DELETE']] - Operations to audit
   * @param {Function} [options.userResolver] - Function to resolve current user
   * @param {boolean} [options.logPayload=true] - Whether to log request/response payload
   * @param {Function} [options.beforeLog] - Hook called before logging
   */
  constructor(options) {
    if (!options || !options.storage) {
      throw new Error('Storage implementation is required');
    }

    this.storage = options.storage;
    this.entities = options.entities || [];
    this.operations = options.operations || ['CREATE', 'UPDATE', 'DELETE'];
    this.userResolver = options.userResolver || this._defaultUserResolver;
    this.logPayload = options.logPayload !== false;
    this.beforeLog = options.beforeLog || null;
  }

  /**
   * Initialize the middleware with CAP
   * @param {Object} srv - CAP service
   */
  initialize(srv) {
    if (!srv) {
      throw new Error('CAP service is required');
    }

    // Register before handlers for all operations
    this.operations.forEach(operation => {
      if (operation === 'CREATE') {
        this._registerBeforeCreate(srv);
      } else if (operation === 'UPDATE') {
        this._registerBeforeUpdate(srv);
      } else if (operation === 'DELETE') {
        this._registerBeforeDelete(srv);
      }
    });

    // Register after handlers for all operations
    this.operations.forEach(operation => {
      if (operation === 'CREATE') {
        this._registerAfterCreate(srv);
      } else if (operation === 'UPDATE') {
        this._registerAfterUpdate(srv);
      } else if (operation === 'DELETE') {
        this._registerAfterDelete(srv);
      }
    });

    return srv;
  }

  /**
   * Default user resolver function
   * @param {Object} req - CAP request
   * @returns {string} - User ID
   */
  _defaultUserResolver(req) {
    return req.user?.id || 'anonymous';
  }

  /**
   * Check if entity should be audited
   * @param {string} entity - Entity name
   * @returns {boolean} - Whether to audit this entity
   */
  _shouldAuditEntity(entity) {
    // If no entities specified, audit all
    if (!this.entities.length) {
      return true;
    }
    return this.entities.includes(entity);
  }

  /**
   * Register before CREATE handler
   * @param {Object} srv - CAP service
   */
  _registerBeforeCreate(srv) {
    srv.before('CREATE', '*', async (req) => {
      if(!req.target) {
        return;
      }
      const entity = req.target.name;
      console.log(entity)
      if (!this._shouldAuditEntity(entity)) {
        return;
      }

      // Store original data in request context for after handler
      req.auditContext = {
        operation: 'CREATE',
        entity,
        user: this.userResolver(req),
        data: this.logPayload ? req.data : undefined
      };
    });
  }

  /**
   * Register after CREATE handler
   * @param {Object} srv - CAP service
   */
  _registerAfterCreate(srv) {
    srv.after('CREATE', '*', async (data, req) => {
      
      if (!req.auditContext) {
        return;
      }

      const auditLog = {
        ...req.auditContext,
        success: true,
        result: this.logPayload ? data : undefined
      };

      if (this.beforeLog) {
        await this.beforeLog(auditLog, req);
      }

      await this.storage.saveLog(auditLog);
    });
  }

  /**
   * Register before UPDATE handler
   * @param {Object} srv - CAP service
   */
  _registerBeforeUpdate(srv) {
    srv.before('UPDATE', '*', async (req) => {
      const entity = req.target.name;
      
      if (!this._shouldAuditEntity(entity)) {
        return;
      }

      // Get original data before update
      let originalData;
      if (this.logPayload) {
        try {
          originalData =  await srv.run( SELECT.from(entity,req.query.UPDATE.entity.ref[0].where[2].val) )
        } catch (error) {
          // Ignore errors when reading original data
        }
      }

      req.auditContext = {
        operation: 'UPDATE',
        entity,
        user: this.userResolver(req),
        originalData,
        changes: this.logPayload ? req.data : undefined
      };
    });
  }

  /**
   * Register after UPDATE handler
   * @param {Object} srv - CAP service
   */
  _registerAfterUpdate(srv) {
    srv.after('UPDATE', '*', async (data, req) => {
      if (!req.auditContext) {
        return;
      }

      const auditLog = {
        ...req.auditContext,
        success: true,
        result: this.logPayload ? data : undefined
      };

      if (this.beforeLog) {
        await this.beforeLog(auditLog, req);
      }

      await this.storage.saveLog(auditLog);
    });
  }

  /**
   * Register before DELETE handler
   * @param {Object} srv - CAP service
   */
  _registerBeforeDelete(srv) {
    srv.before('DELETE', '*', async (req) => {
      const entity = req.target.name;
      
      if (!this._shouldAuditEntity(entity)) {
        return;
      }

      // Get original data before delete
      let originalData;
      if (this.logPayload) {
        try {
           originalData = await srv.run( SELECT.from(entity,req.query.DELETE.from.ref[0].where[2].val) )
        } catch (error) {
          // Ignore errors when reading original data
        }
      }

      req.auditContext = {
        operation: 'DELETE',
        entity,
        user: this.userResolver(req),
        originalData
      };
    });
  }

  /**
   * Register after DELETE handler
   * @param {Object} srv - CAP service
   */
  _registerAfterDelete(srv) {
    srv.after('DELETE', '*', async (data, req) => {
      if (!req.auditContext) {
        return;
      }

      const auditLog = {
        ...req.auditContext,
        success: true
      };

      if (this.beforeLog) {
        await this.beforeLog(auditLog, req);
      }

      await this.storage.saveLog(auditLog);
    });
  }
}

module.exports = AuditMiddleware; 