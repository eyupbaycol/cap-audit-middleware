/**
 * Audit logs için UI servis tanımı
 */
const cds = require('@sap/cds');

class AuditLogService extends cds.ApplicationService {
  async init() {
    const { AuditLogs } = this.entities;
    
    // READ işlemleri
    this.on('READ', 'AuditLogs', async (req) => {
      // Filtreleme, sıralama ve sayfalama desteği
      return cds.tx(req).run(req.query);
    });
    
    // Detay görüntüleme
    this.on('getDetails', async (req) => {
      const { id } = req.data;
      const log = await cds.tx(req).run(SELECT.one.from('AuditLogs').where({ ID: id }));
      
      if (!log) {
        return req.reject(404, `Log kaydı bulunamadı: ${id}`);
      }
      
      // JSON stringlerini parse et
      try {
        if (log.data) log.data = JSON.parse(log.data);
        if (log.originalData) log.originalData = JSON.parse(log.originalData);
        if (log.changes) log.changes = JSON.parse(log.changes);
        if (log.result) log.result = JSON.parse(log.result);
      } catch (error) {
        console.warn('JSON parse hatası:', error);
      }
      
      return log;
    });
    
    // İstatistikler
    this.on('getStatistics', async (req) => {
      const { startDate, endDate, entity } = req.data;
      
      let query = SELECT.from('AuditLogs')
        .columns([
          'operation',
          'entity',
          { count: ['*'] }
        ])
        .groupBy('operation', 'entity');
      
      // Filtreleri uygula
      if (startDate) {
        query.where('timestamp >=', startDate);
      }
      if (endDate) {
        query.where('timestamp <=', endDate);
      }
      if (entity) {
        query.where('entity =', entity);
      }
      
      return cds.tx(req).run(query);
    });
    
    await super.init();
  }
}

module.exports = { AuditLogService }; 