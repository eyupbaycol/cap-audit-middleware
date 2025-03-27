const AuditMiddleware = require('./lib/audit-middleware');
const DatabaseStorage = require('./lib/storage/database');
const JsonFileStorage = require('./lib/storage/json-file');
const WebhookStorage = require('./lib/storage/webhook');

module.exports = {
  AuditMiddleware,
  storage: {
    DatabaseStorage,
    JsonFileStorage,
    WebhookStorage
  },
}; 