/**
 * UI entegrasyonu için yardımcı fonksiyonlar
 */
const path = require('path');
const express = require('express');

/**
 * Audit UI'ı CAP uygulamasına entegre eder
 * @param {Object} app - Express uygulaması
 * @param {Object} options - Yapılandırma seçenekleri
 * @param {string} [options.mountPath='/audit-ui'] - UI'ın mount edileceği yol
 * @param {boolean} [options.serveStatic=true] - Statik dosyaları serve etme
 * @returns {Object} - Express uygulaması
 */
function setupAuditUI(app, options = {}) {
  const mountPath = options.mountPath || '/audit-ui';
  const serveStatic = options.serveStatic !== false;
  
  // Statik dosyaları serve et
  if (serveStatic) {
    const webappPath = path.join(__dirname, 'webapp');
    app.use(mountPath, express.static(webappPath));
  }
  
  return app;
}

/**
 * Audit servisini CAP uygulamasına entegre eder
 * Bu fonksiyon, CDS servisini manuel olarak tanımlar
 * @param {Object} options - Yapılandırma seçenekleri
 * @param {Object} [options.db] - Veritabanı bağlantısı
 * @returns {Promise<void>}
 */
async function setupAuditService(options = {}) {
  console.log('Audit servisi başlatılıyor...');
  console.log('Not: Bu fonksiyon şu anda sadece UI statik dosyalarını serve eder.');
  console.log('Tam servis entegrasyonu için lütfen ana CAP uygulamanızda audit-model.cds dosyasını manuel olarak tanımlayın.');
  
  // Bu basitleştirilmiş versiyonda, sadece UI dosyalarını serve ediyoruz
  // Gerçek servis entegrasyonu için, kullanıcının ana CAP uygulamasında
  // audit-model.cds dosyasını manuel olarak tanımlaması gerekecek
  
  return Promise.resolve();
}

module.exports = {
  setupAuditUI,
  setupAuditService
}; 