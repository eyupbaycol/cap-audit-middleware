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

// Örnek 4: Kullanıcı arayüzü (UI) ile kullanım
async function setupWithUI() {
  // Express uygulaması oluştur (CAP projelerinde genellikle zaten vardır)
  const app = express();
  
  // CDS'i başlat
  const srv = await cds.connect.to('db');
  
  // Audit middleware'i yapılandır
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.DatabaseStorage({
      db: srv,
      table: 'AuditLogs'
    }),
    entities: ['Products', 'Orders', 'Customers'],
    operations: ['CREATE', 'UPDATE', 'DELETE']
  });
  
  // Middleware'i servise bağla
  auditMiddleware.initialize(srv);
  
  // Audit UI'ı entegre et
  ui.setupAuditUI(app, {
    mountPath: '/audit-ui' // UI'a erişim yolu
  });
  
  // Audit servisini başlat
  await ui.setupAuditService({
    db: srv // Veritabanı bağlantısı
  });
  
  console.log('Audit UI başarıyla kuruldu. http://localhost:4004/audit-ui adresinden erişebilirsiniz.');
  
  return { srv, app };
}

// Örnek 5: Tam CAP projesi entegrasyonu
async function setupFullCAPIntegration() {
  // Bu örnek, server.js veya app.js gibi ana uygulama dosyasında kullanılabilir
  
  // Express uygulaması oluştur
  const app = express();
  
  // CDS'i başlat
  cds.on('bootstrap', (app) => {
    // Audit UI'ı entegre et
    ui.setupAuditUI(app, {
      mountPath: '/audit-ui'
    });
  });
  
  // Servisler hazır olduğunda
  cds.on('served', async () => {
    // Ana servis
    const srv = await cds.connect.to('db');
    
    // Audit middleware'i yapılandır
    const auditMiddleware = new AuditMiddleware({
      storage: new storage.DatabaseStorage({
        db: srv,
        table: 'AuditLogs'
      })
    });
    
    // Tüm servislere audit middleware'i ekle
    for (const service of cds.services) {
      if (service.name !== 'AuditService') { // Audit servisinin kendisini hariç tut
        auditMiddleware.initialize(service);
      }
    }
    
    // Audit servisini başlat
    await ui.setupAuditService({
      db: srv
    });
    
    console.log('Audit sistemi başarıyla kuruldu.');
  });
  
  // CDS'i başlat
  return cds.serve('all').in(app);
}

// Örnek 6: Özel yapılandırma ile UI kullanımı
async function setupCustomizedUI() {
  const app = express();
  const srv = await cds.connect.to('db');
  
  // Audit middleware'i yapılandır
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.DatabaseStorage({
      db: srv,
      table: 'MyAuditLogs' // Özel tablo adı
    }),
    // Özel kullanıcı çözümleme
    userResolver: (req) => {
      return req.user?.id || req.headers['x-user-id'] || 'anonymous';
    },
    // Log kaydedilmeden önce çalışacak hook
    beforeLog: async (logEntry, req) => {
      // Hassas verileri temizle
      if (logEntry.entity === 'Users' && logEntry.data) {
        delete logEntry.data.password;
      }
      
      // Ek bilgiler ekle
      logEntry.applicationName = 'MyCapApp';
      logEntry.environment = process.env.NODE_ENV;
      logEntry.clientInfo = req.headers['user-agent'];
    }
  });
  
  // Middleware'i servise bağla
  auditMiddleware.initialize(srv);
  
  // Audit UI'ı özel yapılandırma ile entegre et
  ui.setupAuditUI(app, {
    mountPath: '/my-audit-dashboard', // Özel erişim yolu
    serveStatic: true
  });
  
  // Audit servisini özel yapılandırma ile başlat
  await ui.setupAuditService({
    db: srv,
    namespace: 'sap.audit' // CDS namespace
  });
  
  console.log('Özel yapılandırmalı Audit UI başarıyla kuruldu. http://localhost:4004/my-audit-dashboard adresinden erişebilirsiniz.');
  
  return { srv, app };
}

module.exports = {
  setupWithDatabaseStorage,
  setupWithJsonFileStorage,
  setupWithWebhookStorage,
  setupWithUI,
  setupFullCAPIntegration,
  setupCustomizedUI
}; 