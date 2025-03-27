const cds = require('@sap/cds');
const express = require('express');
const { AuditMiddleware, storage, ui } = require('cap-audit-middleware');

// Örnek 1: Veritabanı depolama ile kullanım
async function setupWithDatabaseStorage() {
  // CDS servisini başlat
  const srv = await cds.connect.to('db');
  
  // Audit middleware'i yapılandır
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.DatabaseStorage({
      db: srv,
      table: 'AuditLogs'
    }),
    entities: ['Products', 'Orders'], // Sadece bu entityler için log tutulacak
    operations: ['CREATE', 'UPDATE', 'DELETE'], // Tüm operasyonlar için log tutulacak
    userResolver: (req) => req.user?.id || 'system',
    logPayload: true
  });
  
  // Middleware'i servise bağla
  auditMiddleware.initialize(srv);
  
  return srv;
}

// Örnek 2: JSON dosya depolama ile kullanım
async function setupWithJsonFileStorage() {
  const srv = await cds.connect.to('db');
  
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.JsonFileStorage({
      filePath: './logs/audit-logs.json',
      prettyPrint: true,
      appendMode: true
    }),
    // Tüm entityler için log tutulacak (boş array)
    entities: [],
    // Sadece CREATE ve DELETE işlemleri için log tutulacak
    operations: ['CREATE', 'DELETE']
  });
  
  auditMiddleware.initialize(srv);
  
  return srv;
}

// Örnek 3: Webhook depolama ile kullanım
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
    // Log kaydedilmeden önce çalışacak hook
    beforeLog: async (logEntry, req) => {
      // Hassas verileri temizle
      if (logEntry.entity === 'Users' && logEntry.data) {
        delete logEntry.data.password;
      }
      // Ek bilgiler ekle
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