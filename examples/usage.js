const cds = require('@sap/cds');
const { AuditMiddleware, storage} = require('cap-audit-middleware');

async function setupWithDatabaseStorage() {
  const srv = await cds.connect.to('db');
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.DatabaseStorage({
      db: srv,
      table: 'AuditLogs'
    }),
    entities: ['ProductService.Products', 'OrderService.Orders'], 
    operations: ['CREATE', 'UPDATE', 'DELETE'],
    userResolver: (req) => req.user?.id || 'system',
    logPayload: true
  });
  
  auditMiddleware.initialize(srv);

}

async function setupWithJsonFileStorage() {
  const srv = await cds.connect.to('db');
  
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.JsonFileStorage({
      filePath: './logs',
      prettyPrint: true,
      appendMode: true
    }),
    entities: ["ProductService.Products"],
    operations: ['CREATE', 'DELETE']
  });
  
  auditMiddleware.initialize(srv);
  
  return srv;
}

async function setupWithWebhookStorage() {
  const srv = await cds.connect.to('db');
  
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.WebhookStorage({
      url: 'https://example.com/audit-webhook',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      timeout: 3000
    }),
    beforeLog: async (logEntry, req) => {
      if (logEntry.entity === 'Users' && logEntry.data) {
        delete logEntry.data.password;
      }
      logEntry.applicationName = 'MyCapApp';
      logEntry.environment = process.env.NODE_ENV;
    }
  });
  
  auditMiddleware.initialize(srv);
  
  return srv;
}




module.exports = {
  setupWithDatabaseStorage,
  setupWithJsonFileStorage,
  setupWithWebhookStorage
}; 