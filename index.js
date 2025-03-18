const AuditMiddleware = require('./lib/audit-middleware');
const DatabaseStorage = require('./lib/storage/database');
const JsonFileStorage = require('./lib/storage/json-file');
const WebhookStorage = require('./lib/storage/webhook');
const { AuditLogService } = require('./lib/ui/audit-service');
const { setupAuditUI, setupAuditService } = require('./lib/ui/setup');

module.exports = {
  AuditMiddleware,
  storage: {
    DatabaseStorage,
    JsonFileStorage,
    WebhookStorage
  },
  ui: {
    AuditLogService,
    setupAuditUI,
    setupAuditService
  }
}; 