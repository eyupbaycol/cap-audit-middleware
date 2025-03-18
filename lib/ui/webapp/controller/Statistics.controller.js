sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "../model/formatter"
], function(Controller, JSONModel, formatter) {
  "use strict";

  return Controller.extend("sap.audit.controller.Statistics", {
    formatter: formatter,
    
    onInit: function() {
      this.getView().setModel(new JSONModel(), "statistics");
      this.getOwnerComponent().getRouter().getRoute("statistics").attachPatternMatched(this._onPatternMatched, this);
    },
    
    _onPatternMatched: function() {
      // Varsayılan istatistikleri yükle
      this._loadStatistics();
    },
    
    _loadStatistics: function() {
      var oView = this.getView();
      var oDateFilter = oView.byId("dateFilter");
      var sEntity = oView.byId("entityFilter").getSelectedKey();
      
      var oModel = this.getOwnerComponent().getModel();
      var oStatisticsModel = this.getView().getModel("statistics");
      
      var oParams = {};
      
      if (oDateFilter.getDateValue()) {
        oParams.startDate = oDateFilter.getDateValue();
      }
      
      if (oDateFilter.getSecondDateValue()) {
        oParams.endDate = oDateFilter.getSecondDateValue();
      }
      
      if (sEntity) {
        oParams.entity = sEntity;
      }
      
      oModel.callFunction("/getStatistics", {
        method: "POST",
        urlParameters: oParams,
        success: function(oData) {
          // İstatistik verilerini işle
          var aResults = oData.results || [];
          var aOperations = [];
          var aEntities = [];
          var aDetails = [];
          var iTotalCount = 0;
          
          // Toplam sayıyı hesapla
          aResults.forEach(function(oItem) {
            iTotalCount += oItem.count;
          });
          
          // İşlem bazlı istatistikler
          var oOperationCounts = {};
          aResults.forEach(function(oItem) {
            if (!oOperationCounts[oItem.operation]) {
              oOperationCounts[oItem.operation] = 0;
            }
            oOperationCounts[oItem.operation] += oItem.count;
          });
          
          Object.keys(oOperationCounts).forEach(function(sOperation) {
            aOperations.push({
              operation: sOperation,
              count: oOperationCounts[sOperation]
            });
          });
          
          // Entity bazlı istatistikler
          var oEntityCounts = {};
          aResults.forEach(function(oItem) {
            if (!oEntityCounts[oItem.entity]) {
              oEntityCounts[oItem.entity] = 0;
            }
            oEntityCounts[oItem.entity] += oItem.count;
          });
          
          Object.keys(oEntityCounts).forEach(function(sEntity) {
            aEntities.push({
              entity: sEntity,
              count: oEntityCounts[sEntity]
            });
          });
          
          // Detaylı istatistikler
          aResults.forEach(function(oItem) {
            aDetails.push({
              entity: oItem.entity,
              operation: oItem.operation,
              count: oItem.count,
              percentage: (oItem.count / iTotalCount) * 100
            });
          });
          
          // Modeli güncelle
          oStatisticsModel.setData({
            operations: aOperations,
            entities: aEntities,
            details: aDetails,
            totalCount: iTotalCount
          });
        },
        error: function(oError) {
          console.error("İstatistikler yüklenirken hata oluştu:", oError);
          sap.m.MessageBox.error("İstatistikler yüklenemedi.");
        }
      });
    },
    
    onDateRangeChange: function() {
      // Tarih aralığı değiştiğinde yapılacak işlemler
    },
    
    onApplyFilters: function() {
      this._loadStatistics();
    },
    
    onNavBack: function() {
      this.getOwnerComponent().getRouter().navTo("main");
    }
  });
}); 