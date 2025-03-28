# CAP Audit Middleware

SAP Cloud Application Programming (CAP) uygulamaları için audit log (denetim kaydı) tutmaya yarayan bir middleware kütüphanesi.

## Özellikler

- Entity bazlı veya tüm entityler için denetim kaydı tutma
- CREATE, UPDATE ve DELETE işlemleri için ayrı ayrı yapılandırılabilir loglama
- Farklı depolama seçenekleri:
  - Veritabanı depolama (CAP servisi üzerinden)
  - JSON dosya depolama
  - Webhook ile harici sistemlere gönderim
- İşlem öncesi ve sonrası verilerin kaydedilmesi
- İstenmeyen veya hassas verilerin filtrelenebilmesi
- Kullanıcı bilgisi çözümleme için özelleştirilebilir

## Kurulum

```bash
npm install cap-audit-middleware
```

## Kullanım

### Temel Kurulum

```javascript
const cds = require('@sap/cds');
const { AuditMiddleware, storage } = require('cap-audit-middleware');

module.exports = async (srv) => {
  // Denetim middleware'ini yapılandır
  const auditMiddleware = new AuditMiddleware({
    storage: new storage.DatabaseStorage({
      db: srv.context,
      table: 'AuditLogs'
    }),
    // İsteğe bağlı: belirli entityler için log tutma (boş bırakılırsa tümü)
    entities: ['Products', 'Orders'],
    // İsteğe bağlı: belirli işlemler için log tutma
    operations: ['CREATE', 'UPDATE', 'DELETE'],
    // İsteğe bağlı: kullanıcı bilgisi çözümleme
    userResolver: (req) => req.user?.id || 'anonymous',
    // İsteğe bağlı: request/response verilerini kaydetme
    logPayload: true
  });
  
  // Middleware'i servise bağla
  auditMiddleware.initialize(srv);
};
```

### Depolama Seçenekleri

#### Veritabanı Depolama

CDS veritabanınızı kullanarak denetim kayıtlarını saklar.

```javascript
const dbStorage = new storage.DatabaseStorage({
  db: srv,                           // CDS veritabanı servisi
  table: 'AuditLogs',                // İsteğe bağlı: tablo adı (varsayılan: 'ServiceLogs')
  autoCreateTable: true              // İsteğe bağlı: tablo yoksa otomatik oluştur (varsayılan: true)
});
```

#### JSON Dosya Depolama

Denetim kayıtlarını yerel bir JSON dosyasında saklar.

```javascript
const fileStorage = new storage.JsonFileStorage({
  filePath: './logs/audit-logs.json', // Dosya yolu
  prettyPrint: true,                  // İsteğe bağlı: JSON formatını okunaklı hale getir
  appendMode: true                    // İsteğe bağlı: Dosyaya ekleme modu (true) veya üzerine yazma (false)
});
```

#### Webhook Depolama

Denetim kayıtlarını harici bir API'ye HTTP isteği olarak gönderir.

```javascript
const webhookStorage = new storage.WebhookStorage({
  url: 'https://example.com/audit-webhook', // Webhook URL'i
  headers: {                                // İsteğe bağlı: HTTP başlıkları
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  timeout: 3000                             // İsteğe bağlı: İstek zaman aşımı (ms)
});
```

### Gelişmiş Yapılandırma

#### İşlem Öncesi Hook

Denetim kaydını saklamadan önce veriyi değiştirmek veya zenginleştirmek için:

```javascript
const auditMiddleware = new AuditMiddleware({
  storage: myStorage,
  // ... diğer seçenekler ...
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
```

## CDS Model Entegrasyonu

index.cds dosyasında tanımlanan AuditLogs aspect'ini kullanabilirsiniz:

```cds
using { sap.cap.auditLogs } from 'cap-audit-middleware';

entity MyAuditLogs : auditLogs.AuditLogs {
  // Ek özel alanlar ekleyebilirsiniz
  timestamp : Timestamp;
  ipAddress : String;
}
```

## Örnek Kullanım Senaryoları

### Sadece Belli Entityler için Audit Log Tutma

```javascript
const auditMiddleware = new AuditMiddleware({
  storage: myStorage,
  entities: ['Products', 'Orders', 'Customers'],
  operations: ['CREATE', 'UPDATE', 'DELETE']
});
```

### Sadece Belli İşlemler için Audit Log Tutma

```javascript
const auditMiddleware = new AuditMiddleware({
  storage: myStorage,
  operations: ['CREATE', 'DELETE'] // Sadece oluşturma ve silme işlemlerini logla
});
```

### Hassas Verileri Filtreleme

```javascript
const auditMiddleware = new AuditMiddleware({
  storage: myStorage,
  beforeLog: (logEntry) => {
    // Kullanıcı bilgilerindeki hassas alanları temizle
    if (logEntry.entity === 'Users' && logEntry.data) {
      delete logEntry.data.password;
      delete logEntry.data.creditCardNumber;
    }
  }
});
```

## Lisans

MIT
