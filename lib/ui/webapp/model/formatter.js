sap.ui.define([], function() {
  "use strict";
  
  return {
    /**
     * Tarih ve saat formatı
     * @param {Date} oDate - Tarih nesnesi
     * @returns {string} - Formatlanmış tarih ve saat
     */
    formatDateTime: function(oDate) {
      if (!oDate) {
        return "";
      }
      
      var oDateTimeInstance = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: "dd.MM.yyyy HH:mm:ss"
      });
      
      return oDateTimeInstance.format(new Date(oDate));
    },
    
    /**
     * JSON verilerini formatla
     * @param {Object|string} vData - JSON verisi
     * @returns {string} - Formatlanmış JSON
     */
    formatJSON: function(vData) {
      if (!vData) {
        return "";
      }
      
      try {
        var oData = typeof vData === "string" ? JSON.parse(vData) : vData;
        return JSON.stringify(oData, null, 2);
      } catch (oError) {
        return typeof vData === "string" ? vData : JSON.stringify(vData);
      }
    },
    
    /**
     * Başlık bilgisi formatı
     * @param {string} sEntity - Entity adı
     * @param {string} sOperation - İşlem türü
     * @returns {string} - Formatlanmış başlık
     */
    formatTitleInfo: function(sEntity, sOperation) {
      if (!sEntity || !sOperation) {
        return "";
      }
      
      return sEntity + " - " + sOperation;
    },
    
    /**
     * Detaylı bilgi formatı
     * @param {string} sEntity - Entity adı
     * @param {string} sOperation - İşlem türü
     * @param {string} sTimestamp - Zaman damgası
     * @returns {string} - Formatlanmış detaylı bilgi
     */
    formatDetailedInfo: function(sEntity, sOperation, sTimestamp) {
      if (!sEntity || !sOperation) {
        return "";
      }
      
      var sResult = sEntity + " - " + sOperation;
      
      if (sTimestamp) {
        sResult += " (" + this.formatDateTime(sTimestamp) + ")";
      }
      
      return sResult;
    },
    
    /**
     * Yüzde formatı
     * @param {number} fValue - Yüzde değeri
     * @returns {string} - Formatlanmış yüzde
     */
    formatPercentage: function(fValue) {
      if (fValue === undefined || fValue === null) {
        return "";
      }
      
      return fValue.toFixed(2) + "%";
    }
  };
}); 